/* DOM integration checks. PDF parsing/export use pdf-lib; canvas rendering is stubbed.
   These tests validate interaction/state, not browser layout or pixel rendering. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {Window} from 'happy-dom';
const require=createRequire(import.meta.url);
const lib=require('../vendor/pdf-tools/pdf-lib.min.js');
const core=require('../pdf-tools-core.js');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(fn){for(let i=0;i<150;i++){if(fn())return;await sleep(10);}throw new Error('Timed out waiting for application state');}
async function fixture(count=4){const doc=await lib.PDFDocument.create();for(let i=0;i<count;i++)doc.addPage([300+i*30,600]).drawText('Page '+(i+1));return await doc.save();}
async function setup(t){
 const w=new Window({url:'http://localhost:8765/resume-builder.html',settings:{disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:true}});
 t.after(()=>w.happyDOM.abort());
 Object.assign(w,{Uint8Array,ArrayBuffer,File,Blob});
 w.document.body.innerHTML='<button data-open-pdf-tools>PDF Tools</button>';
 const blobs=new Map();let seq=0;
 w.URL.createObjectURL=blob=>{const url='blob:test-'+(++seq);blobs.set(url,blob);return url;};w.URL.revokeObjectURL=url=>blobs.delete(url);
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLCanvasElement.prototype.getContext=function(){return {drawImage(){},clearRect(){}};};
 w.HTMLCanvasElement.prototype.toBlob=function(callback){callback(new Blob([Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAACAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==','base64')],{type:'image/jpeg'}));};
 w.PDFLib=lib;
 w.pdfjsLib={GlobalWorkerOptions:{},getDocument({data}){return {promise:lib.PDFDocument.load(data).then(doc=>({destroy:async()=>{},getPage:async n=>{
  const page=doc.getPage(n-1);return {rotate:page.getRotation().angle,getViewport:({scale,rotation})=>({width:(rotation%180?page.getHeight():page.getWidth())*scale,height:(rotation%180?page.getWidth():page.getHeight())*scale}),render(){let reject;const promise=new Promise((resolve,r)=>{reject=r;setTimeout(resolve,1)});return {promise,cancel(){const e=new Error('Cancelled');e.name='RenderingCancelledException';reject(e)}}}};
 }}))};}};
 w.Worker=class{terminate(){this.stopped=true;}postMessage({action,files,options}){setTimeout(async()=>{try{const result=action==='workspace'?await core.workspace(files,options,lib):await core.process(files,options,lib);if(!this.stopped)this.onmessage({data:{result}});}catch(error){if(!this.stopped)this.onmessage({data:{error:error.message}});}},5);}};
 for(const file of ['pdf-tools-core.js','pdf-workspace-model.js','pdf-tools.js'])w.eval(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
 const $=selector=>w.document.querySelector(selector);
 const click=selector=>{const el=$(selector);assert.ok(el,selector);assert.equal(el.disabled,false,selector+' should be enabled');el.click();};
 const change=(selector,value)=>{const el=$(selector);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const key=(selector,key,props={})=>$(selector).dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...props}));
 const upload=async(bytes,name='sample.pdf')=>{bytes ||= await fixture();Object.defineProperty($('#pwFiles'),'files',{value:[new File([bytes],name,{type:'application/pdf'})],configurable:true});$('#pwFiles').dispatchEvent(new w.Event('change',{bubbles:true}));await waitFor(()=>$('#pdfToolsDialog').getAttribute('aria-busy')==='false');};
 click('[data-open-pdf-tools]');
 return {w,$,click,change,key,upload,blobs,cards:()=>[...w.document.querySelectorAll('.pw-card')]};
}
test('upload, checkbox multi-select, duplicate and undo work through actual UI handlers',async t=>{
 const a=await setup(t);await a.upload();assert.equal(a.cards().length,4);
 a.click('.pw-card:nth-child(1) .pw-check');a.click('.pw-card:nth-child(3) .pw-check');assert.equal(a.$('#pwSelected').textContent,'2 selected');
 a.click('.pw-sidebar [data-action="duplicate"]');assert.equal(a.cards().length,6);assert.equal(a.$('#pwSelected').textContent,'2 selected');
 a.click('[data-action="undo"]');assert.equal(a.cards().length,4);a.click('[data-action="redo"]');assert.equal(a.cards().length,6);
});
test('closing preserves workspace; reset needs confirmation and clears it',async t=>{
 const a=await setup(t);await a.upload();a.click('[data-action="close"]');a.click('[data-open-pdf-tools]');assert.equal(a.cards().length,4);
 a.click('[data-action="reset"]');assert.equal(a.$('#pwConfirm').hidden,false);a.click('[data-action="keepWorkspace"]');assert.equal(a.cards().length,4);
 a.click('[data-action="reset"]');a.click('[data-action="confirmReset"]');assert.equal(a.cards().length,0);assert.equal(a.$('[data-action="undo"]').disabled,true);
});
test('pane switching clears stale selection and explicit export targets do not follow it',async t=>{
 const a=await setup(t);await a.upload();a.click('[data-action="addPane"]');a.click('[data-tab="doc-1"]');a.click('.pw-card .pw-check');
 a.change('#pwExportSource','doc-1');a.click('[data-tab="doc-2"]');assert.equal(a.$('#pwSelected').textContent,'0 selected');assert.equal(a.$('#pwExportSource').value,'doc-1');assert.equal(a.$('#pwExportSummary').textContent,'4 pages to export');
 a.click('[data-tab="doc-1"]');a.click('.pw-card .pw-check');a.change('#pwDestination','doc-2');a.click('[data-action="move"]');
 assert.equal(a.$('.pw-pane.is-active').dataset.pane,'doc-2');assert.equal(a.$('#pwSelected').textContent,'1 selected');assert.equal(a.$('#pwExportSummary').textContent,'3 pages to export');
});
test('context menu keyboard does not select pages and preview blocks delete on underlying pages',async t=>{
 const a=await setup(t);await a.upload();a.click('.pw-card .pw-card-menu');assert.equal(a.$('#pwMenu').hidden,false);
 a.key('#pwMenu button','ArrowDown');assert.equal(a.w.document.activeElement.dataset.action,'rotate');a.key('#pwMenu button','Escape');assert.equal(a.$('#pwMenu').hidden,true);
 a.click('.pw-sidebar [data-action="preview"]');await waitFor(()=>a.$('#pwViewerStatus').textContent==='');assert.equal(a.$('.pw-layout').inert,true);
 a.key('[data-action="closePreview"]','Delete');assert.equal(a.cards().length,4);
 a.key('[data-action="closePreview"]','Escape');assert.equal(a.$('#pwViewer').hidden,true);assert.equal(a.$('.pw-layout').inert,false);
});
test('file rejection is atomic and retains existing pages and download',async t=>{
 const a=await setup(t);await a.upload();a.click('#pwExport');await waitFor(()=>!a.$('#pwResult').hidden);const href=a.$('#pwDownload').href;
 await a.upload(new Uint8Array([1,2,3]),'broken.pdf');assert.equal(a.cards().length,4);assert.equal(a.$('#pwStatus').dataset.error,'true');assert.equal(a.$('#pwDownload').href,href);
});
test('export through worker preserves selected order and invalidates output after rotation',async t=>{
 const a=await setup(t);await a.upload();a.click('.pw-card:nth-child(3) .pw-check');a.click('.pw-sidebar [data-action="first"]');
 a.click('#pwExport');await waitFor(()=>!a.$('#pwResult').hidden);const blob=a.blobs.get(a.$('#pwDownload').href);assert.ok(blob);
 const pdf=await lib.PDFDocument.load(await blob.arrayBuffer());assert.deepEqual(pdf.getPages().map(p=>p.getWidth()),[360,300,330,390]);
 a.click('.pw-sidebar [data-action="rotate"]');assert.equal(a.$('#pwResult').hidden,true);
});
test('selected-only export explains empty scope and enables after selection',async t=>{
 const a=await setup(t);await a.upload();a.change('#pwScope','selected');assert.equal(a.$('#pwExport').disabled,true);
 assert.match(a.$('#pwExportSummary').textContent,/Select pages/);a.click('.pw-card .pw-check');assert.equal(a.$('#pwExport').disabled,false);assert.equal(a.$('#pwExportSummary').textContent,'1 page to export');
});
test('page range Enter, mobile toggles, and cancellation remain operable',async t=>{
 const a=await setup(t);await a.upload();a.$('#pwRange').value='1, 3–4';a.key('#pwRange','Enter');assert.equal(a.$('#pwSelected').textContent,'3 selected');
 a.click('[data-action="toggleTools"]');assert.equal(a.$('[data-action="toggleTools"]').getAttribute('aria-expanded'),'false');a.click('[data-action="toggleTools"]');
 a.click('#pwExport');a.click('[data-action="cancel"]');await sleep(30);assert.equal(a.$('#pwResult').hidden,true);assert.equal(a.$('#pdfToolsDialog').getAttribute('aria-busy'),'false');assert.equal(a.cards().length,4);
});
test('dragging inserts after a page and cross-document copying selects only the copies',async t=>{
 const a=await setup(t);await a.upload();
 const drag=(source,target,props={})=>{
  source.getBoundingClientRect=()=>({left:0,top:0,width:100,height:200,right:100,bottom:200});
  target.getBoundingClientRect=()=>({left:0,top:0,width:100,height:200,right:100,bottom:200});
  const dataTransfer={files:[],types:['application/x-pdf-pages'],setData(){}};
  const fire=(el,type,extra={})=>{const event=new a.w.Event(type,{bubbles:true,cancelable:true});Object.assign(event,{dataTransfer,clientX:90,clientY:50,...extra});el.dispatchEvent(event);};
  fire(source,'dragstart');fire(target,'dragover',props);fire(target,'drop',props);
 };
 const original=a.cards().map(c=>c.dataset.page);drag(a.cards()[0],a.cards()[2]);
 assert.deepEqual(a.cards().map(c=>c.dataset.page),[original[1],original[2],original[0],original[3]]);
 a.click('[data-action="addPane"]');a.click('[data-tab="doc-1"]');const source=a.cards()[0];
 drag(source,a.$('.pw-page-list[data-pane="doc-2"]'),{altKey:true});
 assert.equal(a.cards().length,5);assert.equal(a.$('#pwSelected').textContent,'1 selected');assert.equal(a.$('.pw-pane.is-active').dataset.pane,'doc-2');
 assert.notEqual(a.$('.pw-pane.is-active .pw-card').dataset.page,source.dataset.page);
});
test('range errors leave selection intact and full-document exports survive harmless selection changes',async t=>{
 const a=await setup(t);await a.upload();a.click('#pwExport');await waitFor(()=>!a.$('#pwResult').hidden);
 const href=a.$('#pwDownload').href;a.click('.pw-card .pw-check');assert.equal(a.$('#pwDownload').href,href);assert.equal(a.$('#pwResult').hidden,false);
 a.$('#pwRange').value='99';a.click('[data-action="range"]');assert.equal(a.$('#pwSelected').textContent,'1 selected');assert.equal(a.$('#pwStatus').dataset.error,'true');
});
test('closing during upload cancels pending commit without losing the existing workspace',async t=>{
 const a=await setup(t);await a.upload();const pending=a.upload(await fixture(2),'second.pdf');a.click('[data-action="close"]');await pending;await sleep(20);
 a.click('[data-open-pdf-tools]');assert.equal(a.cards().length,4);assert.equal(a.$('#pdfToolsDialog').getAttribute('aria-busy'),'false');
});
test('all image quality presets complete their export pipeline with the chosen paper size',async t=>{
 const a=await setup(t);await a.upload(await fixture(2));
 for(const [quality,paper,width,height] of [['best','a4',595.28,841.89],['good','letter',612,792],['normal','legal',612,1008]]){
  a.change('#pwQuality',quality);a.change('#pwPaper',paper);a.click('#pwExport');await waitFor(()=>!a.$('#pwResult').hidden);
  const blob=a.blobs.get(a.$('#pwDownload').href),doc=await lib.PDFDocument.load(await blob.arrayBuffer());
  assert.equal(doc.getPageCount(),2);assert.ok(doc.getPages().every(p=>Math.abs(p.getWidth()-width)<.1&&Math.abs(p.getHeight()-height)<.1));
 }
});
