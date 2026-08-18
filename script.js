/* V4.0 — Theme boot: run before other UI work and never let theme errors break the site. */
(function(){try{var r=document.documentElement,s=localStorage.getItem("portfolio-theme"),m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches;var t=s==="light"||s==="dark"?s:(m?"light":"dark");r.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();

const data={
about:{label:"01 / IDENTITY",title:"Muhammad<br>Arsalan.",sub:"IT Support professional in Riyadh with hands-on experience across user support, Windows, Microsoft 365, Active Directory, networking and aviation technical operations.",rows:[["TARGET","IT SUPPORT / HELP DESK / DESKTOP SUPPORT"],["EDUCATION","Master of Computer Science"],["APPROACH","OBSERVE → TEST → RESOLVE → VERIFY → DOCUMENT"],["LOCATION","RIYADH, SAUDI ARABIA"]]},
experience:{label:"02 / EXPERIENCE",title:"Career<br>path.",sub:"Technical support, education and aviation documentation have built a practical combination of troubleshooting, accuracy and user communication.",exp:[["JAN 2025 — PRESENT","Technical Data Officer","Alpha Star Aviation Services","Aircraft technical records, work orders, hours and cycles, planning coordination, CAMP, TRAX, oil-trending records and SMRFs."],["DEC 2023 — JUN 2024","IT Support Officer","Technic Mentor Soft Solution","Level 1/2 support, Windows/macOS, Active Directory, Microsoft 365, printers, Windows Server, DNS, DHCP, VPN and remote support."],["DEC 2022 — SEP 2023","ICT Teacher","The City School — Paragon Campus","Microsoft Office, HTML/CSS, programming fundamentals, classroom technology and user guidance."],["JAN 2021 — NOV 2022","ICT Teacher","IISAT","ICT teaching, classroom technology and academic technology support."]]},
systems:{label:"03 / SYSTEMS",title:"Technical<br>systems.",sub:"A focused technical stack aligned with IT Support and junior system administration roles.",rows:[["IT SUPPORT","Level 1/2 · Windows 10/11 · macOS · hardware/software · printers · remote support"],["IDENTITY","Active Directory · OUs · users/groups · password resets · Group Policy basics"],["NETWORKING","TCP/IP · DNS · DHCP · VPN · Wi-Fi · Packet Tracer · Wireshark basics"],["MICROSOFT","Microsoft 365 · Office · Outlook · Teams"],["ITSM","ServiceNow · Jira Service Management · ticket documentation"]]},
ai:{label:"04 / AI NODE",title:"AI as a<br>working tool.",sub:"I use AI as a practical productivity layer while keeping verification, privacy, security and responsibility with the person doing the work.",rows:[["RESEARCH","Assist technical research and learning"],["DOCUMENTATION","Structure and improve technical documentation"],["PRODUCTIVITY","Organize repeatable information-heavy tasks"],["TROUBLESHOOTING","Support structured investigation"],["RULE","AI ASSISTS. HUMAN JUDGMENT DECIDES."]]},
achievements:{label:"05 / ACHIEVEMENTS",title:"Verified<br>foundations.",sub:"Education and workplace training verified against my current resume.",rows:[["EDUCATION","Master of Computer Science · Superior University · 2022 · GPA 3.23 / 4.00"],["DIPLOMA","Graphic Designing · Muslim Hands College of Computer Science · 2015"],["TRAINING","Human Factor · GACA Regulations · HAZMAT · QSMS"],["PRACTICAL LEARNING","Windows Server · Active Directory · Packet Tracer · VirtualBox · Wireshark"]]},
contact:{label:"06 / CONTACT",title:"Let's<br>connect.",sub:"Open to IT Support, Help Desk, Desktop Support, Service Desk and related opportunities in Saudi Arabia.",contact:true}
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
document.getElementById("panelClose")?.addEventListener("click",closePanel);
document.getElementById("panelBackdrop")?.addEventListener("click",closePanel);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePanel()});
document.getElementById("traceBtn")?.addEventListener("click",()=>document.getElementById("network")?.scrollIntoView({behavior:"smooth",block:"center"}));
document.getElementById("mapToggle")?.addEventListener("click",()=>document.getElementById("network")?.scrollIntoView({behavior:"smooth",block:"center"}));
setTimeout(()=>document.getElementById("loader").classList.add("done"),1600);

/* V4.2 mobile navigation */
(function initMobileNavigation(){
  const menu=document.getElementById("mobileNav"),open=document.getElementById("mobileMenuToggle"),close=document.getElementById("mobileMenuClose");
  if(!menu||!open)return;
  const setOpen=value=>{menu.classList.toggle("open",value);menu.setAttribute("aria-hidden",String(!value));open.setAttribute("aria-expanded",String(value));document.body.style.overflow=value?"hidden":"";if(value)close?.focus();};
  open.addEventListener("click",()=>setOpen(!menu.classList.contains("open")));close?.addEventListener("click",()=>setOpen(false));
  menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setOpen(false)));
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menu.classList.contains("open")){setOpen(false);open.focus();}});
  window.addEventListener("resize",()=>{if(window.innerWidth>820)setOpen(false)});
})();


/* =========================================================
   GLOBAL THEME CONTROLLER — V4.0 STABLE
   ========================================================= */
(function initTheme(){
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  function readSavedTheme(){
    try {
      const value = localStorage.getItem("portfolio-theme");
      return value === "light" || value === "dark" ? value : "";
    } catch (error) {
      return "";
    }
  }

  function saveTheme(theme){
    try { localStorage.setItem("portfolio-theme", theme); } catch (error) {}
  }

  function systemTheme(){
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch (error) {
      return "dark";
    }
  }

  function applyTheme(theme, persist){
    const safeTheme = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", safeTheme);
    if (persist) saveTheme(safeTheme);

    if (!toggle) return;
    const isLight = safeTheme === "light";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    const icon = toggle.querySelector(".theme-icon");
    const label = toggle.querySelector(".theme-label");
    if (icon) icon.textContent = isLight ? "☀" : "☾";
    if (label) label.textContent = isLight ? "Light" : "Dark";
  }

  const saved = readSavedTheme();
  applyTheme(saved || systemTheme(), false);

  if (toggle) {
    toggle.addEventListener("click", () => {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  if (!saved && window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const sync = (event) => applyTheme(event.matches ? "light" : "dark", false);
    if (media.addEventListener) media.addEventListener("change", sync);
    else if (media.addListener) media.addListener(sync);
  }
})();
