const {test}=require('node:test');
const assert=require('node:assert/strict');
const lib=require('../vendor/pdf-tools/pdf-lib.min.js');
const core=require('../pdf-tools-core.js');
const M=require('../pdf-workspace-model.js');
const file=(name,bytes)=>({name,size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer});
async function fixture(){const doc=await lib.PDFDocument.create();for(let i=0;i<4;i++){const p=doc.addPage([300+i*50,600]);p.drawText(`Source ${i+1}`,{x:40,y:500});if(i===1)p.setRotation(lib.degrees(90));if(i===2)p.setCropBox(20,30,250,400);}return file('fixture.pdf',await doc.save());}
test('cross-pane multi-page move keeps order, copy has distinct IDs, dropping onto selection is a no-op',()=>{const a={id:M.uid()},b={id:M.uid()},c={id:M.uid()},d={id:M.uid()};const panes=[{id:'a',pages:[a,b,c]},{id:'b',pages:[d]}];M.transfer(panes,[c.id,a.id],'b',d.id);assert.deepEqual(panes.map(p=>p.pages.map(p=>p.id)),[[b.id],[a.id,c.id,d.id]]);M.transfer(panes,[a.id],'a',null,true);assert.notEqual(panes[0].pages[1].id,a.id);assert.equal(M.transfer(panes,[a.id],'b',a.id),false);});
test('workspace export follows exact edited sequence including duplicates, rotation, and crop',async()=>{const source=await fixture();const result=await core.workspace([source],{pages:[{source:0,index:2,rotation:0},{source:0,index:1,rotation:90},{source:0,index:2,rotation:270}]},lib);const doc=await lib.PDFDocument.load(result.bytes);assert.deepEqual(doc.getPages().map(p=>p.getWidth()),[400,350,400]);assert.deepEqual(doc.getPages().map(p=>p.getRotation().angle),[0,180,270]);assert.deepEqual(doc.getPage(0).getCropBox(),{x:20,y:30,width:250,height:400});});
test('paper resize produces exact paper geometry for cropped and rotated pages',async()=>{const source=await fixture();for(const paper of ['a4','letter','legal']){const result=await core.workspace([source],{paper,pages:[0,1,2,3].map(index=>({source:0,index,rotation:index*90}))},lib);const doc=await lib.PDFDocument.load(result.bytes);const size=paper==='a4'?lib.PageSizes.A4:paper==='letter'?lib.PageSizes.Letter:lib.PageSizes.Legal;for(const p of doc.getPages()){assert.equal(p.getWidth(),size[0]);assert.equal(p.getHeight(),size[1]);assert.equal(p.getRotation().angle,0);}}});
test('workspace rejects invalid page references and empty output',async()=>{const source=await fixture();for(const pages of [[],[{source:0,index:99,rotation:0}],[{source:0,index:0,rotation:12}],[{source:8,index:0,rotation:0}]])await assert.rejects(core.workspace([source],{pages},lib));});
test('selection is bounded to its active document, including toggle and shift-range',()=>{
 const panes=[{id:'a',pages:[1,2,3,4].map(id=>({id:String(id)}))},{id:'b',pages:[{id:'5'},{id:'6'}]}];
 let state=M.select(panes,new Set(),'1','3',{range:true});assert.deepEqual([...state.selected],['1','2','3']);
 state=M.select(panes,state.selected,state.anchor,'2',{toggle:true});assert.deepEqual([...state.selected],['1','3']);
 state=M.select(panes,state.selected,state.anchor,'5',{toggle:true});assert.equal(state.active,'b');assert.deepEqual([...state.selected],['5']);
});
test('moving to a final position and nudging preserve selected groups',()=>{
 const panes=[{id:'a',pages:['a','b','c','d','e'].map(id=>({id}))}];
 M.moveToPosition(panes,['b','d'],'a',3);assert.deepEqual(panes[0].pages.map(p=>p.id),['a','c','b','d','e']);
 M.nudge(panes[0].pages,['b','d'],'up');assert.deepEqual(panes[0].pages.map(p=>p.id),['a','b','d','c','e']);
 M.nudge(panes[0].pages,['b','d'],'down');assert.deepEqual(panes[0].pages.map(p=>p.id),['a','c','b','d','e']);
 assert.throws(()=>M.moveToPosition(panes,['b','d'],'a',5),/final position/);
});
test('explicit export target stays fixed and unused source files are excluded',()=>{
 const panes=[{id:'a',pages:[{id:'1',source:3,index:0,rotation:0}]},{id:'b',pages:[{id:'2',source:1,index:0,rotation:0}]}];
 assert.equal(M.exportPlan(panes,'b','a','all',new Set())[0].id,'1');
 assert.equal(M.exportPlan(panes,'b','active','all',new Set())[0].id,'2');
 assert.deepEqual(M.exportPlan(panes,'a','b','selected',new Set(['1'])),[]);
 const plan=M.packSources([null,{file:'B'},null,{file:'A'}],M.exportPlan(panes,'a','combined','all',new Set()));
 assert.deepEqual(plan.files,['A','B']);assert.deepEqual(plan.pages.map(p=>p.source),[0,1]);
});
test('history ignores no-op changes, caps edits and keeps redo across no-ops',()=>{
 const h=new M.History(2);h.record({v:0},{v:1});h.record({v:1},{v:2});h.record({v:2},{v:3});
 assert.equal(h.past.length,2);assert.deepEqual(h.undo({v:3}),{v:2});
 assert.equal(h.record({v:2},{v:2}),false);assert.deepEqual(h.redo({v:2}),{v:3});
 h.record({v:3},{v:4});assert.equal(h.future.length,0);
});
test('failed transfers do not mutate the workspace',()=>{
 const panes=[{id:'a',pages:[{id:'1'}]},{id:'b',pages:[]}],before=M.clone(panes);
 assert.throws(()=>M.transfer(panes,['1'],'b','missing'),/no longer available/);assert.deepEqual(panes,before);
 const full=[{id:'a',pages:Array.from({length:500},(_,i)=>({id:String(i)}))}];
 assert.throws(()=>M.transfer(full,['0'],'a',null,true),/500 pages/);assert.equal(full[0].pages.length,500);
});
test('blank pages can be resized, and negative source rotations normalize correctly',async()=>{
 const source=await lib.PDFDocument.create();source.addPage([300,600]);const p=source.addPage([300,600]);p.drawText('Negative rotation');p.setRotation(lib.degrees(-90));
 const input=file('blank-and-rotated.pdf',await source.save());
 const result=await core.workspace([input],{paper:'letter',pages:[{source:0,index:0,rotation:0},{source:0,index:1,rotation:0}]},lib);
 const doc=await lib.PDFDocument.load(result.bytes);assert.equal(doc.getPageCount(),2);assert.deepEqual(doc.getPage(0).getSize(),{width:612,height:792});
 const original=await core.workspace([input],{pages:[{source:0,index:1,rotation:0}]},lib);assert.equal((await lib.PDFDocument.load(original.bytes)).getPage(0).getRotation().angle,270);
});
