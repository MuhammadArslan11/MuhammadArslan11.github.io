(()=>{'use strict';
let course=window.ACADEMY_COURSES.find(c=>c.published!==false&&c.modules?.some(m=>m.topics?.length))||window.ACADEMY_COURSES[0], topics=course.modules.flatMap(m=>m.topics.map(t=>({...t,moduleId:m.id,moduleTitle:m.title})));
const STORE_KEY='academy-os-progress-v2';
const storage={
  empty:()=>({version:2,courseId:course.id,topics:{},events:[]}),
  load(){try{const v=JSON.parse(localStorage.getItem(STORE_KEY));return v&&v.version===2?{...this.empty(),...v}:this.empty()}catch{return this.empty()}},
  save(v){localStorage.setItem(STORE_KEY,JSON.stringify(v));if(window.PortfolioAPI)window.PortfolioAPI.queue('academy-progress',()=>window.PortfolioAPI.saveAcademyProgress(v))}
};
let state=storage.load(), activeTopic=null, roadmapFilter='all';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topicBy=id=>topics.find(t=>t.id===id);
const record=id=>state.topics[id]||{status:'not-started',quizAttempts:[],practicalComplete:false,contentComplete:false};
function requirements(t){return (t.prerequisites||[]).filter(p=>p.type==='required')}
function unlocked(t){return requirements(t).every(p=>completed(topicBy(p.topicId)))}
function bestScore(id){const a=record(id).quizAttempts||[];return a.length?Math.max(...a.map(x=>x.score)):0}
function status(t){const r=record(t.id), score=bestScore(t.id);if(!unlocked(t))return'locked';if(r.contentComplete&&r.practicalComplete&&score>=85)return'mastered';if(r.contentComplete&&r.practicalComplete&&score>=t.quiz.passingScore)return'completed';if((r.quizAttempts||[]).length&&score<t.quiz.passingScore)return'needs-revision';if(r.contentComplete||r.practicalComplete||(r.quizAttempts||[]).length)return'in-progress';return'available'}
function completed(t){return ['completed','mastered'].includes(status(t))}
function metrics(){
  const completedCount=topics.filter(completed).length, masteredCount=topics.filter(t=>status(t)==='mastered').length;
  const attempts=topics.flatMap(t=>(record(t.id).quizAttempts||[]).map(a=>a.score));
  const practical=topics.filter(t=>record(t.id).practicalComplete).length;
  const knowledge=topics.length?Math.round(topics.reduce((n,t)=>n+bestScore(t.id),0)/topics.length):0;
  const completion=Math.round(completedCount/topics.length*100), mastery=Math.round(masteredCount/topics.length*100);
  const practicalPct=Math.round(practical/topics.length*100), assessment=attempts.length?Math.round(attempts.reduce((a,b)=>a+b,0)/attempts.length):0;
  const readiness=Math.round(completion*.25+knowledge*.35+practicalPct*.25+assessment*.15);
  return{completedCount,masteredCount,practical,completion,mastery,knowledge,assessment,readiness,revision:topics.filter(t=>status(t)==='needs-revision').length}
}
function nextAction(){
  const revision=topics.find(t=>status(t)==='needs-revision');
  if(revision)return{type:'REVIEW RECOMMENDED',title:`Review ${revision.title}`,copy:`Your best quiz score is ${bestScore(revision.id)}%. Revisit the topic and retry the check to reach ${revision.quiz.passingScore}%.`,id:revision.id};
  const current=topics.find(t=>status(t)==='in-progress');
  if(current)return{type:'CONTINUE LEARNING',title:`Continue ${current.title}`,copy:'Finish the remaining learning, practical, or knowledge-check requirement.',id:current.id};
  const next=topics.find(t=>status(t)==='available');
  if(next)return{type:'NEXT BEST ACTION',title:`Start ${next.title}`,copy:`This is the next available topic in ${next.moduleTitle}.`,id:next.id};
  return{type:'PATH COMPLETE',title:'Review your readiness',copy:'You completed every required topic. Use performance signals to strengthen any score below mastery.',route:'performance'};
}
function log(type,topicId,label){state.events.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),type,topicId,label,at:new Date().toISOString()});state.events=state.events.slice(0,80)}
function update(id,changes,event){state.topics[id]={...record(id),...changes,lastActivity:new Date().toISOString()};if(event)log(event.type,id,event.label);storage.save(state)}
function route(){
  const raw=location.hash.slice(1)||'home', [name,param]=raw.split('/');
  const route=['home','course','performance','topic'].includes(name)?name:'home';
  $$('.route').forEach(el=>el.classList.toggle('active',el.dataset.route===route));
  $$('[data-route-link]').forEach(a=>{const active=a.dataset.routeLink===route;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  document.body.classList.toggle('in-app',route!=='home');
  if(route==='course')renderCourse();
  if(route==='performance')renderPerformance();
  if(route==='topic'){activeTopic=topicBy(param);if(!activeTopic){location.hash='course';return}renderTopic(activeTopic)}
  document.title=route==='home'?'Academy OS — Learn in the right order':route==='topic'?`${activeTopic.title} — Academy OS`:`${route==='course'?'IT Support':'Performance'} — Academy OS`;
  window.scrollTo(0,0);$('#mainContent').focus({preventScroll:true});
}
function metric(label,value,note){const amount=Math.max(0,Math.min(100,Number.parseInt(value,10)||0));return `<article class="metric"><div><span>${label}</span><strong>${value}</strong></div><div class="metric-track" aria-hidden="true"><i style="width:${amount}%"></i></div><small>${note}</small></article>`}
function renderCourse(){
  const m=metrics(), next=nextAction();
  const courseView=$('#route-course'),courseName=$('.course-id strong',courseView),courseMark=$('.course-id>span',courseView);courseName.textContent=course.title;courseMark.textContent=course.title.split(/\s+/).map(word=>word[0]).join('').slice(0,2).toUpperCase();
  $('#sideProgress').textContent=m.completion+'%';$('#sideProgressBar').style.width=m.completion+'%';$('#sideProgressBar').parentElement.setAttribute('aria-valuenow',String(m.completion));$('#sideProgressLabel').textContent=`${m.completedCount} of ${topics.length} topics completed`;
  $('#nextActionCard').innerHTML=`<div class="next-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></div><div><span>${next.type}</span><h2>${esc(next.title)}</h2><p>${esc(next.copy)}</p></div><a class="button primary" href="#${next.route||'topic/'+next.id}">${next.type.startsWith('REVIEW')?'Review topic':next.route?'View performance':'Open topic'} →</a>`;
  $('#courseMetrics').innerHTML=metric('COURSE PROGRESS',m.completion+'%','Required topics completed')+metric('MASTERY',m.mastery+'%','Topics at 85% or above')+metric('PRACTICAL WORK',`${m.practical}/${topics.length}`,'Tasks marked complete')+metric('READINESS',m.readiness+'%','Activity-based indicator');
  const matches=t=>roadmapFilter==='all'||(roadmapFilter==='ready'&&status(t)==='available')||(roadmapFilter==='active'&&['in-progress','needs-revision'].includes(status(t)))||(roadmapFilter==='complete'&&completed(t));
  const visible=topics.filter(matches);$('#roadmapCount').textContent=`Showing ${visible.length} of ${topics.length} topics`;
  $('#moduleList').innerHTML=course.modules.map((mod,i)=>{const mt=topics.filter(t=>t.moduleId===mod.id),shown=mt.filter(matches),done=mt.filter(completed).length,pct=mt.length?Math.round(done/mt.length*100):0;if(!shown.length)return'';return `<article class="module-card"><div class="module-number">${String(i+1).padStart(2,'0')}</div><div class="module-body"><div class="module-head"><div><span>MODULE ${i+1} · ${done} OF ${mt.length} COMPLETE</span><h3>${esc(mod.title)}</h3><p>${esc(mod.description)}</p></div><b>${pct}%</b></div><div class="module-progress" role="progressbar" aria-label="${esc(mod.title)} completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div><div class="topic-list">${shown.map(topicRow).join('')}</div></div></article>`}).join('')||`<div class="path-empty"><strong>No topics in this view</strong><p>Choose another filter to see the rest of your learning path.</p><button type="button" data-path-filter="all">Show all topics</button></div>`;
}
function topicRow(t){
  const s=status(t), req=requirements(t), why=s==='locked'?req.filter(p=>!completed(topicBy(p.topicId))).map(p=>topicBy(p.topicId).title).join(' and '):'';
  const label=s==='available'?'Start':s==='in-progress'?'Continue':s==='needs-revision'?'Review':s==='mastered'?'Mastered':s==='completed'?'Completed':'Locked';const content=`<span class="state-icon">${['mastered','completed'].includes(s)?'✓':s==='locked'?'—':s==='needs-revision'?'!':'→'}</span><span class="topic-name"><strong>${esc(t.title)}</strong><small>${s==='locked'?`Complete ${esc(why)} to unlock`:s.replace('-',' ')+' · '+t.time}</small></span><span class="skill-chips">${t.skills.slice(0,2).map(x=>`<i>${esc(x)}</i>`).join('')}</span><b class="topic-action">${label}${s==='locked'?'':' →'}</b>`;return s==='locked'?`<div class="topic-row ${s}" aria-label="${esc(t.title)} locked">${content}</div>`:`<a class="topic-row ${s}" href="#topic/${t.id}">${content}</a>`
}
function blockHtml(b){
  if(b.items){const tag=b.type==='ordered-list'?'ol':'ul';return `<section class="content-block ${b.type}"><h2>${esc(b.title)}</h2><${tag}>${b.items.map(x=>`<li>${esc(x)}</li>`).join('')}</${tag}></section>`}
  return `<section class="content-block ${b.type}"><span>${b.type.replace('-',' ')}</span><h2>${esc(b.title)}</h2><p>${esc(b.body)}</p></section>`
}
function renderTopic(t){
  if(!unlocked(t)){location.hash='course';return}
  const r=record(t.id), s=status(t), req=(t.prerequisites||[]).map(p=>`${topicBy(p.topicId).title} (${p.type})`).join(', '),position=topics.findIndex(x=>x.id===t.id),previous=topics[position-1],next=topics[position+1];
  const passed=bestScore(t.id)>=t.quiz.passingScore;
  $('#topicView').innerHTML=`<div class="topic-top"><a href="#course">← Back to roadmap</a><span>IT Support · ${esc(t.moduleTitle)}</span><a href="#performance">Performance</a></div><div class="topic-layout"><aside class="topic-aside"><p class="eyebrow">TOPIC ${position+1} OF ${topics.length}</p><strong class="topic-status ${s}">${s.replace('-',' ')}</strong><div class="lesson-steps" aria-label="Topic completion requirements"><div class="${r.contentComplete?'done':''}"><span>${r.contentComplete?'✓':'1'}</span><p><strong>Learn</strong><small>Read the material</small></p></div><div class="${r.practicalComplete?'done':''}"><span>${r.practicalComplete?'✓':'2'}</span><p><strong>Practise</strong><small>Complete the task</small></p></div><div class="${passed?'done':''}"><span>${passed?'✓':'3'}</span><p><strong>Check</strong><small>Pass the quiz</small></p></div></div><dl><div><dt>Time</dt><dd>${t.time}</dd></div><div><dt>Pass score</dt><dd>${t.quiz.passingScore}%</dd></div><div><dt>Prerequisites</dt><dd>${esc(req||'None')}</dd></div></dl><div class="topic-objectives"><span>YOU WILL LEARN</span><ul>${t.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></aside><article class="lesson-content"><header><p class="eyebrow">${esc(t.moduleTitle)}</p><h1>${esc(t.title)}</h1><p>Study the core ideas, complete the practical task, and pass the knowledge check to move forward.</p></header>${t.blocks.map(blockHtml).join('')}<section class="completion-step"><div><span>STEP 1</span><h2>Finish the learning material</h2><p>Confirm after you have read the required sections and can explain the objectives in your own words.</p></div><button class="button ${r.contentComplete?'complete':'secondary'}" id="completeContent" type="button">${r.contentComplete?'Completed ✓':'Mark learning complete'}</button></section><section class="practical-card"><p class="eyebrow">STEP 2 · PRACTICAL TASK</p><h2>${esc(t.practical.title)}</h2><ol>${t.practical.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><label class="check-control"><input id="practicalCheck" type="checkbox" ${r.practicalComplete?'checked':''}><span>I completed and verified this task</span></label></section><section class="quiz-card"><p class="eyebrow">STEP 3 · KNOWLEDGE CHECK</p><h2>Check your understanding</h2><p>Pass score: ${t.quiz.passingScore}% · Best score: ${bestScore(t.id)}%</p><form id="quizForm">${t.quiz.questions.map(questionHtml).join('')}<button class="button primary" type="submit">Check answers</button></form><div id="quizResult" class="quiz-result" role="status" tabindex="-1"></div></section><nav class="lesson-nav" aria-label="Lesson navigation">${previous?`<a href="#topic/${previous.id}"><span>← PREVIOUS</span><strong>${esc(previous.title)}</strong></a>`:'<span></span>'}${next?`<a href="${unlocked(next)?'#topic/'+next.id:'#course'}" class="next"><span>NEXT →</span><strong>${esc(next.title)}</strong></a>`:`<a href="#performance" class="next"><span>FINISH →</span><strong>View performance</strong></a>`}</nav></article></div>`;
  $('#completeContent').addEventListener('click',()=>{update(t.id,{contentComplete:true,status:'in-progress'},{type:'topic-content-completed',label:`Completed learning material: ${t.title}`});toast('Learning material completed');renderTopic(t)});
  $('#practicalCheck').addEventListener('change',e=>{update(t.id,{practicalComplete:e.target.checked},{type:e.target.checked?'practical-completed':'practical-reopened',label:`${e.target.checked?'Completed':'Reopened'} practical task: ${t.title}`});toast(e.target.checked?'Practical task recorded':'Practical task reopened')});
  $('#quizForm').addEventListener('submit',e=>submitQuiz(e,t));
}
function questionHtml(q,i){
  const multi=q.type==='multiple-select', type=multi?'checkbox':'radio';
  return `<fieldset class="question"><legend><span>QUESTION ${i+1} OF ${activeTopic.quiz.questions.length}</span>${esc(q.text)}${multi?'<small>Select all that apply</small>':''}</legend>${q.options.map((o,j)=>`<label><input type="${type}" name="${q.id}" value="${j}"><span>${esc(o)}</span></label>`).join('')}<p class="answer-note" data-note="${q.id}"></p></fieldset>`
}
function submitQuiz(e,t){
  e.preventDefault();const unanswered=t.quiz.questions.filter(q=>!$$(`[name="${q.id}"]:checked`,e.target).length);$$('.question',e.target).forEach(field=>field.classList.remove('invalid'));if(unanswered.length){unanswered.forEach(q=>$(`[name="${q.id}"]`,e.target)?.closest('.question')?.classList.add('invalid'));const result=$('#quizResult');result.innerHTML=`<strong>Answer every question</strong><p>${unanswered.length} ${unanswered.length===1?'question is':'questions are'} still unanswered. Your current answers have been kept.</p>`;result.className='quiz-result show failed';result.focus();return}let correct=0;
  t.quiz.questions.forEach(q=>{const selected=$$(`[name="${q.id}"]:checked`,e.target).map(x=>Number(x.value));const answer=Array.isArray(q.answer)?q.answer:[q.answer];const ok=selected.length===answer.length&&selected.every(x=>answer.includes(x));if(ok)correct++;const note=$(`[data-note="${q.id}"]`,e.target);note.textContent=(ok?'Correct. ':'Review: ')+q.explanation;note.className='answer-note '+(ok?'correct':'incorrect')});
  const score=Math.round(correct/t.quiz.questions.length*100), passed=score>=t.quiz.passingScore, attempt={score,passed,at:new Date().toISOString()};
  update(t.id,{quizAttempts:[...(record(t.id).quizAttempts||[]),attempt]},{type:passed?'quiz-passed':'quiz-needs-review',label:`${passed?'Passed':'Attempted'} ${t.title} knowledge check · ${score}%`});
  const result=$('#quizResult');result.innerHTML=`<strong>${score}% · ${passed?'Passed':'Review recommended'}</strong><p>${passed?'Good work. Complete the learning and practical requirements to unlock dependent topics.':`Review the explanations and retry when ready. You need ${t.quiz.passingScore}% to pass.`}</p>`;result.className='quiz-result show '+(passed?'passed':'failed');result.focus();toast(passed?'Knowledge check passed':'Review recommended');
}
function renderPerformance(){
  const m=metrics();
  $('#performanceMetrics').innerHTML=metric('COURSE PROGRESS',m.completion+'%',`${m.completedCount} of ${topics.length} topics`)+metric('COURSE MASTERY',m.mastery+'%',`${m.masteredCount} topics mastered`)+metric('QUIZ AVERAGE',m.assessment+'%','Across all attempts')+metric('READINESS',m.readiness+'%','Internal learning indicator');
  $('#skillBars').innerHTML=course.skills.map(skill=>{const st=topics.filter(t=>t.skills.includes(skill)), active=st.filter(t=>(record(t.id).quizAttempts||[]).length), value=active.length?Math.round(active.reduce((n,t)=>n+bestScore(t.id),0)/st.length):0;return `<div class="skill-row"><div><strong>${esc(skill)}</strong><span>${value}%</span></div><div class="progress-track"><i style="width:${value}%"></i></div><small>${active.length?active.length+' of '+st.length+' topics assessed':'No assessment data yet'}</small></div>`}).join('');
  const weak=topics.filter(t=>status(t)==='needs-revision'), strong=topics.filter(t=>bestScore(t.id)>=85);
  $('#attentionList').innerHTML=(weak.length?weak.map(t=>`<a href="#topic/${t.id}"><span>REVIEW</span><strong>${esc(t.title)}</strong><p>Best quiz score: ${bestScore(t.id)}%. Review and retry to reach ${t.quiz.passingScore}%.</p></a>`).join(''):`<div class="empty-state"><strong>No weak area identified yet</strong><p>Complete a knowledge check and the Learning GPS will show specific revision guidance here.</p><a href="#course">Continue learning →</a></div>`)+(strong.length?`<div class="strong-areas"><span>STRONG AREAS</span>${strong.slice(0,3).map(t=>`<a href="#topic/${t.id}"><strong>${esc(t.title)}</strong><b>${bestScore(t.id)}%</b></a>`).join('')}</div>`:'');
  const breakdown=[['Knowledge',m.knowledge,'Best quiz scores across the path'],['Practical',Math.round(m.practical/topics.length*100),'Verified practical tasks'],['Completion',m.completion,'Required topics completed'],['Assessments',m.assessment,'Average across attempts']];
  $('#readinessBreakdown').innerHTML=`<div class="readiness-score"><strong>${m.readiness}%</strong><span>IT Support readiness indicator</span></div>${breakdown.map(x=>`<div class="breakdown-row"><span>${x[0]}<small>${x[2]}</small></span><b>${x[1]}%</b></div>`).join('')}<p class="disclaimer">This score is an internal learning signal, not a certification or scientific prediction of job performance.</p>`;
  $('#historyList').innerHTML=state.events.length?state.events.slice(0,8).map(e=>`<li><span></span><div><strong>${esc(e.label)}</strong><small>${new Date(e.at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</small></div></li>`).join(''):`<li class="empty-history"><div><strong>No learning activity yet</strong><small>Your completed topics, practical tasks, and assessment attempts will appear here.</small></div></li>`;
}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}
function syncThemeButton(){const dark=document.documentElement.dataset.theme==='dark';$('#themeButton').setAttribute('aria-pressed',String(dark));$('#themeButton').setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme')}
syncThemeButton();$('#themeButton').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('portfolio-theme',next);syncThemeButton()});
$('#resetDemo').addEventListener('click',()=>{if(confirm('Reset all Academy OS progress saved in this browser?')){state=storage.empty();storage.save(state);renderCourse();toast('Progress reset')}});
$('#roadmapFilters').addEventListener('click',e=>{const button=e.target.closest('[data-path-filter]');if(!button)return;roadmapFilter=button.dataset.pathFilter;$$('[data-path-filter]',$('#roadmapFilters')).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderCourse()});
$('#moduleList').addEventListener('click',e=>{const button=e.target.closest('[data-path-filter="all"]');if(!button)return;roadmapFilter='all';$$('[data-path-filter]',$('#roadmapFilters')).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pathFilter==='all')));renderCourse()});
window.addEventListener('hashchange',route);route();
if(window.PortfolioAPI){
  Promise.allSettled([window.PortfolioAPI.getAcademyLibrary(),window.PortfolioAPI.getAcademyProgress()]).then(results=>{
    const library=results[0].status==='fulfilled'?results[0].value:null;
    if(Array.isArray(library?.courses)){const next=library.courses.find(c=>c.published!==false&&c.modules?.some(m=>m.topics?.length));if(next){course=next;topics=course.modules.flatMap(m=>m.topics.map(t=>({...t,moduleId:m.id,moduleTitle:m.title})))}}
    const remote=results[1].status==='fulfilled'?results[1].value?.progress:null;
    if(remote?.version===2&&remote.courseId===course.id){const localTime=Math.max(0,...(state.events||[]).map(e=>Date.parse(e.at)||0)),remoteTime=Math.max(0,...(remote.events||[]).map(e=>Date.parse(e.at)||0));if(remoteTime>localTime){state={...storage.empty(),...remote};localStorage.setItem(STORE_KEY,JSON.stringify(state));toast('Progress synced from your latest session')}}
    route();
  }).catch(error=>console.warn('Academy sync unavailable. Using local data.',error));
}
})();
