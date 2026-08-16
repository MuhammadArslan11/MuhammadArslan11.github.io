const data={
about:{label:"01 / IDENTITY",title:"Muhammad<br><em>Arsalan.</em>",sub:"IT Support professional with a Master's in Computer Science and hands-on experience across technical support, systems, documentation and aviation operations.",rows:[["FOCUS","IT SUPPORT / OPERATIONS / AI"],["EDUCATION","Master's in Computer Science"],["APPROACH","TROUBLESHOOT → RESOLVE → DOCUMENT"],["LOCATION","SAUDI ARABIA"]]},
experience:{label:"02 / EXPERIENCE",title:"Career<br><em>path.</em>",sub:"Technical support, education and aviation documentation have each added a different layer to my professional toolkit.",exp:[["JAN 2025 — PRESENT","Technical Data Officer","Alpha Star Aviation Services","Technical logs, work orders, aircraft documentation, flight hours/cycles, planning coordination, CAMP and TRAX."],["DEC 2023 — JUN 2024","IT Support Officer","Technic Mentor Soft Solution","Level 1/2 support, Windows/macOS, Active Directory, Microsoft 365, hardware/software, printers, Windows Server, DNS, DHCP, VPN and remote support."],["DEC 2022 — SEP 2023","ICT Teacher","The City School — Paragon Campus","Technology education, Microsoft Office, HTML/CSS basics and practical user guidance."],["JAN 2021 — NOV 2022","ICT Teacher","IISAT","ICT teaching, classroom technology and academic technology support."],["2018 — 2020","Web & Graphic Designer","Applitectures","Design projects plus HTML, CSS, JavaScript, React and Adobe tools."]]},
systems:{label:"03 / SYSTEMS",title:"Technical<br><em>systems.</em>",sub:"The practical technologies that support my IT-focused work.",rows:[["IT SUPPORT","Windows 10/11 · macOS · hardware/software troubleshooting · printers · Outlook · remote assistance"],["NETWORKING","TCP/IP · subnetting · DNS · DHCP · VPN · Wi-Fi · network troubleshooting · Packet Tracer · Wireshark"],["SYSTEMS","Active Directory · user administration · password resets · Group Policy basics · Windows Server · VirtualBox"],["MICROSOFT","Microsoft 365 · Office · Outlook · Teams"],["SECONDARY","Graphic Design · Adobe Creative Cloud · Figma · WordPress · React Native · Video Editing"]]},
ai:{label:"04 / AI NODE",title:"AI as a<br><em>working tool.</em>",sub:"I use AI as a practical productivity layer around IT work — not as an inflated job title.",rows:[["RESEARCH","Assist technical research and learning"],["DOCUMENTATION","Structure, draft and improve technical documentation"],["PRODUCTIVITY","Organize repetitive information-heavy tasks"],["TROUBLESHOOTING","Support structured investigation and idea generation"],["RULE","AI ASSISTS. HUMAN JUDGEMENT DECIDES."]]},
achievements:{label:"05 / ACHIEVEMENTS",title:"Proof of<br><em>growth.</em>",sub:"Real milestones from my education and professional development.",rows:[["EDUCATION","Master's in Computer Science · Superior University · 2022 · GPA 3.23 / 4.00"],["TECHNICAL","Hands-on Level 1/2 IT support across Windows, macOS, Microsoft 365, Active Directory, hardware and network issues"],["OPERATIONS","Current aviation technical documentation and planning environment using CAMP and TRAX"],["FOUNDATION","Computer Science education plus Graphic Designer Diploma and practical creative technology experience"]]},
contact:{label:"06 / CONTACT",title:"Let's<br><em>connect.</em>",sub:"For IT Support, Technical Support, IT Operations and related opportunities.",contact:true}
};
const panel=document.getElementById("panel"),body=document.getElementById("panelBody"),label=document.getElementById("panelLabel"),panelAside=panel.querySelector("aside");
let lastTrigger=null;
function openNode(key){
 lastTrigger=document.activeElement;
 const d=data[key]; label.textContent=d.label;
 let h=`<div class="panel-kicker">${d.label}</div><h2 class="panel-title">${d.title}</h2><p class="panel-sub">${d.sub}</p>`;
 if(d.exp) h+=d.exp.map(x=>`<article class="panel-exp"><small>${x[0]}</small><h3>${x[1]}</h3><strong>${x[2]}</strong><p>${x[3]}</p></article>`).join("");
 if(d.rows) h+=`<div style="margin-top:38px">${d.rows.map(x=>`<div class="panel-row"><b>${x[0]}</b><div>${x[1]}</div></div>`).join("")}</div>`;
 if(d.contact) h+=`<div style="margin-top:40px"><a class="panel-link" href="mailto:m.arslanrafaqat@gmail.com">m.arslanrafaqat@gmail.com ↗</a><a class="panel-link" href="https://www.linkedin.com/in/muhammadarsl33" target="_blank" rel="noopener">LinkedIn ↗</a><a class="panel-link" href="https://github.com/MuhammadArsalan11" target="_blank" rel="noopener">GitHub ↗</a><a class="panel-link" href="assets/Muhammad_Arsalan_Resume.pdf" download>Download resume ↗</a></div>`;
 body.innerHTML=h;panel.classList.add("open");panel.setAttribute("aria-hidden","false");
 document.querySelectorAll(".node").forEach(n=>n.classList.toggle("active",n.dataset.node===key));
 document.body.style.overflow="hidden";
 panelAside.focus();
}
function closePanel(){panel.classList.remove("open");panel.setAttribute("aria-hidden","true");document.body.style.overflow="";document.querySelectorAll(".node").forEach(n=>n.classList.remove("active"));if(lastTrigger && typeof lastTrigger.focus==="function")lastTrigger.focus();}
document.querySelectorAll("[data-node]").forEach(el=>el.addEventListener("click",()=>openNode(el.dataset.node)));
document.getElementById("panelClose").addEventListener("click",closePanel);
document.getElementById("panelBackdrop").addEventListener("click",closePanel);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePanel()});
document.getElementById("traceBtn").addEventListener("click",()=>document.getElementById("network").scrollIntoView({behavior:"smooth",block:"center"}));
document.getElementById("mapToggle").addEventListener("click",()=>document.getElementById("network").scrollIntoView({behavior:"smooth",block:"center"}));
setTimeout(()=>document.getElementById("loader").classList.add("done"),1600);


