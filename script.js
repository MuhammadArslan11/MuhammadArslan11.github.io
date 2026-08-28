const root=document.documentElement;
const themeToggles=[...document.querySelectorAll('[data-theme-toggle],#themeToggle')];
const themeMeta=document.querySelector('meta[name="theme-color"]');

function applyTheme(theme,persist=false){
  const safe=theme==='dark'?'dark':'light';
  root.dataset.theme=safe;
  if(persist){try{localStorage.setItem('portfolio-theme',safe)}catch(error){}}
  const dark=safe==='dark';
  themeToggles.forEach(toggle=>{
    toggle.setAttribute('aria-pressed',String(dark));
    toggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');
  });
  themeMeta?.setAttribute('content',safe==='dark'?'#101719':'#f5f4ef');
  document.querySelectorAll('.brand img,.mobile-nav-head img').forEach(image=>image.src=safe==='dark'?'assets/ma-logo-dark.svg':'assets/ma-logo.svg');
}

applyTheme(root.dataset.theme);
themeToggles.forEach(toggle=>toggle.addEventListener('click',()=>applyTheme(root.dataset.theme==='dark'?'light':'dark',true)));

// Keep the theme in sync when another page changes it in a different tab.
window.addEventListener('storage',event=>{
  if(event.key==='portfolio-theme'&&(event.newValue==='light'||event.newValue==='dark')){
    applyTheme(event.newValue);
  }
});

try{
  if(!localStorage.getItem('portfolio-theme')){
    const media=matchMedia('(prefers-color-scheme:dark)');
    media.addEventListener?.('change',event=>applyTheme(event.matches?'dark':'light'));
  }
}catch(error){}

const header=document.getElementById('siteHeader');
const mobileNav=document.getElementById('mobileNav');
const menuOpen=document.getElementById('mobileMenuToggle');
const menuClose=document.getElementById('mobileMenuClose');
let lastMenuFocus=null;

function setMenu(open){
  if(!mobileNav||!menuOpen)return;
  mobileNav.classList.toggle('open',open);
  mobileNav.setAttribute('aria-hidden',String(!open));
  menuOpen.setAttribute('aria-expanded',String(open));
  document.body.classList.toggle('menu-open',open);
  if(open){lastMenuFocus=document.activeElement;window.setTimeout(()=>menuClose?.focus(),60)}
  else if(lastMenuFocus instanceof HTMLElement){lastMenuFocus.focus()}
}

menuOpen?.addEventListener('click',()=>setMenu(!mobileNav?.classList.contains('open')));
menuClose?.addEventListener('click',()=>setMenu(false));
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&mobileNav?.classList.contains('open'))setMenu(false);
  if(event.key==='Tab'&&mobileNav?.classList.contains('open')){
    const focusable=[...mobileNav.querySelectorAll('a,button')].filter(el=>!el.hasAttribute('disabled'));
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});
window.addEventListener('resize',()=>{if(innerWidth>1100&&mobileNav?.classList.contains('open'))setMenu(false)});

const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
  }),{threshold:.12,rootMargin:'0px 0px -40px'});
  revealItems.forEach(item=>revealObserver.observe(item));
}else revealItems.forEach(item=>item.classList.add('visible'));

const navLinks=[...document.querySelectorAll('.utility-dock a[href^="#"]')];
const trackedSections=navLinks.map(link=>document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
if('IntersectionObserver'in window){
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`));
  }),{rootMargin:'-35% 0px -55%',threshold:0});
  trackedSections.forEach(section=>sectionObserver.observe(section));
}

const utilityDock=document.getElementById('utilityDock');
let scrollStopTimer=0;
function syncHeader(){
  header?.classList.toggle('scrolled',scrollY>18);
  utilityDock?.classList.toggle('header-scrolled',scrollY>18);
  if(!utilityDock||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  utilityDock.classList.add('is-scrolling');
  clearTimeout(scrollStopTimer);
  scrollStopTimer=window.setTimeout(()=>utilityDock.classList.remove('is-scrolling'),60);
}
header?.classList.toggle('scrolled',scrollY>18);
utilityDock?.classList.toggle('header-scrolled',scrollY>18);
addEventListener('scroll',syncHeader,{passive:true});

const portraitStage=document.getElementById('heroPortrait');
if(portraitStage&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const layers=[...portraitStage.querySelectorAll('[data-portrait-depth]')];
  let portraitFrame=0;
  portraitStage.addEventListener('pointermove',event=>{
    const rect=portraitStage.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    cancelAnimationFrame(portraitFrame);
    portraitFrame=requestAnimationFrame(()=>layers.forEach(layer=>{
      const depth=Number(layer.dataset.portraitDepth)||.5;
      layer.style.setProperty('--shift-x',`${(x*24*depth).toFixed(2)}px`);
      layer.style.setProperty('--shift-y',`${(y*18*depth).toFixed(2)}px`);
    }));
  });
  portraitStage.addEventListener('pointerleave',()=>layers.forEach(layer=>{
    layer.style.removeProperty('--shift-x');
    layer.style.removeProperty('--shift-y');
  }));
}
