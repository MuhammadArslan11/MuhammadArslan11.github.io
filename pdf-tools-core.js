/* PDF operations shared by the background worker and regression tests. */
((root) => {
  'use strict';
  const MAX_BYTES = 50 * 1024 * 1024;
  const MAX_FILES = 20;
  const MAX_PAGES = 500;

  function parsePages(value, count, allowAll = false) {
    const text = String(value || '').trim();
    if (!text && allowAll) return Array.from({length: count}, (_, i) => i);
    if (!text) throw new Error('Enter the page numbers you want, for example 1, 3-5.');
    const pages = new Set();
    for (const part of text.split(',')) {
      const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!match) throw new Error('Use page numbers or ranges separated by commas, for example 1, 3-5.');
      const start = Number(match[1]), end = Number(match[2] || match[1]);
      if (start < 1 || end > count || start > end) throw new Error(`Choose pages from 1 to ${count}, with ranges in ascending order.`);
      for (let page = start; page <= end; page++) pages.add(page - 1);
    }
    return [...pages];
  }

  function validateFiles(files, tool) {
    if (!files.length) throw new Error('Choose a file to get started.');
    const multiple = tool === 'merge' || tool === 'images';
    if (!multiple && files.length !== 1) throw new Error('Choose one PDF for this tool.');
    if (files.length > MAX_FILES) throw new Error('Choose up to 20 files at a time.');
    if (files.reduce((total, file) => total + file.size, 0) > MAX_BYTES) throw new Error('Choose files totalling 50 MB or less.');
    for (const file of files) {
      if (!file.size) throw new Error(`${file.name} is empty. Choose another file.`);
      const valid = tool === 'images' ? /\.(png|jpe?g)$/i.test(file.name) : /\.pdf$/i.test(file.name);
      if (!valid) throw new Error(tool === 'images' ? 'Choose JPG or PNG images.' : 'Choose PDF files only.');
    }
  }

  async function loadPDF(file, lib) {
    let doc;
    try {
      doc = await lib.PDFDocument.load(await file.arrayBuffer(), {updateMetadata: false});
    } catch (error) {
      if (/encrypt/i.test(error.message)) throw new Error(`${file.name} is password protected. Choose an unlocked copy.`);
      throw new Error(`${file.name} could not be read as a PDF. Try another file.`);
    }
    if (!doc.getPageCount()) throw new Error(`${file.name} has no pages.`);
    const fields = doc.getForm().getFields();
    if (fields.some(field => field instanceof lib.PDFSignature)) {
      throw new Error(`${file.name} has a signature field. Use an unsigned copy to avoid invalidating a signature.`);
    }
    return {doc, hasForm: fields.length > 0};
  }

  async function loadImage(file, doc, normalizeImage) {
    try {
      let bytes = new Uint8Array(await file.arrayBuffer());
      const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
      const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      if (!jpeg && !png) throw new Error('format');
      let image = jpeg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
      if (image.width * image.height > 32_000_000) throw new Error('dimensions');
      // Browser image decoding honors phone-camera EXIF orientation.
      if (jpeg && normalizeImage) {
        bytes = await normalizeImage(file);
        image = await doc.embedJpg(bytes);
      }
      return image;
    } catch (error) {
      if (error.message === 'dimensions') throw new Error(`${file.name} is too large to process. Use an image under 32 megapixels.`);
      throw new Error(`${file.name} could not be read. Choose a valid JPG or PNG image.`);
    }
  }

  async function inspect(files, tool, lib) {
    validateFiles(files, tool);
    const details = [];
    for (const file of files) {
      if (tool === 'images') {
        const doc = await lib.PDFDocument.create();
        const image = await loadImage(file, doc);
        details.push({pages: 1, width: image.width, height: image.height});
      } else {
        const {doc, hasForm} = await loadPDF(file, lib);
        if (hasForm && ['merge', 'extract', 'remove'].includes(tool)) {
          throw new Error(`${file.name} contains interactive form fields. Use a flattened copy for merging or changing its pages.`);
        }
        details.push({pages: doc.getPageCount()});
      }
    }
    if (details.reduce((sum, info) => sum + info.pages, 0) > MAX_PAGES) throw new Error('Choose up to 500 pages at a time.');
    return details;
  }

  async function process(files, options, lib, normalizeImage) {
    const {tool} = options;
    if (!['merge', 'extract', 'rotate', 'remove', 'images', 'optimize'].includes(tool)) throw new Error('Choose a PDF tool.');
    await inspect(files, tool, lib);
    if (tool === 'merge' && files.length < 2) throw new Error('Add at least two PDFs to merge.');
    let output;
    if (tool === 'merge' || tool === 'images' || tool === 'extract') {
      output = await lib.PDFDocument.create();
      output.setCreator('Resume Builder PDF Tools');
    }
    if (tool === 'images') {
      const size = options.paper === 'letter' ? lib.PageSizes.Letter : lib.PageSizes.A4;
      for (const file of files) {
        const image = await loadImage(file, output, normalizeImage);
        const page = output.addPage(size);
        const fit = image.scaleToFit(size[0] - 48, size[1] - 48);
        page.drawImage(image, {x: (size[0] - fit.width) / 2, y: (size[1] - fit.height) / 2, ...fit});
      }
    } else if (tool === 'merge') {
      for (const file of files) {
        const {doc} = await loadPDF(file, lib);
        for (const page of await output.copyPages(doc, doc.getPageIndices())) output.addPage(page);
      }
    } else {
      const {doc} = await loadPDF(files[0], lib);
      if (tool === 'extract') {
        for (const page of await output.copyPages(doc, parsePages(options.pages, doc.getPageCount()))) output.addPage(page);
      } else {
        output = doc;
        if (tool === 'remove') {
          const pages = parsePages(options.pages, doc.getPageCount());
          if (pages.length === doc.getPageCount()) throw new Error('Keep at least one page in the PDF.');
          pages.sort((a, b) => b - a).forEach(index => doc.removePage(index));
        }
        if (tool === 'rotate') {
          const angle = Number(options.angle);
          if (![90, 180, 270].includes(angle)) throw new Error('Choose a rotation angle.');
          for (const index of parsePages(options.pages, doc.getPageCount(), true)) {
            const page = doc.getPage(index);
            page.setRotation(lib.degrees((page.getRotation().angle + angle) % 360));
          }
        }
      }
    }
    let bytes = await output.save({useObjectStreams: true, updateFieldAppearances: false});
    const originalSize = files.reduce((sum, file) => sum + file.size, 0);
    let unchanged = false;
    if (tool === 'optimize' && bytes.length >= originalSize) {
      bytes = new Uint8Array(await files[0].arrayBuffer());
      unchanged = true;
    }
    return {bytes, pages: output.getPageCount(), originalSize, unchanged};
  }

  const api = {parsePages, validateFiles, inspect, process};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ResumePDFToolsCore = api;
})(globalThis);
