/* Small PDF utilities, isolated from the resume draft and export workflow. */
(() => {
  'use strict';
  const icons = {
    merge: '<rect x="3" y="3" width="12" height="15" rx="2"/><path d="M9 18v3h12V8h-6M7 8h4M7 12h4"/>',
    extract: '<path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8M8 16h4M3 10H1m2 4H1"/>',
    rotate: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/><path d="M10 7h5v10h-5z"/>',
    remove: '<path d="M14 2H5v20h14V7zM14 2v5h5M9 12l6 6m0-6-6 6"/>',
    images: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',
    optimize: '<path d="M8 3v5H3m18 0h-5V3M3 16h5v5m8 0v-5h5M3 3l5 5m13-5-5 5M3 21l5-5m13 5-5-5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    up: '<path d="m5 14 7-7 7 7"/>', down: '<path d="m5 10 7 7 7-7"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  const tools = {
    merge: {title: 'Merge PDFs', short: 'Combine your documents', description: 'Combine a resume, cover letter, and certificates into one PDF. Use the arrows to set the file order.', action: 'Merge PDFs', multiple: true},
    extract: {title: 'Split / extract', short: 'Keep the pages you need', description: 'Save selected pages as a new PDF. Enter pages in the order you want, such as 3, 1-2.', action: 'Extract pages', ranges: true},
    rotate: {title: 'Rotate pages', short: 'Turn pages the right way', description: 'Rotate all pages or just a selection. Text stays selectable and the original file stays unchanged.', action: 'Rotate pages', ranges: true},
    remove: {title: 'Remove pages', short: 'Drop unwanted pages', description: 'Remove blank or unwanted pages from a copy of your PDF. Keep at least one page.', action: 'Remove pages', ranges: true},
    images: {title: 'Images to PDF', short: 'Turn JPGs and PNGs into a PDF', description: 'Place each image on its own page with clean margins. Use the arrows to arrange the images.', action: 'Create PDF', multiple: true},
    optimize: {title: 'Optimize PDF', short: 'Try lossless compression', description: 'Try reducing file size without lowering image quality or losing selectable text. Scanned or already optimized PDFs may not get smaller.', action: 'Optimize PDF'}
  };
  const dialog = document.createElement('dialog');
  dialog.id = 'pdfToolsDialog';
  dialog.className = 'pdf-tools-dialog';
  dialog.setAttribute('aria-labelledby', 'pdfToolsTitle');
  dialog.innerHTML = `
    <header class="pdf-tools-header">
      <div><span class="pdf-tools-eyebrow">${svg('lock')} Files stay on your device</span><h2 id="pdfToolsTitle">Everyday PDF tools</h2><p>Prepare your application documents, right here. Choose a tool to get started.</p></div>
      <button class="pdf-tools-close" type="button" aria-label="Close PDF tools">${svg('close')}</button>
    </header>
    <div class="pdf-tools-grid" role="group" aria-label="Choose a PDF tool">
      ${Object.entries(tools).map(([key, tool]) => `<button class="pdf-tool-card" type="button" data-pdf-tool="${key}" aria-pressed="${key === 'merge'}">${svg(key)}<strong>${tool.title}</strong><small>${tool.short}</small></button>`).join('')}
    </div>
    <form class="pdf-tools-workspace" id="pdfToolsForm" novalidate>
      <h3 id="pdfToolHeading">Merge PDFs</h3><p class="pdf-tools-description" id="pdfToolDescription"></p>
      <div class="pdf-tools-dropzone" id="pdfToolsDropzone">
        <div><strong id="pdfToolsFilePrompt">Choose PDF files or drop them here</strong><small id="pdfToolsFileHint">Up to 20 files · 50 MB total · 500 pages</small></div>
        <button class="tool-button" id="pdfToolsChoose" type="button">Choose files</button>
        <input id="pdfToolsFiles" type="file" accept=".pdf,application/pdf" multiple hidden>
      </div>
      <ol class="pdf-tools-file-list" id="pdfToolsFileList" aria-label="Selected files"></ol>
      <div class="pdf-tools-settings">
        <label class="pdf-tools-field" id="pdfToolsPagesField" hidden><span id="pdfToolsPagesLabel">Pages</span><input id="pdfToolsPages" placeholder="e.g. 1, 3-5" maxlength="2000" aria-describedby="pdfToolsPagesHint pdfToolsStatus"><small id="pdfToolsPagesHint"></small></label>
        <label class="pdf-tools-field" id="pdfToolsAngleField" hidden>Rotation<select id="pdfToolsAngle"><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">90° counterclockwise</option></select></label>
        <label class="pdf-tools-field" id="pdfToolsPaperField" hidden>Paper size<select id="pdfToolsPaper"><option value="a4">A4</option><option value="letter">US Letter</option></select></label>
        <label class="pdf-tools-field">Output file name<input id="pdfToolsName" maxlength="100" value="merged-document" autocomplete="off"><small>A new .pdf file will be created.</small></label>
      </div>
      <p class="pdf-tools-status" id="pdfToolsStatus" role="status" aria-live="polite" aria-atomic="true"></p>
      <section class="pdf-tools-result" id="pdfToolsResult" aria-label="Completed PDF" hidden>
        <div><strong id="pdfToolsResultName"></strong><p id="pdfToolsResultInfo"></p></div><a class="tool-button primary" id="pdfToolsDownload" download>Download PDF</a>
      </section>
      <footer class="pdf-tools-footer"><small>Files are cleared when you close these tools.</small><button class="tool-button primary" id="pdfToolsRun" type="submit" disabled>Merge PDFs</button><button class="tool-button" id="pdfToolsCancel" type="button" hidden>Cancel processing</button></footer>
    </form>`;
  document.body.append(dialog);
  const $ = id => dialog.querySelector(`#${id}`);
  const core = window.ResumePDFToolsCore;
  let selectedTool = 'merge', entries = [], busy = false, worker, rejectJob, resultURL, opener;
  const sizes = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const filename = value => (value.trim().replace(/\.pdf$/i, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/g, '') || 'document') + '.pdf';

  function status(message = '', error = false) {
    $('pdfToolsStatus').textContent = message;
    $('pdfToolsStatus').dataset.error = String(error);
  }
  function clearResult() {
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = null;
    $('pdfToolsResult').hidden = true;
    $('pdfToolsDownload').removeAttribute('href');
  }
  function setBusy(value) {
    busy = value;
    dialog.setAttribute('aria-busy', String(value));
    dialog.querySelectorAll('button, input, select').forEach(el => {
      if (el.matches('.pdf-tools-close,#pdfToolsCancel')) return;
      el.disabled = value;
    });
    $('pdfToolsRun').hidden = value;
    $('pdfToolsCancel').hidden = !value;
    if (!value) renderFiles();
  }
  function request(action, files) {
    return new Promise((resolve, reject) => {
      rejectJob = reject;
      try {
        worker = new Worker('pdf-tools-worker.js?v=1.0.0');
        worker.onmessage = ({data}) => {
          worker.terminate(); worker = null; rejectJob = null;
          data.error ? reject(new Error(data.error)) : resolve(data.result);
        };
        worker.onerror = event => {
          event.preventDefault(); worker.terminate(); worker = null; rejectJob = null;
          reject(new Error('PDF tools could not load. Refresh the page and try again.'));
        };
        worker.postMessage({action, files, options: {tool: selectedTool, pages: $('pdfToolsPages').value, angle: $('pdfToolsAngle').value, paper: $('pdfToolsPaper').value}});
      } catch {
        worker?.terminate(); worker = null; rejectJob = null;
        reject(new Error('PDF tools need a browser with background worker support. Try a current version of Chrome, Safari, Edge, or Firefox.'));
      }
    });
  }
  function cancelJob() {
    worker?.terminate(); worker = null;
    rejectJob?.(new DOMException('Processing cancelled.', 'AbortError'));
    rejectJob = null;
  }
  function actionButton(icon, label, action, disabled = false) {
    const button = document.createElement('button');
    button.type = 'button'; button.innerHTML = svg(icon); button.disabled = disabled;
    button.setAttribute('aria-label', label); button.title = label;
    button.addEventListener('click', action);
    return button;
  }
  function renderFiles() {
    const list = $('pdfToolsFileList'); list.replaceChildren();
    entries.forEach(({file, info}, index) => {
      const row = document.createElement('li'); row.className = 'pdf-tools-file';
      const number = document.createElement('span'); number.className = 'pdf-tools-file-number'; number.textContent = index + 1;
      const details = document.createElement('div'); details.className = 'pdf-tools-file-info';
      const name = document.createElement('strong'); name.textContent = file.name;
      const meta = document.createElement('small');
      meta.textContent = `${sizes(file.size)} · ${info.width ? `${info.width} × ${info.height} px` : `${info.pages} page${info.pages === 1 ? '' : 's'}`}`;
      details.append(name, meta);
      const actions = document.createElement('div'); actions.className = 'pdf-tools-file-actions';
      const change = mutate => {mutate(); clearResult(); status(); renderFiles(); $('pdfToolsChoose').focus();};
      if (tools[selectedTool].multiple) {
        actions.append(actionButton('up', `Move ${file.name} earlier`, () => change(() => [entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]), busy || index === 0));
        actions.append(actionButton('down', `Move ${file.name} later`, () => change(() => [entries[index + 1], entries[index]] = [entries[index], entries[index + 1]]), busy || index === entries.length - 1));
      }
      actions.append(actionButton('close', `Remove ${file.name}`, () => change(() => entries.splice(index, 1)), busy));
      row.append(number, details, actions); list.append(row);
    });
    $('pdfToolsRun').disabled = busy || entries.length < (selectedTool === 'merge' ? 2 : 1);
    $('pdfToolsChoose').textContent = entries.length ? (tools[selectedTool].multiple ? 'Add files' : 'Replace file') : 'Choose files';
    const count = entries[0]?.info.pages;
    $('pdfToolsPagesHint').textContent = count ? `${count} page${count === 1 ? '' : 's'} available. ${selectedTool === 'rotate' ? 'Leave blank to rotate all pages.' : 'Use commas and ranges, e.g. 1, 3-5.'}` : 'Choose a PDF to see its page count.';
  }
  function chooseTool(key) {
    if (busy || key === selectedTool && entries.length) return;
    const previous = selectedTool;
    selectedTool = key; clearResult(); status();
    if (key === 'images' || previous === 'images' || entries.length > 1) entries = [];
    dialog.querySelectorAll('[data-pdf-tool]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pdfTool === key)));
    const tool = tools[key];
    $('pdfToolHeading').textContent = tool.title;
    $('pdfToolDescription').textContent = tool.description;
    $('pdfToolsFiles').accept = key === 'images' ? '.jpg,.jpeg,.png,image/jpeg,image/png' : '.pdf,application/pdf';
    $('pdfToolsFiles').multiple = Boolean(tool.multiple);
    $('pdfToolsFilePrompt').textContent = key === 'images' ? 'Choose images or drop them here' : `Choose ${tool.multiple ? 'PDF files' : 'a PDF'} or drop ${tool.multiple ? 'them' : 'it'} here`;
    $('pdfToolsFileHint').textContent = `${tool.multiple ? 'Up to 20 files' : 'One PDF'} · 50 MB total${key === 'images' ? ' · JPG / PNG' : ' · 500 pages'}`;
    $('pdfToolsPagesField').hidden = !tool.ranges;
    $('pdfToolsAngleField').hidden = key !== 'rotate';
    $('pdfToolsPaperField').hidden = key !== 'images';
    $('pdfToolsPagesLabel').textContent = key === 'remove' ? 'Pages to remove' : key === 'rotate' ? 'Pages to rotate (optional)' : 'Pages to extract';
    $('pdfToolsPages').value = ''; $('pdfToolsPages').removeAttribute('aria-invalid');
    $('pdfToolsName').value = key === 'merge' ? 'merged-document' : key === 'images' ? 'images' : `${key}-document`;
    $('pdfToolsRun').textContent = tool.action;
    renderFiles();
  }
  async function addFiles(files) {
    if (busy || !files.length) return;
    clearResult();
    const combined = tools[selectedTool].multiple ? [...entries.map(entry => entry.file), ...files] : files;
    try {
      core.validateFiles(combined, selectedTool);
      setBusy(true); status('Reading files on your device…');
      const details = await request('inspect', combined);
      entries = combined.map((file, index) => ({file, info: details[index]}));
      if (!tools[selectedTool].multiple) $('pdfToolsName').value = `${combined[0].name.replace(/\.pdf$/i, '')}-${selectedTool}`;
      status(`${entries.length} file${entries.length === 1 ? '' : 's'} ready. ${selectedTool === 'merge' && entries.length === 1 ? 'Add another PDF to merge.' : 'Review your settings below.'}`);
    } catch (error) {
      status(error.name === 'AbortError' ? 'Processing cancelled. Your files are unchanged.' : error.message, error.name !== 'AbortError');
    } finally {
      setBusy(false); $('pdfToolsFiles').value = '';
    }
  }

  document.querySelectorAll('[data-open-pdf-tools]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    document.querySelector('.toolbar-more').open = false;
    dialog.showModal(); dialog.querySelector(`[data-pdf-tool="${selectedTool}"]`).focus();
  }));
  dialog.querySelector('.pdf-tools-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    cancelJob(); entries = []; clearResult(); status(); renderFiles();
    // The mobile menu closes behind the dialog; focus its visible trigger.
    if (opener?.getClientRects().length) opener.focus();
    else document.querySelector('[data-mobile-action="more"]')?.focus();
  });
  dialog.querySelectorAll('[data-pdf-tool]').forEach(button => button.addEventListener('click', () => chooseTool(button.dataset.pdfTool)));
  $('pdfToolsChoose').addEventListener('click', () => $('pdfToolsFiles').click());
  $('pdfToolsFiles').addEventListener('change', event => addFiles([...event.target.files]));
  $('pdfToolsCancel').addEventListener('click', cancelJob);
  const dropzone = $('pdfToolsDropzone');
  ['dragover', 'dragenter'].forEach(type => dropzone.addEventListener(type, event => {event.preventDefault(); if (!busy) dropzone.dataset.dragging = 'true';}));
  ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, () => {dropzone.dataset.dragging = 'false';}));
  dropzone.addEventListener('drop', event => {event.preventDefault(); addFiles([...event.dataTransfer.files]);});
  $('pdfToolsForm').addEventListener('input', () => {clearResult(); status(); $('pdfToolsPages').removeAttribute('aria-invalid');});
  $('pdfToolsForm').addEventListener('change', event => {if (event.target !== $('pdfToolsFiles')) {clearResult(); status();}});
  $('pdfToolsForm').addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !entries.length) return;
    clearResult();
    try {
      if (tools[selectedTool].ranges) {
        try {
          const pages = core.parsePages($('pdfToolsPages').value, entries[0].info.pages, selectedTool === 'rotate');
          if (selectedTool === 'remove' && pages.length === entries[0].info.pages) throw new Error('Keep at least one page in the PDF.');
        } catch (error) {
          $('pdfToolsPages').setAttribute('aria-invalid', 'true'); $('pdfToolsPages').focus(); throw error;
        }
      }
      setBusy(true); status('Preparing your PDF on this device…');
      const result = await request('process', entries.map(entry => entry.file));
      const blob = new Blob([result.bytes], {type: 'application/pdf'});
      resultURL = URL.createObjectURL(blob);
      const name = filename($('pdfToolsName').value);
      $('pdfToolsResultName').textContent = name;
      let detail = `${result.pages} page${result.pages === 1 ? '' : 's'} · ${sizes(blob.size)}`;
      if (selectedTool === 'optimize') detail += result.unchanged ? ' · Already optimized. Your original file is ready to download.' : ` · ${Math.round((1 - blob.size / result.originalSize) * 100)}% smaller (was ${sizes(result.originalSize)})`;
      $('pdfToolsResultInfo').textContent = detail;
      $('pdfToolsDownload').href = resultURL; $('pdfToolsDownload').download = name;
      $('pdfToolsResult').hidden = false;
      status('Your PDF is ready. Choose Download PDF to save it.');
      $('pdfToolsDownload').focus();
    } catch (error) {
      status(error.name === 'AbortError' ? 'Processing cancelled. Your files are unchanged.' : error.message, error.name !== 'AbortError');
    } finally {
      setBusy(false);
    }
  });
  chooseTool('merge');
})();
