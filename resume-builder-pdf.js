/* Resume-only PDF download. Dependencies are local and loaded only on demand. */
(() => {
  'use strict';
  const api = window.ResumeBuilderAPI;
  const dialog = document.querySelector('#exportDialog');
  const download = document.querySelector('#downloadPdf');
  const print = document.querySelector('#confirmPdfExport');
  const confirm = document.querySelector('#exportConfirm');
  const status = document.querySelector('#pdfExportStatus');
  document.fonts.ready.then(() => api.fitPreview());
  let busy = false;
  const scripts = new Map();

  function loadScript(src) {
    if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => { scripts.delete(src); script.remove(); reject(new Error('PDF tools could not load. Please try again.')); };
      document.head.append(script);
    }));
    return scripts.get(src);
  }
  function syncButtons() {
    download.disabled = print.disabled = busy || !confirm.checked;
  }
  confirm.addEventListener('change', syncButtons);
  document.querySelector('#printResume').addEventListener('click', () => {
    status.textContent = '';
    syncButtons();
    refreshPageCount();
  });
  function refreshPageCount() {
    requestAnimationFrame(() => {
      const workspace = document.querySelector('#workspace');
      const wasPreview = workspace.classList.contains('show-preview');
      workspace.classList.add('show-preview');
      api.fitPreview();
      workspace.classList.toggle('show-preview',wasPreview);
      const count = parseInt(document.querySelector('#pageStatus').textContent,10) || 1;
      const summary = document.querySelector('#exportSummary span:nth-child(2)');
      if (summary) summary.innerHTML = `<b>${count}</b>Page${count === 1 ? '' : 's'}`;
    });
  }
  for (const id of ['exportPageSize','exportDensity']) document.getElementById(id).addEventListener('change',refreshPageCount);
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });

  // Freeze the paper's computed styles, so screen breakpoints cannot alter the
  // export. Resolve modern CSS colors for the PDF renderer's CSS parser.
  function paperSnapshot(source) {
    const copy = source.cloneNode(true);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', {willReadFrequently:true});
    const colors = new Map();
    function color(value) {
      if (!colors.has(value)) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [r,g,b,a] = context.getImageData(0,0,1,1).data;
        colors.set(value, `rgba(${r},${g},${b},${a/255})`);
      }
      return colors.get(value);
    }
    const originals = [source, ...source.querySelectorAll('*')];
    const copies = [copy, ...copy.querySelectorAll('*')];
    originals.forEach((element, index) => {
      const computed = getComputedStyle(element);
      const target = copies[index];
      target.removeAttribute('id');
      for (const property of computed) {
        if (property.startsWith('--')) continue;
        let value = computed.getPropertyValue(property);
        if (property === 'color' || property.endsWith('-color')) value = color(value);
        target.style.setProperty(property, value, 'important');
      }
      target.style.setProperty('box-shadow', 'none', 'important');
      target.style.setProperty('transition', 'none', 'important');
      target.style.setProperty('animation', 'none', 'important');
    });
    // html2canvas clones computed styles again. Reset BOTH physical and logical
    // properties: a retained inset-inline-start can restore the preview's 50%
    // offset, and block-size can restore its artificial multi-page height.
    const paperWidth = getComputedStyle(source).width;
    for (const [property,value] of Object.entries({
      position:'static', inset:'auto', 'inset-inline':'auto', 'inset-block':'auto',
      transform:'none', translate:'none', rotate:'none', scale:'none', zoom:'1',
      margin:'0', 'margin-inline':'0', 'margin-block':'0',
      width:paperWidth, 'inline-size':paperWidth,
      height:'auto', 'block-size':'auto', 'min-height':'0', 'min-block-size':'0',
      'max-height':'none', 'max-block-size':'none'
    })) {
      copy.style.setProperty(property,value,'important');
    }
    return copy;
  }

  download.addEventListener('click', async () => {
    if (busy || !confirm.checked) return;
    busy = true;
    syncButtons();
    const cancel = dialog.querySelector('[value="cancel"]');
    cancel.disabled = true;
    dialog.setAttribute('aria-busy','true');
    status.textContent = 'Preparing your PDF…';
    let host;
    try {
      await Promise.all([
        loadScript('vendor/resume-pdf/jspdf.umd.min.js'),
        loadScript('vendor/resume-pdf/html2canvas.min.js'),
        document.fonts.ready
      ]);
      const workspace = document.querySelector('#workspace');
      const wasPreview = workspace.classList.contains('show-preview');
      let copy;
      // Hidden mobile previews have no layout until made visible.
      try {
        workspace.classList.add('show-preview');
        api.fitPreview();
        copy = paperSnapshot(document.querySelector('#resumePreview'));
      } finally {
        workspace.classList.toggle('show-preview',wasPreview);
      }
      host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-20000px;top:0;background:white;color:black;';
      host.setAttribute('aria-hidden','true');
      host.append(copy);
      document.body.append(host);
      const format = document.querySelector('#pageSize').value;
      const pdf = new window.jspdf.jsPDF({unit:'pt',format,orientation:'portrait',compress:true,putOnlyUsedFonts:true});
      await pdf.html(copy, {
        x:0, y:0, margin:0, width:pdf.internal.pageSize.getWidth(),
        windowWidth:copy.offsetWidth, autoPaging:'slice',
        fontFaces:[{"family": "ResumeSans", "weight": 400, "style": "normal", "src": [{"url": "vendor/resume-pdf/fonts/DejaVuSans.ttf", "format": "truetype"}]}, {"family": "ResumeSans", "weight": 700, "style": "normal", "src": [{"url": "vendor/resume-pdf/fonts/DejaVuSans-Bold.ttf", "format": "truetype"}]}, {"family": "ResumeSerif", "weight": 400, "style": "normal", "src": [{"url": "vendor/resume-pdf/fonts/DejaVuSerif.ttf", "format": "truetype"}]}, {"family": "ResumeSerif", "weight": 700, "style": "normal", "src": [{"url": "vendor/resume-pdf/fonts/DejaVuSerif-Bold.ttf", "format": "truetype"}]}, {"family": "ResumeMono", "weight": 400, "style": "normal", "src": [{"url": "vendor/resume-pdf/fonts/DejaVuSansMono.ttf", "format": "truetype"}]}, {"family": "ResumeMono", "weight": 700, "style": "normal", "src": [{"url": "vendor/resume-pdf/fonts/DejaVuSansMono-Bold.ttf", "format": "truetype"}]}],
        html2canvas:{backgroundColor:'#ffffff',logging:false,scrollX:0,scrollY:0}
      });
      const name = document.querySelector('#pdfFileName').value.trim().replace(/\.pdf$/i,'').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-') || 'Resume';
      pdf.setProperties({title:name,subject:'Professional resume'});
      pdf.save(`${name}.pdf`);
      status.textContent = 'PDF downloaded. You can also print a copy.';
    } catch (error) {
      console.error('Resume PDF export failed',error);
      status.textContent = 'The PDF could not be downloaded. Please try again, or use Print and select Save as PDF.';
    } finally {
      host?.remove();
      busy = false;
      cancel.disabled = false;
      dialog.removeAttribute('aria-busy');
      syncButtons();
    }
  });
})();
