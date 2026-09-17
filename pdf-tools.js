/* Local-only visual PDF workspace. Source bytes never change. */
(() => {
  'use strict';
  const M = window.PDFWorkspaceModel;
  const dialog = document.createElement('dialog');
  dialog.id = 'pdfToolsDialog'; dialog.className = 'pdf-tools-dialog';
  dialog.setAttribute('aria-labelledby', 'pdfToolsTitle');
  const iconPaths = {
    add:'M12 5v14M5 12h14', addPane:'M12 5v14M5 12h14',
    preview:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    rotate:'M20 7v5h-5M20 12a8 8 0 1 0-3 6', rotateLeft:'M4 7v5h5M4 12a8 8 0 1 1 3 6',
    duplicate:'M9 9h12v12H9zM15 9V3H3v12h6', extract:'M14 3H4v18h16V11M12 12 22 2M16 2h6v6',
    remove:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',
    undo:'M4 10h10a6 6 0 0 1 0 12M4 10l5-5M4 10l5 5', redo:'M20 10H10a6 6 0 0 0 0 12M20 10l-5-5M20 10l-5 5',
    export:'M12 3v12M7 10l5 5 5-5M4 15v6h16v-6', close:'M6 6l12 12M18 6 6 18',closePreview:'M6 6l12 12M18 6 6 18'
  };
  const button = (action, label, extra = '') => {
    const path = iconPaths[action];
    const text = path ? label.replace(/^[＋◉↻↺⧉⇥−↶↷↓×]\s*/, '') : label;
    const icon = path ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>` : '';
    return `<button type="button" data-action="${action}" ${extra}>${icon}${text ? `<span>${text}</span>` : ''}</button>`;
  };
  dialog.innerHTML = `
    <header class="pw-header"><div class="pw-brand"><span class="pw-logo" aria-hidden="true">▤</span><div><span class="pw-eyebrow">DOCUMENT STUDIO</span><h2 id="pdfToolsTitle">PDF Workspace</h2></div><span class="pw-private">● Files stay on your device</span></div><div class="pw-header-actions">${button('undo','↶ Undo','title="Undo (Ctrl/Cmd+Z)"')}${button('redo','↷ Redo','title="Redo (Ctrl/Cmd+Shift+Z)"')}${button('reset','Reset','title="Clear all files and start again"')}${button('close','×','aria-label="Close PDF workspace" class="pw-close" title="Close; your workspace stays in this tab"')}</div></header>
    <div class="pw-layout">
      <aside id="pwToolsPanel" class="pw-sidebar" aria-label="PDF tools"><div class="pw-section-label">YOUR WORKSPACE</div>
        ${button('add','＋ Add PDF / images','class="pw-primary"')}
        <input type="file" id="pwFiles" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" multiple hidden>
        <p class="pw-hint">Drop files into any document.<br>PDF, JPG or PNG · 50 MB total</p>
        <div class="pw-section-label">PAGE TOOLS <span id="pwSelected">0 selected</span></div>
        <div class="pw-tools">${button('preview','◉ Preview page')}${button('rotate','↻ Rotate right')}${button('rotateLeft','↺ Rotate left')}${button('duplicate','⧉ Duplicate')}${button('extract','⇥ Extract to new pane')}${button('remove','− Remove pages','class="pw-danger"')}</div>
        <div class="pw-section-label">ARRANGE SELECTION</div>
        <div class="pw-pair">${button('first','⇤ First')}${button('last','Last ⇥')}${button('up','↑ Earlier')}${button('down','↓ Later')}</div>
        <label>Final page position<div class="pw-inline"><input id="pwPosition" type="number" min="1" value="1" aria-label="Page position">${button('position','Go')}</div></label>
        <label>Destination document<select id="pwDestination"></select></label>
        <div class="pw-pair">${button('move','Move pages')}${button('copy','Copy pages')}</div>
        <div class="pw-sidebar-bottom"><strong>One workspace. Every page.</strong><p>Click to select · Ctrl / ⌘ for multiple<br>Shift for a range · Drag to arrange<br>Right-click or ⋯ for page actions<br>Your workspace stays in this tab.<br>Use Reset to clear all files.</p></div>
      </aside>
      <main class="pw-main"><div class="pw-workbar"><div><strong id="pwSummary">Your documents, in order.</strong><small>Arrange, combine and refine before you download.</small></div><div class="pw-view-controls">${button('toggleTools','Tools','aria-expanded="true" aria-controls="pwToolsPanel"')}${button('toggleExport','Export','aria-expanded="true" aria-controls="pwExportPanel"')}<label class="pw-view-label">View<select id="pwView"><option value="grid">Grid</option><option value="list">Large pages</option></select></label><label class="pw-zoom">Page size <input id="pwZoom" type="range" min="110" max="270" value="160"></label>${button('addPane','＋ Document')}</div></div>
        <div class="pw-selectionbar"><div>${button('selectAll','Select all')}${button('clear','Deselect')}<span id="pwActiveLabel"></span></div><div class="pw-range"><input id="pwRange" placeholder="Pages: 1, 3-5" aria-label="Select page numbers or ranges">${button('range','Select')}</div></div>
        <div id="pwTabs" class="pw-tabs" role="tablist" aria-label="Document views"></div><div id="pwPanes" class="pw-panes"></div>
        <footer class="pw-statusbar"><progress id="pwProgress" aria-label="PDF processing progress" hidden></progress><span id="pwStatus" role="status" aria-live="polite">Add a PDF to start. Your original files stay unchanged.</span>${button('cancel','Cancel processing','hidden id="pwCancel"')}</footer>
      </main>
      <aside id="pwExportPanel" class="pw-export" aria-label="Export settings"><span class="pw-section-label">READY WHEN YOU ARE</span><h3>Export your PDF</h3><p class="pw-hint">The page order you see is the order you download.</p>
        <label>Export from<select id="pwExportSource"></select></label>
        <label>Pages<select id="pwScope"><option value="all">All pages in document</option><option value="selected">Selected pages only</option></select></label>
        <label>File name<input id="pwName" value="my-document" maxlength="100" autocomplete="off"></label>
        <label>Page size<select id="pwPaper"><option value="original">Original page sizes</option><option value="a4">A4 · 210 × 297 mm</option><option value="letter">US Letter · 8.5 × 11 in</option><option value="legal">US Legal · 8.5 × 14 in</option></select></label>
        <label>Quality<select id="pwQuality"><option value="original">Full high quality · original</option><option value="best">Best · 200 DPI image PDF</option><option value="good">Good · 144 DPI image PDF</option><option value="normal">Normal · 96 DPI image PDF</option></select></label>
        <div id="pwExportSummary" class="pw-export-summary" aria-live="polite"></div><p id="pwQualityHint" class="pw-quality-note"></p>
        ${button('export','↓ Prepare download','class="pw-primary" id="pwExport"')}
        <section id="pwResult" class="pw-result" hidden><strong id="pwResultTitle"></strong><span id="pwResultInfo"></span><a id="pwDownload" download>↓ Download PDF</a></section>
        <div class="pw-export-tip"><strong>Clean pages. Predictable output.</strong><p>Original sizes preserve the layout. Other sizes fit and center each page without cropping or stretching.</p></div>
      </aside>
    </div>
    <div id="pwMenu" class="pw-menu" role="menu" aria-label="Page actions" hidden>${['preview','rotate','duplicate','extract','first','last','remove'].map(a => button(a,({preview:'Preview page',rotate:'Rotate 90°',duplicate:'Duplicate',extract:'Extract to new document',first:'Move to first',last:'Move to last',remove:'Remove pages'})[a],'role="menuitem"')).join('')}</div>
    <section id="pwViewer" class="pw-viewer" role="dialog" aria-modal="true" aria-label="Large page preview" hidden><header><strong id="pwViewerTitle">Page preview</strong><div>${button('previous','←','aria-label="Previous page"')}${button('next','→','aria-label="Next page"')}<label>Zoom <select id="pwViewerZoom"><option value="1">Fit</option><option value="1.5">150%</option><option value="2">200%</option></select></label>${button('closePreview','×','aria-label="Close preview"')}</div></header><p id="pwViewerStatus" role="status" class="pw-viewer-status"></p><div class="pw-viewer-body"><canvas id="pwViewerCanvas"></canvas></div></section>
    <section id="pwConfirm" class="pw-confirm" role="dialog" aria-modal="true" aria-labelledby="pwConfirmTitle" hidden><div><span class="pw-eyebrow">START FRESH</span><h3 id="pwConfirmTitle">Clear this workspace?</h3><p>All imported files, page arrangements and undo history will be cleared from this tab. Your original files and downloaded PDFs stay unchanged.</p><div>${button('keepWorkspace','Keep working')}${button('confirmReset','Clear workspace','class="pw-danger"')}</div></div></section>`;
  document.body.append(dialog);
  const $ = id => dialog.querySelector(`#${id}`);
  const history = new M.History(40);
  let panes = [{id: 'doc-1', name: 'Document 1', pages: []}], paneSerial = 1, active = 'doc-1';
  let sources = [], selection = new Set(), anchor = null;
  let busy = false, epoch = 0, worker, rejectWorker, resultURL, opener, viewerId, viewerRun = 0;
  let pdfjsPromise, libPromise, observer, thumbnailQueue = [], thumbnailRunning = false;
  let dragIds = [], dragPoint, dragFrame, menuPageId, menuOpener, resizeTimer;
  const renderTasks = new Set(), thumbCache = new Map();
  const current = () => panes.find(p => p.id === active) || panes[0];
  const allPages = () => panes.flatMap(p => p.pages);
  const chosen = () => current().pages.filter(p => selection.has(p.id));
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const bytesLabel = n => n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(2)} MB`;
  const fileName = () => ($('pwName').value.trim().replace(/\.pdf$/i, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/g, '') || 'document') + '.pdf';
  const isSmall = () => window.matchMedia('(max-width: 600px)').matches;
  const assertSession = token => {if (token !== epoch) throw new DOMException('Cancelled', 'AbortError');};

  function status(text, error = false) {
    $('pwStatus').textContent = text;
    $('pwStatus').dataset.error = String(error);
  }
  function clearResult() {
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = null;
    $('pwResult').hidden = true;
    $('pwDownload').removeAttribute('href');
  }
  function libraries() {
    pdfjsPromise ||= (window.pdfjsLib ? Promise.resolve(window.pdfjsLib) : import('./vendor/pdf-tools/pdfjs/pdf.mjs?v=2.1.1'))
      .then(lib => {lib.GlobalWorkerOptions.workerSrc = 'vendor/pdf-tools/pdfjs/pdf.worker.mjs?v=2.1.1'; return lib;})
      .catch(error => {pdfjsPromise = null; throw error;});
    libPromise ||= new Promise((resolve, reject) => {
      if (window.PDFLib) return resolve(window.PDFLib);
      const script = document.createElement('script');
      script.src = 'vendor/pdf-tools/pdf-lib.min.js';
      script.onload = () => resolve(window.PDFLib);
      script.onerror = () => {libPromise = null; script.remove(); reject(new Error('The PDF library could not load. Check your connection and try again.'));};
      document.head.append(script);
    });
    return Promise.all([pdfjsPromise, libPromise]);
  }
  function snapshot() {return M.clone({panes, active, selected: [...selection], anchor});}
  function restore(state) {
    panes = state.panes; active = state.active; selection = new Set(state.selected); anchor = state.anchor;
    clearResult(); render();
  }
  function change(fn, message) {
    if (busy) return;
    const before = snapshot();
    try {fn();} catch (error) {restore(before); throw error;}
    selection = new Set([...selection].filter(id => current().pages.some(page => page.id === id)));
    if (history.record(before, snapshot())) clearResult();
    render(); status(message);
  }
  function activate(id) {
    if (id === active || !panes.some(p => p.id === id)) return;
    const before = JSON.stringify(exportPages());
    active = id; selection.clear(); anchor = null;
    if (before !== JSON.stringify(exportPages())) clearResult();
    updateControls();
  }
  function setBusy(value) {
    busy = value;
    dialog.setAttribute('aria-busy', String(value));
    $('pwCancel').hidden = !value;
    $('pwProgress').hidden = !value;
    $('pwProgress').removeAttribute('value');
    updateControls();
  }
  function request(action, files, options) {
    return new Promise((resolve, reject) => {
      const job = new Worker('pdf-tools-worker.js?v=2.1.0');
      worker = job; rejectWorker = reject;
      const finish = () => {job.terminate(); if (worker === job) {worker = null; rejectWorker = null;}};
      job.onmessage = ({data}) => {finish(); data.error ? reject(new Error(data.error)) : resolve(data.result);};
      job.onerror = () => {finish(); reject(new Error('PDF processing failed. Try a smaller document or reload the page.'));};
      try {job.postMessage({action, files, options});} catch (error) {finish(); reject(error);}
    });
  }
  function cancel(message = 'Cancelled. Your page arrangements are unchanged.') {
    epoch++;
    worker?.terminate(); worker = null;
    rejectWorker?.(new DOMException('Cancelled', 'AbortError')); rejectWorker = null;
    for (const task of renderTasks) task.cancel();
    setBusy(false); status(message);
  }
  async function openPDF(bytes) {
    const [lib] = await libraries();
    return lib.getDocument({data: new Uint8Array(bytes), cMapUrl: 'vendor/pdf-tools/pdfjs/cmaps/', cMapPacked: true,
      standardFontDataUrl: 'vendor/pdf-tools/pdfjs/standard_fonts/', wasmUrl: 'vendor/pdf-tools/pdfjs/wasm/', isEvalSupported: false}).promise;
  }
  async function addFiles(files, targetId = active) {
    if (busy || !files.length) return;
    const token = ++epoch, pending = [];
    setBusy(true);
    try {
      if (sources.length + files.length > 20) throw new Error('This session holds up to 20 source files, including undo history. Export your work, then use Reset for a new session.');
      if (sources.reduce((n,s) => n + s.originalSize, 0) + files.reduce((n,f) => n + f.size, 0) > 50 * 1024 * 1024) throw new Error('Choose source files totalling 50 MB or less.');
      const [,lib] = await libraries(); assertSession(token);
      for (const [fileIndex, file] of files.entries()) {
        status(`Reading file ${fileIndex + 1} of ${files.length}: ${file.name}`);
        $('pwProgress').max = files.length; $('pwProgress').value = fileIndex;
        if (!file.size) throw new Error(`${file.name} is empty.`);
        let pdfFile = file;
        if (/\.(png|jpe?g)$/i.test(file.name)) {
          const result = await request('process', [file], {tool: 'images', paper: 'a4'}); assertSession(token);
          pdfFile = new File([result.bytes], file.name + '.pdf', {type: 'application/pdf'});
        } else if (!/\.pdf$/i.test(file.name)) throw new Error('Choose PDF, JPG or PNG files.');
        const bytes = await pdfFile.arrayBuffer(); assertSession(token);
        let doc;
        try {doc = await lib.PDFDocument.load(bytes, {updateMetadata: false});}
        catch {throw new Error(`${file.name} is damaged or password protected. Choose a readable, unlocked PDF.`);}
        assertSession(token);
        const fields = doc.getForm().getFields();
        if (fields.some(f => f instanceof lib.PDFSignature)) throw new Error(`${file.name} has a signature field. Use an unsigned copy.`);
        if (fields.length) throw new Error(`${file.name} contains interactive form fields. Save a flattened copy before arranging its pages.`);
        if (!doc.getPageCount()) throw new Error(`${file.name} has no pages.`);
        if (allPages().length + pending.reduce((n,s) => n + s.count, 0) + doc.getPageCount() > 500) throw new Error('The workspace supports up to 500 pages.');
        const pdf = await openPDF(bytes);
        const shapes = doc.getPages().map(p => ({width:p.getCropBox().width,height:p.getCropBox().height,rotation:p.getRotation().angle}));
        pending.push({file: pdfFile, name: file.name, pdf, shapes, count: doc.getPageCount(), originalSize: file.size});
        assertSession(token);
      }
      const before = snapshot(), target = panes.find(p => p.id === targetId) || current();
      active = target.id; selection.clear(); anchor = null;
      for (const source of pending) {
        const sourceIndex = sources.length; sources.push(source);
        for (let index = 0; index < source.count; index++) target.pages.push({id: M.uid(), source: sourceIndex, index, rotation: 0});
      }
      if (target.pages.length === pending.reduce((n,s) => n + s.count, 0) && pending.length === 1) target.name = pending[0].name.replace(/\.(pdf|png|jpe?g)$/i, '').slice(0,70);
      if ($('pwName').value === 'my-document') $('pwName').value = target.name;
      history.record(before, snapshot()); clearResult(); render();
      status(`Added ${pending.reduce((n,s) => n + s.count, 0)} pages. Select a page, use its menu, or drag to arrange.`);
    } catch (error) {
      await Promise.allSettled(pending.filter(s => !sources.includes(s)).map(s => s.pdf.destroy()));
      if (token === epoch) status(error.message, true);
    } finally {if (token === epoch) {setBusy(false); $('pwFiles').value = '';}}
  }
  function exportPages() {return M.exportPlan(panes, active, $('pwExportSource').value, $('pwScope').value, selection);}
  function updateControls() {
    const count = selection.size, selectedPages = chosen(), pageCount = current().pages.length;
    $('pwSelected').textContent = `${count} selected`;
    dialog.querySelectorAll('button,input,select').forEach(el => {el.disabled = busy && !['close','cancel'].includes(el.dataset.action);});
    const selectionActions = ['preview','rotate','rotateLeft','duplicate','extract','remove','first','last','up','down','position','move','copy'];
    dialog.querySelectorAll('[data-action]').forEach(el => {
      const a = el.dataset.action;
      if (selectionActions.includes(a)) el.disabled = busy || !count;
      if (a === 'undo') el.disabled = busy || !history.past.length;
      if (a === 'redo') el.disabled = busy || !history.future.length;
      if (a === 'addPane') el.disabled = busy || panes.length >= 3;
      if (a === 'extract') el.disabled = busy || !count || panes.length >= 3 || allPages().length + count > 500;
      if (a === 'duplicate' || a === 'copy') el.disabled = busy || !count || allPages().length + count > 500;
      if (a === 'selectAll' || a === 'range') el.disabled = busy || !pageCount;
      if (a === 'clear') el.disabled = busy || !count;
      if (a === 'move') el.disabled = busy || !count || $('pwDestination').value === active;
    });
    $('pwPosition').max = Math.max(1, pageCount - count + 1);
    $('pwExport').disabled = busy || !exportPages().length;
    $('pwExportSummary').textContent = `${exportPages().length} page${exportPages().length === 1 ? '' : 's'} to export${$('pwScope').value === 'selected' && !exportPages().length ? ' · Select pages in the export document first.' : ''}`;
    $('pwActiveLabel').textContent = `${current().name} · ${count} selected`;
    $('pwSummary').textContent = allPages().length ? `${allPages().length} pages · ${panes.length} document${panes.length > 1 ? 's' : ''}` : 'Your documents, in order.';
    dialog.querySelectorAll('.pw-card').forEach(el => {
      const selected = selection.has(el.dataset.page);
      el.setAttribute('aria-selected', String(selected));
      const check = el.querySelector('.pw-check');
      check.textContent = selected ? '✓' : '○'; check.setAttribute('aria-pressed', String(selected));
      el.draggable = !busy;
    });
    dialog.querySelectorAll('.pw-pane').forEach(el => el.classList.toggle('is-active', el.dataset.pane === active));
    dialog.querySelectorAll('[data-tab]').forEach(el => {el.setAttribute('aria-selected', String(el.dataset.tab === active)); el.tabIndex = el.dataset.tab === active ? 0 : -1;});
    if (!$('pwViewer').hidden) {
      const pane = panes.find(p => p.pages.some(page => page.id === viewerId));
      const index = pane?.pages.findIndex(p => p.id === viewerId);
      dialog.querySelector('[data-action="previous"]').disabled = !pane || index <= 0;
      dialog.querySelector('[data-action="next"]').disabled = !pane || index >= pane.pages.length - 1;
    }
  }
  function pageAspect(page) {
    const shape = sources[page.source].shapes[page.index];
    const turned = ((shape.rotation + page.rotation) % 180 + 180) % 180 !== 0;
    const ratio = turned ? shape.height / shape.width : shape.width / shape.height;
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 0.707;
  }
  function render() {
    observer?.disconnect(); thumbnailQueue = [];
    const focusedPage = document.activeElement?.closest?.('.pw-card')?.dataset.page;
    const scrolls = new Map([...dialog.querySelectorAll('.pw-page-list')].map(el => [el.dataset.pane, el.scrollTop]));
    const options = panes.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
    const destination = $('pwDestination').value;
    $('pwDestination').innerHTML = options;
    $('pwDestination').value = panes.some(p => p.id === destination) ? destination : (panes.find(p => p.id !== active)?.id || active);
    const exportSource = $('pwExportSource').value;
    $('pwExportSource').innerHTML = '<option value="active">Active document</option>' + options + '<option value="combined">All documents combined</option>';
    $('pwExportSource').value = ['active','combined',...panes.map(p => p.id)].includes(exportSource) ? exportSource : 'active';
    $('pwTabs').innerHTML = panes.map((pane, i) => `<button type="button" role="tab" data-tab="${pane.id}" id="pwTab-${pane.id}" aria-controls="pwPane-${pane.id}">${String(i + 1).padStart(2,'0')} <span>${esc(pane.name)}</span><small>${pane.pages.length}</small></button>`).join('');
    const root = $('pwPanes'); root.dataset.count = panes.length;
    root.innerHTML = panes.map((pane,i) => `<section id="pwPane-${pane.id}" class="pw-pane" data-pane="${pane.id}" aria-label="${esc(pane.name)}"><header><span class="pw-doc-number">${String(i + 1).padStart(2,'0')}</span><input class="pw-pane-name" data-pane-name="${pane.id}" value="${esc(pane.name)}" aria-label="Document ${i + 1} name" maxlength="70"><small>${pane.pages.length} pages</small>${button('paneAdd','＋',`data-pane="${pane.id}" aria-label="Add files to ${esc(pane.name)}"`)}${panes.length > 1 ? button('closePane','×',`data-pane="${pane.id}" aria-label="Close ${esc(pane.name)}" title="Close pane; its pages move to another document"`) : ''}</header><div class="pw-page-list" data-pane="${pane.id}" role="listbox" aria-label="Pages in ${esc(pane.name)}" aria-multiselectable="true" tabindex="0">${pane.pages.length ? pane.pages.map((page,n) => `<article class="pw-card" data-page="${page.id}" role="option" aria-selected="false" aria-label="Page ${n + 1}, ${esc(sources[page.source].name)}, source page ${page.index + 1}" tabindex="0" draggable="true"><div class="pw-paper" style="aspect-ratio:${pageAspect(page)}"><canvas aria-label="Page ${n + 1} preview"></canvas><button type="button" class="pw-check" data-select="${page.id}" aria-label="Select page ${n + 1}" aria-pressed="false">○</button><button class="pw-card-menu" type="button" data-menu="${page.id}" aria-haspopup="menu" aria-label="Actions for page ${n + 1}">⋯</button><span class="pw-thumbnail-state">Loading preview…</span></div><div class="pw-card-caption"><strong>Page ${n + 1}</strong><span>${page.rotation ? '↻ ' + page.rotation + '°' : ''}</span></div><small title="${esc(sources[page.source].name)}">${esc(sources[page.source].name)} · ${page.index + 1}</small></article>`).join('') : `<div class="pw-empty"><span aria-hidden="true">▤</span><h3>${i ? 'Build another document.' : 'A clear view of every page.'}</h3><p>Drop PDF files or images here.<br>Arrange pages, then export your finished document.</p>${button('paneAdd','Choose files',`data-pane="${pane.id}" class="pw-primary"`)}<small>Up to 500 pages · Files stay on your device</small></div>`}<div class="pw-end-drop" data-end="${pane.id}">${pane.pages.length ? 'Drop here to place pages at the end' : ''}</div></div></section>`).join('');
    root.querySelectorAll('.pw-page-list').forEach(el => {el.scrollTop = scrolls.get(el.dataset.pane) || 0;});
    const cards = [...root.querySelectorAll('.pw-card')];
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          entry.target.dataset.inView = String(entry.isIntersecting);
          if (entry.isIntersecting) {
            if (!entry.target.classList.contains('preview-ready') && !thumbnailQueue.includes(entry.target)) thumbnailQueue.push(entry.target);
          } else {
            const canvas = entry.target.querySelector('canvas'); canvas.width = canvas.height = 1;
            entry.target.classList.remove('preview-ready');
          }
        }
        drainThumbnails();
      }, {rootMargin: '200px'});
      cards.forEach(el => observer.observe(el));
      // Some browsers do not deliver an IntersectionObserver callback for content
      // created inside a newly opened dialog. Prime a small queue so the first
      // pages never remain on "Loading preview…" while the observer catches up.
      thumbnailQueue.push(...cards.slice(0, 12));
      drainThumbnails();
    } else {thumbnailQueue.push(...cards); drainThumbnails();}
    updateControls();
    if (focusedPage) (dialog.querySelector(`[data-page="${focusedPage}"]`) || dialog.querySelector(`.pw-page-list[data-pane="${active}"]`))?.focus({preventScroll: true});
  }
  async function pageGeometry(page) {
    const source = sources[page.source];
    if (!source) throw new Error('The source file is no longer available.');
    const pdfPage = await source.pdf.getPage(page.index + 1);
    const rotation = ((pdfPage.rotate + page.rotation) % 360 + 360) % 360;
    const base = pdfPage.getViewport({scale: 1, rotation});
    if (!Number.isFinite(base.width) || !Number.isFinite(base.height) || base.width <= 0 || base.height <= 0) throw new Error('This page has invalid dimensions.');
    return {pdfPage, rotation, base};
  }
  async function paint(page, canvas, width, geometry) {
    const {pdfPage, rotation, base} = geometry || await pageGeometry(page);
    const scale = Math.min(width / base.width, 6000 / base.height, 6000 / base.width, Math.sqrt(24000000 / (base.width * base.height)));
    const viewport = pdfPage.getViewport({scale, rotation});
    canvas.width = Math.max(1, Math.ceil(viewport.width)); canvas.height = Math.max(1, Math.ceil(viewport.height));
    const task = pdfPage.render({canvasContext: canvas.getContext('2d'), viewport, background: 'rgb(255,255,255)'});
    renderTasks.add(task);
    try {await task.promise;} finally {renderTasks.delete(task);}
  }
  async function drainThumbnails() {
    if (thumbnailRunning) return;
    thumbnailRunning = true;
    try {
      while (thumbnailQueue.length) {
        const card = thumbnailQueue.shift();
        if (!card.isConnected || !dialog.open || card.dataset.inView === 'false') continue;
        const page = allPages().find(p => p.id === card.dataset.page); if (!page) continue;
        const width = Math.ceil(Math.max(240,Math.min(1400,(card.clientWidth || 180) * Math.min(window.devicePixelRatio || 1,2))) / 120) * 120;
        const key = `${page.source}/${page.index}/${page.rotation}/${width}`, canvas = document.createElement('canvas'), target = card.querySelector('canvas');
        try {
          if (thumbCache.has(key)) {
            const cached = thumbCache.get(key); canvas.width = cached.width; canvas.height = cached.height;
            canvas.getContext('2d').drawImage(cached,0,0);
          } else {
            await paint(page, canvas, width);
            if (!card.isConnected || !dialog.open || card.dataset.inView === 'false') continue;
            if (thumbCache.size >= 40) thumbCache.delete(thumbCache.keys().next().value);
            // Do not cache pathological aspect ratios as large bitmaps.
            if (canvas.width * canvas.height < 1500000) {
              const cache = document.createElement('canvas'); cache.width = canvas.width; cache.height = canvas.height;
              cache.getContext('2d').drawImage(canvas,0,0); thumbCache.set(key,cache);
            }
          }
          if (!card.isConnected || !dialog.open || card.dataset.inView === 'false') continue;
          target.width = canvas.width; target.height = canvas.height; target.getContext('2d').drawImage(canvas,0,0);
          card.classList.add('preview-ready');
        } catch (error) {
          if (error.name === 'RenderingCancelledException') continue;
          card.classList.add('preview-error'); card.querySelector('.pw-thumbnail-state').textContent = 'Preview unavailable';
          // Keep the detailed reason available to the user instead of failing
          // silently when a browser rejects a canvas-rendering feature.
          const reason = String(error?.message || error || 'Unknown rendering error').replace(/\s+/g, ' ').slice(0, 180);
          status(`Could not render page ${page.index + 1}: ${reason}`, true);
        }
      }
    } finally {thumbnailRunning = false;}
  }
  function selectPage(id, event = {}) {
    const before = JSON.stringify(exportPages());
    const state = M.select(panes, selection, anchor, id, {range: event.shiftKey, toggle: event.ctrlKey || event.metaKey});
    active = state.active; selection = state.selected; anchor = state.anchor;
    // Explicit export sources stay fixed; 'Active document' follows the active pane.
    if (before !== JSON.stringify(exportPages())) clearResult();
    updateControls();
  }
  function closeMenu(restoreFocus = false) {
    $('pwMenu').hidden = true;
    if (restoreFocus) menuOpener?.focus({preventScroll: true});
  }
  function menu(id, x, y, trigger) {
    if (busy) return;
    if (!selection.has(id)) selectPage(id);
    menuPageId = id; menuOpener = trigger || dialog.querySelector(`[data-page="${id}"]`);
    const menu = $('pwMenu'), rect = dialog.getBoundingClientRect();
    menu.hidden = false; updateControls();
    menu.style.left = `${Math.max(8,Math.min(x - rect.left,dialog.clientWidth - menu.offsetWidth - 8))}px`;
    menu.style.top = `${Math.max(8,Math.min(y - rect.top,dialog.clientHeight - menu.offsetHeight - 8))}px`;
    menu.querySelector('button:not(:disabled)')?.focus();
  }
  function modalLayer(id, open) {
    $(id).hidden = !open;
    dialog.querySelector('.pw-layout').inert = open;
    dialog.querySelector('.pw-header').inert = open;
    closeMenu();
  }
  async function preview(id, focus = true) {
    const page = allPages().find(p => p.id === id); if (!page) return;
    viewerId = id; const token = ++viewerRun;
    const pane = panes.find(p => p.pages.some(p => p.id === id));
    $('pwViewerTitle').textContent = `${pane.name} · Page ${pane.pages.indexOf(page) + 1} of ${pane.pages.length}`;
    modalLayer('pwViewer', true); updateControls();
    if (focus) dialog.querySelector('[data-action="closePreview"]').focus();
    $('pwViewerCanvas').hidden = true; $('pwViewerStatus').textContent = 'Rendering page…';
    const canvas = document.createElement('canvas');
    try {
      const geometry = await pageGeometry(page); if (token !== viewerRun) return;
      const body = dialog.querySelector('.pw-viewer-body');
      const fit = Math.min(Math.max(100,body.clientWidth - 48) / geometry.base.width, Math.max(100,body.clientHeight - 48) / geometry.base.height);
      const cssWidth = geometry.base.width * fit * Number($('pwViewerZoom').value), dpr = Math.min(window.devicePixelRatio || 1,2);
      await paint(page,canvas,cssWidth * dpr,geometry); if (token !== viewerRun) return;
      const target = $('pwViewerCanvas'); target.width = canvas.width; target.height = canvas.height;
      target.style.width = cssWidth + 'px'; target.style.height = (cssWidth * geometry.base.height / geometry.base.width) + 'px';
      target.getContext('2d').drawImage(canvas,0,0); target.hidden = false; $('pwViewerStatus').textContent = '';
    } catch (error) {if (token === viewerRun) $('pwViewerStatus').textContent = `Preview unavailable: ${error.message}`;}
  }
  function qualityHint() {
    $('pwQualityHint').textContent = $('pwQuality').value === 'original'
      ? 'Recommended for resumes. Preserves selectable text, vectors and original image quality. Lossless compression is applied.'
      : 'Image PDF: text selection and interactive links are removed. Lower DPI may reduce file size; savings are not guaranteed. Large pages are capped to protect memory.';
  }
  async function exportPDF() {
    const pages = exportPages(); if (!pages.length) return;
    const token = ++epoch;
    setBusy(true); clearResult();
    try {
      const paper = $('pwPaper').value, quality = $('pwQuality').value;
      let result;
      if (quality === 'original') {
        status('Preparing your original-quality PDF…');
        const packed = M.packSources(sources,pages);
        result = await request('workspace',packed.files,{pages: packed.pages,paper});
      } else {
        const [,lib] = await libraries(); assertSession(token);
        const doc = await lib.PDFDocument.create(), preset = {best:[200,.94],good:[144,.85],normal:[96,.72]}[quality];
        if (!preset) throw new Error('Choose a supported quality setting.');
        for (let n = 0; n < pages.length; n++) {
          assertSession(token); status(`Rendering page ${n + 1} of ${pages.length}…`);
          $('pwProgress').max = pages.length; $('pwProgress').value = n;
          const geometry = await pageGeometry(pages[n]); assertSession(token);
          const {base} = geometry;
          const size = paper === 'original' ? [base.width,base.height] : paper === 'a4' ? lib.PageSizes.A4 : paper === 'legal' ? lib.PageSizes.Legal : lib.PageSizes.Letter;
          const fit = Math.min(size[0] / base.width, size[1] / base.height);
          const canvas = document.createElement('canvas');
          try {
            await paint(pages[n],canvas,base.width * fit * preset[0] / 72,geometry); assertSession(token);
            const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',preset[1]));
            if (!blob) throw new Error('Image export failed. Try a lower quality.');
            const image = await doc.embedJpg(await blob.arrayBuffer()); assertSession(token);
            doc.addPage(size).drawImage(image,{x:(size[0] - base.width * fit) / 2,y:(size[1] - base.height * fit) / 2,width:base.width * fit,height:base.height * fit});
          } finally {canvas.width = canvas.height = 1;}
        }
        result = {bytes: await doc.save(),pages: pages.length};
      }
      assertSession(token);
      const [,lib] = await libraries(); assertSession(token);
      const verify = await lib.PDFDocument.load(result.bytes); assertSession(token);
      if (verify.getPageCount() !== pages.length) throw new Error('PDF page count verification failed.');
      const blob = new Blob([result.bytes],{type:'application/pdf'});
      resultURL = URL.createObjectURL(blob); $('pwDownload').href = resultURL; $('pwDownload').download = fileName();
      $('pwResultTitle').textContent = fileName(); $('pwResultInfo').textContent = `${result.pages} pages · ${bytesLabel(blob.size)} · Page count checked`;
      $('pwResult').hidden = false; dialog.classList.remove('pw-hide-export'); updatePanelButtons();
      status('Your PDF is ready. Choose Download PDF in the export panel.');
      $('pwDownload').focus({preventScroll:true});
      if (isSmall()) $('pwResult').scrollIntoView({block:'nearest'});
    } catch (error) {if (token === epoch) status(error.message,true);}
    finally {if (token === epoch) setBusy(false);}
  }
  function updatePanelButtons() {
    dialog.querySelector('[data-action="toggleTools"]').setAttribute('aria-expanded',String(!dialog.classList.contains('pw-hide-tools')));
    dialog.querySelector('[data-action="toggleExport"]').setAttribute('aria-expanded',String(!dialog.classList.contains('pw-hide-export')));
  }
  function clearWorkspace() {
    cancel('Workspace cleared. Add a PDF to start again.'); stopDrag(); closeMenu();
    observer?.disconnect(); thumbnailQueue = []; thumbCache.clear();
    sources.forEach(source => {source.pdf.destroy().catch(() => {});});
    sources = []; panes = [{id:'doc-1',name:'Document 1',pages:[]}]; paneSerial = 1; active = 'doc-1';
    selection.clear(); anchor = null; history.clear(); clearResult();
    $('pwName').value = 'my-document'; $('pwRange').value = ''; $('pwScope').value = 'all'; $('pwExportSource').value = 'active';
    modalLayer('pwConfirm',false); render(); dialog.querySelector('[data-action="add"]').focus();
  }
  async function action(a, el) {
    const contextPage = !$('pwMenu').hidden ? menuPageId : null;
    closeMenu();
    if (busy && !['cancel','close'].includes(a)) return;
    try {
      if (a === 'close') {dialog.close(); return;}
      if (a === 'cancel') {cancel(); render(); return;}
      if (a === 'reset') {modalLayer('pwConfirm',true); dialog.querySelector('[data-action="keepWorkspace"]').focus(); return;}
      if (a === 'keepWorkspace') {modalLayer('pwConfirm',false); dialog.querySelector('[data-action="reset"]').focus(); return;}
      if (a === 'confirmReset') {clearWorkspace(); return;}
      if (a === 'toggleTools' || a === 'toggleExport') {
        const panel = a === 'toggleTools' ? 'tools' : 'export'; dialog.classList.toggle(`pw-hide-${panel}`); updatePanelButtons();
        if (isSmall() && !dialog.classList.contains(`pw-hide-${panel}`)) $(panel === 'tools' ? 'pwToolsPanel' : 'pwExportPanel').scrollIntoView({block:'start'});
        return;
      }
      if (a === 'add' || a === 'paneAdd') {if (el?.dataset.pane) activate(el.dataset.pane); $('pwFiles').click(); return;}
      if (a === 'undo' || a === 'redo') {const state = history[a](snapshot()); if (state) {restore(state);status(a === 'undo' ? 'Undone.' : 'Redone.');} return;}
      if (a === 'addPane') {
        if (panes.length >= 3) return;
        change(() => {const id = `doc-${++paneSerial}`; panes.push({id,name:`Document ${paneSerial}`,pages:[]}); active = id; selection.clear(); anchor = null;},'New document ready. Drag pages here or add files.');
        $('pwDestination').value = active; updateControls(); return;
      }
      if (a === 'closePane') {
        if (panes.length < 2) return;
        const id = el.dataset.pane;
        change(() => {const target = panes.find(p => p.id !== id); target.pages.push(...panes.find(p => p.id === id).pages); panes = panes.filter(p => p.id !== id); active = target.id; selection.clear(); anchor = null;},'Pane closed. Its pages were moved into the other document. Undo is available.'); return;
      }
      if (a === 'selectAll') {selection = new Set(current().pages.map(p => p.id)); anchor = current().pages[0]?.id || null; updateControls(); if ($('pwScope').value === 'selected') clearResult(); return;}
      if (a === 'clear') {selection.clear(); anchor = null; updateControls(); if ($('pwScope').value === 'selected') clearResult(); return;}
      if (a === 'range') {
        selection = new Set(window.ResumePDFToolsCore.parsePages($('pwRange').value,current().pages.length).map(i => current().pages[i].id));
        anchor = [...selection][0] || null; updateControls(); if ($('pwScope').value === 'selected') clearResult(); status(`${selection.size} pages selected in ${current().name}.`); return;
      }
      if (a === 'export') {await exportPDF(); return;}
      if (a === 'closePreview') {modalLayer('pwViewer',false);viewerRun++;dialog.querySelector(`[data-page="${viewerId}"]`)?.focus({preventScroll:true});return;}
      if (a === 'previous' || a === 'next') {
        const pane = panes.find(p => p.pages.some(p => p.id === viewerId)), index = pane?.pages.findIndex(p => p.id === viewerId);
        const page = pane?.pages[index + (a === 'next' ? 1 : -1)]; if (page) await preview(page.id,false); return;
      }
      if (!selection.size) return;
      if (a === 'preview') {await preview(contextPage || chosen()[0].id); return;}
      if (a === 'rotate' || a === 'rotateLeft') change(() => chosen().forEach(p => p.rotation = (p.rotation + (a === 'rotate' ? 90 : 270)) % 360),'Selected pages rotated.');
      if (a === 'remove') change(() => {current().pages = current().pages.filter(page => !selection.has(page.id)); selection.clear(); anchor = null;},'Selected pages removed. Use Undo to restore them.');
      if (a === 'duplicate') {
        if (allPages().length + selection.size > 500) throw new Error('The workspace supports up to 500 pages.');
        change(() => {const inserted = []; current().pages = current().pages.flatMap(page => {if (!selection.has(page.id)) return [page]; const copy = {...page,id:M.uid()}; inserted.push(copy.id); return [page,copy];}); selection = new Set(inserted); anchor = inserted[0];},'Copies are selected. Move or edit them next.');
      }
      if (a === 'extract') {
        if (panes.length >= 3) throw new Error('Use an existing destination, or close a document pane first.');
        change(() => {const id = `doc-${++paneSerial}`; panes.push({id,name:'Extracted pages',pages:[]}); const ids = M.transfer(panes,[...selection],id,null,true); active = id; selection = new Set(ids || []); anchor = ids?.[0];},'Selected pages copied to a new document.');
      }
      if (a === 'move' || a === 'copy') {
        const destination = $('pwDestination').value;
        change(() => {const ids = M.transfer(panes,[...selection],destination,null,a === 'copy'); active = destination; selection = new Set(ids || []); anchor = ids?.[0];},a === 'copy' ? 'Copies are selected in the destination document.' : 'Pages moved. The destination document is active.');
      }
      if (['first','last','position'].includes(a)) {
        const last = current().pages.length - selection.size + 1;
        const position = a === 'first' ? 1 : a === 'last' ? last : Number($('pwPosition').value);
        change(() => M.moveToPosition(panes,[...selection],active,position),'Page order updated.');
      }
      if (a === 'up' || a === 'down') change(() => M.nudge(current().pages,[...selection],a),'Page order updated.');
    } catch (error) {status(error.message,true);}
  }
  dialog.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (control) {action(control.dataset.action,control); return;}
    if (busy) return;
    const tab = event.target.closest('[data-tab]');
    if (tab) {activate(tab.dataset.tab); return;}
    const menuButton = event.target.closest('[data-menu]');
    if (menuButton) {const r = menuButton.getBoundingClientRect(); menu(menuButton.dataset.menu,r.right,r.bottom,menuButton); return;}
    closeMenu();
    const check = event.target.closest('[data-select]');
    if (check) {selectPage(check.dataset.select,{ctrlKey:true}); return;}
    const card = event.target.closest('.pw-card');
    if (card) selectPage(card.dataset.page,event);
    else {const pane = event.target.closest('.pw-pane'); if (pane) activate(pane.dataset.pane);}
  });
  dialog.addEventListener('dblclick', event => {
    const card = event.target.closest('.pw-card');
    if (card && !event.target.closest('button') && !busy) preview(card.dataset.page);
  });
  dialog.addEventListener('contextmenu', event => {
    const card = event.target.closest('.pw-card');
    if (card && !busy) {event.preventDefault(); menu(card.dataset.page,event.clientX,event.clientY,card);}
  });
  dialog.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'pwFiles') addFiles([...target.files]);
    if (target.matches('[data-pane-name]') && !busy) {
      const name = target.value.trim();
      change(() => {panes.find(p => p.id === target.dataset.paneName).name = name || 'Untitled document';},'Document renamed.');
    }
    if (target.closest('.pw-export')) {clearResult(); qualityHint(); updateControls();}
    if (target.id === 'pwDestination') updateControls();
    if (target.id === 'pwViewerZoom') preview(viewerId,false);
    if (target.id === 'pwView') {$('pwPanes').dataset.view = target.value; render();}
  });
  $('pwName').addEventListener('input',clearResult);
  $('pwZoom').addEventListener('input',() => {$('pwPanes').style.setProperty('--page-width',$('pwZoom').value + 'px');});
  $('pwZoom').addEventListener('change',render);
  $('pwRange').addEventListener('keydown',event => {if (event.key === 'Enter') {event.preventDefault(); action('range');}});
  $('pwPosition').addEventListener('keydown',event => {if (event.key === 'Enter') {event.preventDefault(); action('position');}});
  dialog.addEventListener('keydown',event => {
    if (event.key === 'Escape') {
      if (!$('pwConfirm').hidden) {event.preventDefault(); action('keepWorkspace');}
      else if (!$('pwViewer').hidden) {event.preventDefault(); action('closePreview');}
      else if (!$('pwMenu').hidden) {event.preventDefault(); closeMenu(true);}
      return;
    }
    if (!$('pwConfirm').hidden || busy) return;
    if (!$('pwViewer').hidden) {
      if (!event.target.matches('input,select') && ['ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault(); action(event.key === 'ArrowLeft' ? 'previous' : 'next');
      }
      return; // Never edit the underlying document through a preview keyboard event.
    }
    if (!$('pwMenu').hidden) {
      const items = [...$('pwMenu').querySelectorAll('button:not(:disabled)')], index = items.indexOf(document.activeElement);
      if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault(); const at = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[at]?.focus();
      }
      if (event.key === 'Tab') closeMenu();
      return;
    }
    const tab = event.target.closest('[data-tab]');
    if (tab && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault(); const index = panes.findIndex(p => p.id === tab.dataset.tab);
      const at = event.key === 'Home' ? 0 : event.key === 'End' ? panes.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + panes.length) % panes.length;
      activate(panes[at].id); dialog.querySelector(`[data-tab="${active}"]`).focus(); return;
    }
    if (event.target.matches('input,select,textarea')) return;
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') {event.preventDefault(); action(event.shiftKey ? 'redo' : 'undo');}
      if (event.key.toLowerCase() === 'y') {event.preventDefault(); action('redo');}
      if (event.key.toLowerCase() === 'a') {event.preventDefault(); action('selectAll');}
      return;
    }
    // Let button Enter/Space perform its native action, including page-menu buttons.
    if (event.target.closest('button,a')) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {event.preventDefault(); action('remove'); return;}
    const card = event.target.closest('.pw-card');
    if (card && (event.key === ' ' || event.key === 'Enter')) {event.preventDefault(); selectPage(card.dataset.page,{...event,ctrlKey:event.key === ' '});}
    if (card && (event.key === 'ContextMenu' || event.shiftKey && event.key === 'F10')) {
      event.preventDefault(); const r = card.getBoundingClientRect(); menu(card.dataset.page,r.left + 15,r.top + 15,card);
    }
    if (card && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
      event.preventDefault();
      const pane = panes.find(p => p.pages.some(p => p.id === card.dataset.page)), index = pane.pages.findIndex(p => p.id === card.dataset.page);
      const next = event.key === 'Home' ? pane.pages[0] : event.key === 'End' ? pane.pages.at(-1) : pane.pages[index + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1)];
      if (next) {selectPage(next.id,event); dialog.querySelector(`[data-page="${next.id}"]`).focus();}
    }
  });
  function cleanDropIndicators() {dialog.querySelectorAll('.drop-before,.drop-after,.drop-active').forEach(el => el.classList.remove('drop-before','drop-after','drop-active'));}
  function stopDrag() {
    dragIds = []; dragPoint = null; cancelAnimationFrame(dragFrame); dragFrame = null;
    cleanDropIndicators(); dialog.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  }
  function autoScroll() {
    if (!dragPoint) {dragFrame = null; return;}
    const {list,x,y} = dragPoint, rect = list.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right) {
      const top = y - rect.top, bottom = rect.bottom - y;
      if (top < 60) list.scrollTop -= Math.max(2,(60 - top) / 4);
      else if (bottom < 60) list.scrollTop += Math.max(2,(60 - bottom) / 4);
    }
    dragFrame = requestAnimationFrame(autoScroll);
  }
  function insertionTarget(card,event) {
    if (!card) return {before:null,after:false};
    const rect = card.getBoundingClientRect(), listMode = $('pwView').value === 'list';
    const after = listMode ? event.clientY > rect.top + rect.height / 2 : event.clientX > rect.left + rect.width / 2;
    const pane = panes.find(p => p.pages.some(p => p.id === card.dataset.page));
    const index = pane.pages.findIndex(p => p.id === card.dataset.page);
    return {before: after ? pane.pages[index + 1]?.id || null : card.dataset.page,after};
  }
  dialog.addEventListener('dragstart',event => {
    const card = event.target.closest('.pw-card');
    if (!card || busy || event.target.closest('button')) {event.preventDefault(); return;}
    if (!selection.has(card.dataset.page)) selectPage(card.dataset.page);
    dragIds = [...selection]; event.dataTransfer.setData('application/x-pdf-pages',JSON.stringify(dragIds)); event.dataTransfer.effectAllowed = 'copyMove';
    dialog.querySelectorAll('.pw-card[aria-selected="true"]').forEach(el => el.classList.add('dragging'));
  });
  dialog.addEventListener('dragend',stopDrag);
  dialog.addEventListener('dragover',event => {
    const fileDrop = [...(event.dataTransfer?.types || [])].includes('Files');
    if (!fileDrop && !dragIds.length) return;
    event.preventDefault();
    if (busy) {event.dataTransfer.dropEffect = 'none'; return;}
    const list = event.target.closest('.pw-page-list');
    event.dataTransfer.dropEffect = fileDrop || event.altKey ? 'copy' : 'move';
    cleanDropIndicators();
    if (!list) {dragPoint = null; return;}
    const card = event.target.closest('.pw-card');
    if (card && !fileDrop) card.classList.add(insertionTarget(card,event).after ? 'drop-after' : 'drop-before');
    else list.classList.add('drop-active');
    dragPoint = {list,x:event.clientX,y:event.clientY};
    if (!dragFrame) dragFrame = requestAnimationFrame(autoScroll);
  });
  dialog.addEventListener('dragleave',event => {if (!dialog.contains(event.relatedTarget)) {dragPoint = null; cleanDropIndicators();}});
  dialog.addEventListener('drop',event => {
    event.preventDefault();
    const list = event.target.closest('.pw-page-list'), target = list?.dataset.pane || active;
    if (busy) {stopDrag(); return;}
    if (event.dataTransfer.files.length) {const files = [...event.dataTransfer.files]; stopDrag(); addFiles(files,target); return;}
    const ids = [...dragIds], card = event.target.closest('.pw-card'), before = insertionTarget(card,event).before;
    stopDrag();
    if (!list || !ids.length) return;
    try {
      change(() => {const inserted = M.transfer(panes,ids,target,before,event.altKey); if (inserted) {active = target; selection = new Set(inserted); anchor = inserted[0];}},event.altKey ? 'Pages copied. The copies are selected.' : 'Pages moved. Undo is available.');
    } catch (error) {status(error.message,true);}
  });
  // Prevent the browser from replacing this page when files land outside the modal.
  for (const type of ['dragover','drop']) document.addEventListener(type,event => {
    if (dialog.open && [...(event.dataTransfer?.types || [])].includes('Files')) event.preventDefault();
  });
  document.querySelectorAll('[data-open-pdf-tools]').forEach(el => el.addEventListener('click',() => {
    opener = el;
    const more = document.querySelector('.toolbar-more'); if (more) more.open = false;
    dialog.showModal(); render();
    if (isSmall()) dialog.classList.add('pw-hide-tools');
    updatePanelButtons();
    (isSmall() ? (dialog.querySelector('.pw-empty [data-action="paneAdd"]') || dialog.querySelector('[data-tab][aria-selected="true"]')) : dialog.querySelector('[data-action="add"]')).focus();
    status(allPages().length ? 'Your workspace is restored. Continue where you left off.' : 'Add a PDF to start. Original files stay unchanged.');
  }));
  dialog.addEventListener('cancel',event => {
    if (!$('pwConfirm').hidden) {event.preventDefault(); action('keepWorkspace');}
    else if (!$('pwViewer').hidden) {event.preventDefault(); action('closePreview');}
    else if (!$('pwMenu').hidden) {event.preventDefault(); closeMenu(true);}
  });
  dialog.addEventListener('close',() => {
    cancel('Workspace kept in this tab. Reopen PDF Tools to continue.'); stopDrag();
    observer?.disconnect(); thumbnailQueue = []; viewerRun++;
    modalLayer('pwViewer',false); modalLayer('pwConfirm',false);
    if (opener?.getClientRects().length) opener.focus(); else document.querySelector('[data-mobile-action="more"]')?.focus();
  });
  window.addEventListener('resize',() => {clearTimeout(resizeTimer); resizeTimer = setTimeout(() => {if (!$('pwViewer').hidden) preview(viewerId,false);},150);});
  window.addEventListener('beforeunload',event => {if (allPages().length || busy) {event.preventDefault(); event.returnValue = '';}});
  qualityHint(); render(); updatePanelButtons();
})();
