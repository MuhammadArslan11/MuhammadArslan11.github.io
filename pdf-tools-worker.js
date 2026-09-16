/* Files stay in this worker; there are no network or storage writes. */
importScripts('vendor/pdf-tools/pdf-lib.min.js', 'pdf-tools-core.js?v=1.0.0');

async function normalizeImage(file) {
  const bitmap = await createImageBitmap(file, {imageOrientation: 'from-image'});
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    const blob = await canvas.convertToBlob({type: 'image/jpeg', quality: 0.95});
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    bitmap.close();
  }
}

self.onmessage = async ({data: {action, files, options}}) => {
  try {
    const result = action === 'inspect'
      ? await ResumePDFToolsCore.inspect(files, options.tool, PDFLib)
      : await ResumePDFToolsCore.process(files, options, PDFLib,
        typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap === 'function' ? normalizeImage : undefined);
    self.postMessage({result}, result.bytes ? [result.bytes.buffer] : []);
  } catch (error) {
    self.postMessage({error: error.message || 'The file could not be processed. Please try another file.'});
  }
};