/* =========================================================
   GLOBAL THEME CONTROLLER — V3.5
   ========================================================= */
(function initTheme(){
  const root=document.documentElement;
  const toggle=document.getElementById("themeToggle");
  const saved=localStorage.getItem("portfolio-theme");
  const system=window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  const initial=saved==="light" || saved==="dark" ? saved : system;

  function applyTheme(theme, persist){
    const safeTheme=theme==="light" ? "light" : "dark";
    root.setAttribute("data-theme",safeTheme);
    if(persist) localStorage.setItem("portfolio-theme",safeTheme);
    if(!toggle) return;
    const isLight=safeTheme==="light";
    toggle.setAttribute("aria-pressed",String(isLight));
    toggle.setAttribute("aria-label",isLight ? "Switch to dark theme" : "Switch to light theme");
    const icon=toggle.querySelector(".theme-icon");
    const label=toggle.querySelector(".theme-label");
    if(icon) icon.textContent=isLight ? "☀" : "☾";
    if(label) label.textContent=isLight ? "Light" : "Dark";
  }

  applyTheme(initial,false);
  if(toggle) toggle.addEventListener("click",()=>{
    applyTheme(root.getAttribute("data-theme")==="dark" ? "light" : "dark",true);
  });

  if(!saved && window.matchMedia){
    const media=window.matchMedia("(prefers-color-scheme: light)");
    const sync=e=>applyTheme(e.matches ? "light" : "dark",false);
    if(media.addEventListener) media.addEventListener("change",sync);
    else if(media.addListener) media.addListener(sync);
  }
})();
