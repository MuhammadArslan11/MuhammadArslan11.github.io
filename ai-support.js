/* =========================================================
   AI IT SUPPORT ENGINE
   STAGE 1 — Guided rule-based troubleshooting
   ========================================================= */

(function(){
"use strict";

/* STEP 1 — Knowledge base and supported domains */


/* STEP 2 — Stage-1 scenario generation */
/* Daily IT Support knowledge base: 48 domains x 24 common scenario patterns. */
const DOMAINS=[
["Network & Internet",["internet","network","ethernet","website","connection","gateway","internet access"]],
["Wi-Fi",["wifi","wi-fi","wireless","ssid","access point","wireless network"]],
["DNS",["dns","nslookup","resolve","hostname","name resolution","domain name"]],
["DHCP / IP",["dhcp","ip address","169.254","apipa","lease","subnet","default gateway"]],
["Windows",["windows","event viewer","task manager","windows update","explorer","settings"]],
["Active Directory",["active directory","domain controller","gpo","group policy","domain join","organizational unit"]],
["Accounts & Login",["login","sign in","password","account","locked","credential","username","mfa","authentication"]],
["Password & MFA",["password reset","password expired","mfa","multi-factor","verification code","authenticator"]],
["Printers",["printer","printing","print","spooler","queue","offline","paper jam"]],
["Email / Outlook",["outlook","email","mail","exchange","send","receive","mailbox","attachment"]],
["Microsoft 365",["microsoft 365","office 365","teams","sharepoint","onedrive","word","excel","powerpoint"]],
["Teams",["teams","meeting","call","chat","teams microphone","teams camera"]],
["OneDrive",["onedrive","sync","file sync","cloud files","onedrive storage"]],
["SharePoint",["sharepoint","site","document library","sharepoint access"]],
["Hardware",["laptop","computer","keyboard","mouse","monitor","screen","battery","usb","docking station"]],
["Monitors & Displays",["monitor","display","screen","hdmi","displayport","resolution","dual monitor"]],
["Keyboard & Mouse",["keyboard","mouse","touchpad","trackpad","keys","cursor"]],
["USB & Peripherals",["usb","flash drive","external drive","webcam","headset","dock","peripheral"]],
["Software & Applications",["software","application","app","program","install","crash","license","application error"]],
["Browsers",["chrome","edge","firefox","browser","cache","cookies","certificate","web page"]],
["VPN / Remote Access",["vpn","remote access","rdp","remote desktop","tunnel","remote login"]],
["File Shares & Drives",["shared folder","file share","smb","network drive","mapped drive","permissions","shared drive"]],
["Servers",["server","windows server","file server","service unavailable","server down","server connection"]],
["Performance",["slow","performance","cpu","memory","ram","lag","freeze","high cpu","high memory"]],
["Storage & Disk",["disk","storage","ssd","hdd","space","disk full","partition","low disk space"]],
["Backup & Recovery",["backup","restore","recovery","backup job","restore point","data recovery"]],
["Security / Endpoint",["antivirus","defender","firewall","malware","security","endpoint","threat"]],
["Permissions & Access",["permission","access denied","unauthorized","folder access","file access","rights"]],
["Certificates & Time",["time sync","clock","certificate","tls","ssl","ntp","certificate error"]],
["Audio / Video",["microphone","camera","webcam","speaker","audio","video","headset","sound"]],
["Mobile & BYOD",["iphone","android","mobile","phone","tablet","byod","mobile device"]],
["Virtualization",["virtualbox","vmware","virtual machine","vm","hyper-v","virtualization"]],
["Cloud / IAM",["aws","azure","cloud","ec2","s3","iam","security group","cloud login"]],
["Git / Developer Tools",["git","github","repository","npm","node","python","branch","developer"]],
["PowerShell / Command Line",["powershell","command prompt","cmd","terminal","command line","script"]],
["File & Folder Management",["file","folder","rename","copy","move","delete","zip","unzip"]],
["Windows Updates",["windows update","update failed","cumulative update","update stuck","restart update"]],
["Drivers & Device Manager",["driver","device manager","unknown device","driver update","device error"]],
["System Services",["service","services.msc","background service","service stopped","service failed"]],
["Event Logs",["event viewer","event log","application log","system log","error log"]],
["Help Desk & Tickets",["ticket","incident","request","help desk","service desk","sla","escalation"]],
["Remote Support",["remote support","screen sharing","remote assistance","anydesk","teamviewer"]],
["User Onboarding",["new user","onboarding","new employee","account setup","computer setup","access request"]],
["Offboarding",["offboarding","leaver","disable account","remove access","employee leaving"]],
["Asset Management",["asset","inventory","serial number","laptop asset","equipment","it asset"]],
["Network Devices",["switch","router","firewall","access point","network device","port"]],
["Internet & Proxy",["proxy","proxy server","web filter","internet filter","blocked website"]],
["Data & Privacy",["data privacy","sensitive data","personal data","data protection","privacy"]]
];
const VARIANTS=[
"not working","not connecting","connection fails","shows an error","keeps disconnecting",
"is slow","is unavailable","is blocked","cannot be accessed","stopped working",
"fails after login","cannot be configured","shows incorrect settings","cannot be installed",
"cannot be updated","works for others but not me","fails intermittently","returns an error",
"needs troubleshooting","needs a complete diagnosis","is not responding","is offline",
"keeps asking for credentials","started failing today"
];
const KB=[];
DOMAINS.forEach(d=>VARIANTS.forEach((v,i)=>KB.push({
 id:KB.length+1,domain:d[0],keys:d[1],scenario:d[0]+" "+v,index:i
})));

const COMMANDS={
"Network & Internet":[["IP CONFIG","ipconfig /all"],["GATEWAY","ping <default-gateway>"],["PUBLIC IP","ping 8.8.8.8"],["DNS","nslookup example.com"]],
"DNS":[["DNS LOOKUP","nslookup example.com"],["CONFIG","ipconfig /all"],["CACHE","ipconfig /flushdns"]],
"DHCP / IP":[["CONFIG","ipconfig /all"],["RELEASE","ipconfig /release"],["RENEW","ipconfig /renew"]],
"Windows":[["SYSTEM","systeminfo"],["EVENTS","eventvwr.msc"],["SERVICES","services.msc"]],
"Active Directory":[["IDENTITY","whoami"],["LOGON SERVER","echo %LOGONSERVER%"],["DOMAIN","echo %USERDOMAIN%"]],
"Accounts & Login":[["IDENTITY","whoami"],["GROUPS","whoami /groups"],["ACCOUNT","net user <username> /domain"]],
"Printers":[["REACHABILITY","ping <printer-ip>"],["PRINTERS","control printers"],["SPOOLER","services.msc"]],
"Email / Outlook":[["NETWORK","ipconfig /all"],["OUTLOOK SAFE MODE","outlook.exe /safe"],["WEBMAIL","Open approved webmail"]],
"Hardware":[["DEVICES","devmgmt.msc"],["SYSTEM","msinfo32"],["DISK","wmic diskdrive get status"]],
"Software":[["APPS","appwiz.cpl"],["EVENTS","eventvwr.msc"],["TASKS","taskmgr"]],
"VPN / Remote Access":[["NETWORK","ipconfig /all"],["ROUTES","route print"],["REMOTE","ping <internal-host>"]],
"Microsoft 365":[["WEB TEST","Open Microsoft 365 web portal"],["NETWORK","ipconfig /all"],["ACCOUNT","Check organizational account"]],
"Wi-Fi":[["WIRELESS","netsh wlan show interfaces"],["IP","ipconfig /all"],["GATEWAY","ping <default-gateway>"]],
"Security / Endpoint":[["DEFENDER","Get-MpComputerStatus"],["EVENTS","eventvwr.msc"],["SECURITY","Open approved security console"]],
"Browsers":[["DNS","nslookup example.com"],["PROXY","netsh winhttp show proxy"],["BROWSER","Test URL in another browser"]],
"Servers":[["PING","ping <server>"],["SERVICES","services.msc"],["EVENTS","eventvwr.msc"]],
"File Shares":[["SERVER","ping <server>"],["SHARE","dir \\\\<server>\\<share>"],["IDENTITY","whoami"]],
"Performance":[["TASKS","taskmgr"],["RESOURCE","resmon"],["SYSTEM","msinfo32"]],
"Backup / Recovery":[["BACKUP","Open approved backup console"],["STORAGE","Check repository capacity"],["LOGS","Review backup job logs"]],
"Storage":[["SPACE","wmic logicaldisk get size,freespace,caption"],["DISK MGMT","diskmgmt.msc"],["CHECK","chkdsk /scan"]],
"Audio / Video":[["SOUND","mmsys.cpl"],["DEVICES","devmgmt.msc"],["PRIVACY","ms-settings:privacy"]],
"Time / Certificates":[["TIME","w32tm /query /status"],["SOURCE","w32tm /query /source"],["CERTS","certmgr.msc"]],
"Git / Developer":[["STATUS","git status"],["VERSION","git --version"],["REMOTE","git remote -v"]],
"Virtualization":[["VM","Check VM network/settings"],["HOST","Check host CPU/RAM/disk"],["TOOLS","Check guest tools"]],
"Remote Management":[["PING","ping <remote-host>"],["PORT","Test TCP <port>"],["IDENTITY","whoami"]],
"Cloud / IAM":[["RESOURCE","Check cloud resource status"],["NETWORK","Check network/security rules"],["IAM","Check IAM/role permissions"]]
};

const $=id=>document.getElementById(id);
const chat=$("aiChat"),form=$("aiForm"),input=$("aiMessage"),resetBtn=$("aiReset"),quick=$("aiQuick");
const topics=$("aiTopicList"),search=$("aiKbSearch"),count=$("aiScenarioCount"),progress=$("aiProgress");
let active=null,state="idle",activeDomain="Network & Internet";
let visitorName=sessionStorage.getItem("aiSupportVisitorName")||"";
let awaitingName=false;

/* STEP 3 — UI helpers and safe rendering */
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function add(role,html){
 const e=document.createElement("div");e.className="ai-msg "+role;
 e.innerHTML='<div class="ai-avatar">'+(role==="ai"?"AI":"YOU")+'</div><div class="ai-bubble">'+html+"</div>";
 chat.appendChild(e);chat.scrollTop=chat.scrollHeight;return e;
}
function wait(){return add("ai",'<span class="ai-typing">Analyzing the result <i></i><i></i><i></i></span>');}
function cmds(list){
 return '<div class="ai-command-block"><div class="ai-command-head"><span>STRUCTURED DIAGNOSTIC COMMANDS</span><span>DIAGNOSTIC FIRST</span></div>'+
 list.map(x=>'<div class="ai-command-row"><div><small>'+esc(x[0])+'</small><code>'+esc(x[1])+'</code></div><button class="ai-copy" data-copy="'+esc(x[1])+'" type="button">COPY</button></div>').join("")+"</div>";
}
function choices(a){return '<div class="ai-follow">'+a.map(x=>'<button type="button" data-answer="'+esc(x)+'">'+esc(x)+"</button>").join("")+"</div>";}
function prog(n){if(!progress)return;const a=["REPORT","CHECK","DIAGNOSE","RESOLVE","VERIFY"];progress.innerHTML=a.map((x,i)=>'<span class="'+(i<=n?"done":"")+'">'+String(i+1).padStart(2,"0")+" "+x+"</span>"+(i<4?"<i></i>":"")).join("");}
function find(text){
 const t=text.toLowerCase();let best=null,score=0;
 KB.forEach(k=>{let s=k.keys.reduce((n,p)=>n+(t.includes(p)?2:0),0);if(t.includes(k.scenario.toLowerCase()))s+=4;if(s>score){score=s;best=k;}});
 return score?best:null;
}
function greeting(){
 const known=visitorName?'<p>Welcome back, <b>'+esc(visitorName)+'</b>.</p>':'<p>Before we begin, what name should I use for you?</p>';
 add("ai",'<p><b>Hello'+(visitorName?", "+esc(visitorName):"")+'.</b> I’m the IT Support AI Assistant — Stage 1.</p>'+known+'<p>I can help with everyday IT support issues such as Wi-Fi, Windows, accounts, printers, Outlook, Microsoft 365, Active Directory, hardware, VPNs and more.</p><p><b>Tell me what is not working, or choose a supported topic.</b></p>');
 awaitingName=!visitorName;
}
function handleName(text){
 const cleaned=text.trim().replace(/^(my name is|i am|i'm|im|call me|you can call me)\s+/i,"").replace(/[.!?]+$/,"").trim();
 if(cleaned && cleaned.length<=60 && !/^(hi|hello|hey|yes|no|okay|ok)$/i.test(cleaned)){
  visitorName=cleaned;
  sessionStorage.setItem("aiSupportVisitorName",visitorName);
  awaitingName=false;
  add("ai",'<p>Nice to meet you, <b>'+esc(visitorName)+'</b>.</p><p>I’ll use your name naturally during the troubleshooting conversation.</p><p><b>What IT problem can I help you with?</b></p>');
  input.focus();
  return true;
 }
 add("ai",'<p>No problem. Please tell me your name first — for example, <b>“My name is Muhammad.”</b></p>');
 return true;
}
function unsupported(){
 add("ai",'<p>I’m focused specifically on <b>IT Support</b> topics.</p><p>This request is outside my current Stage 1 knowledge base.</p><p><b>I’m still growing this project, so I can’t provide a reliable solution for this issue at this stage. I’ll add more coverage in future model updates.</b></p>');
}
/* STEP 4 — Guided network diagnostic flow */
function networkStart(){
 activeDomain="Network & Internet";state="gateway";
 add("ai",'<p>I can help with that. Let’s diagnose it layer by layer instead of guessing.</p><p><b>Step 1 — Local network:</b></p><ol><li>Open Command Prompt.</li><li>Run <code class="ai-inline-cmd">ipconfig /all</code>.</li><li>Confirm IPv4, Default Gateway and DNS Server are present.</li><li>Run <code class="ai-inline-cmd">ping &lt;default-gateway&gt;</code>.</li></ol>'+cmds(COMMANDS["Network & Internet"].slice(0,2))+'<p><b>What did the gateway ping show?</b></p>'+choices(["Gateway ping replies","Gateway ping fails","I don’t know"]));prog(1);
}
function network(text){
 const t=text.toLowerCase();
 if(state==="gateway"){
  if(/fail|no reply|unreachable/.test(t)){state="gatewayFail";add("ai",'<p><b>Gateway ping failed — that is useful evidence.</b></p><p>The fault is currently inside the local network path, so we should not jump to DNS yet.</p><ol><li>Confirm the correct Wi-Fi SSID or Ethernet connection.</li><li>Run <code class="ai-inline-cmd">ipconfig /all</code> and check IPv4, subnet mask and gateway.</li><li>Run <code class="ai-inline-cmd">arp -a</code> and look for the gateway.</li><li>Reconnect Wi-Fi or check the Ethernet link.</li><li>Run the gateway ping again.</li></ol>'+cmds([["IP CONFIG","ipconfig /all"],["ARP TABLE","arp -a"],["GATEWAY","ping <default-gateway>"]])+'<p><b>After reconnecting, does the gateway reply now?</b></p>'+choices(["Yes, gateway replies","No, gateway still fails"]));prog(2);return true;}
  if(/reply|work|success/.test(t)){state="gatewayPass";add("ai",'<p><b>Gateway is reachable.</b> Good — the local network path is working.</p><p>Now test the internet route and then DNS.</p>'+cmds([["PUBLIC IP","ping 8.8.8.8"],["DNS","nslookup example.com"]])+'<p><b>What happened?</b></p>'+choices(["8.8.8.8 replies","8.8.8.8 fails","DNS lookup fails","Both work"]));prog(2);return true;}
 }
 if(state==="gatewayFail"){
  if(/yes|reply|work/.test(t)){state="gatewayPass";add("ai",'<p>Excellent. The gateway is reachable now. Let’s move outward to the internet path.</p>'+cmds([["PUBLIC IP","ping 8.8.8.8"],["DNS","nslookup example.com"]])+'<p><b>What happened?</b></p>'+choices(["8.8.8.8 replies","8.8.8.8 fails","DNS lookup fails","Both work"]));prog(3);return true;}
  add("ai",'<p>The gateway still fails. The likely area is local connectivity, adapter/VLAN/cable/Wi-Fi or the gateway-side path.</p><p>Do not change DNS yet. Compare the IP/subnet/gateway with a known-good device and check the physical/link state.</p>'+cmds([["IP CONFIG","ipconfig /all"],["ARP TABLE","arp -a"],["GATEWAY","ping <default-gateway>"]])+'<p><b>After those checks, does the gateway reply?</b></p>'+choices(["Yes, it replies now","No, it still fails"]));prog(2);return true;
 }
 if(state==="gatewayPass"){
  if(/8\.8\.8\.8/.test(t)&&/fail|no/.test(t)){state="publicFail";add("ai",'<p><b>The gateway works, but internet routing fails.</b></p><p>This points toward the upstream router, firewall, VPN, ISP or route path.</p><ol><li>Run tracert 8.8.8.8.</li><li>Check another device on the same network.</li><li>If several devices fail, escalate with the evidence.</li></ol>'+cmds([["TRACE","tracert 8.8.8.8"],["PUBLIC IP","ping 8.8.8.8"]])+'<p><b>Does another device have internet?</b></p>'+choices(["Yes","No"]));prog(3);return true;}
  if(/dns/.test(t)&&/fail|no/.test(t)){state="dnsFail";add("ai",'<p><b>DNS is the likely cause.</b></p><p>The public IP works but name resolution fails.</p><ol><li>Run <code class="ai-inline-cmd">ipconfig /flushdns</code>.</li><li>Run <code class="ai-inline-cmd">nslookup example.com</code>.</li><li>Check DNS servers with <code class="ai-inline-cmd">ipconfig /all</code>.</li></ol>'+cmds([["CLEAR CACHE","ipconfig /flushdns"],["DNS LOOKUP","nslookup example.com"],["DNS CONFIG","ipconfig /all"]])+'<p><b>Does nslookup work now?</b></p>'+choices(["Yes","No"]));prog(3);return true;}
  if(/both|work|reply/.test(t)){state="verify";add("ai",'<p><b>Network and DNS checks are healthy.</b></p><p>Now verify the exact website that originally failed.</p><p><b>Is the original website working now?</b></p>'+choices(["Yes, resolved","No, still not working"]));prog(4);return true;}
 }
 if(state==="dnsFail"){
  if(/yes|work/.test(t)){state="verify";add("ai",'<p>Good. DNS is responding again. Test the original website now.</p><p><b>Does it open?</b></p>'+choices(["Yes, resolved","No, still not working"]));prog(4);return true;}
  add("ai",'<p>DNS is still failing. Check the configured DNS server and the corporate DNS/VPN path. If several devices have the same issue, escalate as a DNS/service incident.</p>'+cmds(COMMANDS.DNS)+'<p><b>Does the DNS server respond now?</b></p>'+choices(["Yes","No"]));return true;
 }
 if(state==="verify"){
  if(/yes|resolved|work/.test(t)){state="resolved";add("ai",'<p><b>Issue resolved.</b> The original symptom is no longer occurring.</p><p><b>Ticket note:</b> document the symptom, failed check, root cause, corrective action and final verification.</p>');prog(4);return true;}
  add("ai",'<p>The network and DNS layers are healthy. The remaining cause is likely browser, proxy, security or the website itself.</p>'+cmds([["PROXY","netsh winhttp show proxy"],["DNS","nslookup <website-hostname>"]])+'<p><b>Does the website work in another browser?</b></p>'+choices(["Yes","No"]));prog(3);return true;
 }
 return false;
}
/* STEP 5 — Generic domain diagnostic flow */
function genericStart(sc){
 active=sc;activeDomain=sc.domain;state="generic";add("ai",'<p>'+ (visitorName?"Alright, "+esc(visitorName)+". ":"") +'I understand. This looks like a <b>'+esc(sc.domain)+'</b> issue.</p><p>I won’t give you a one-shot answer. I’ll collect evidence and keep following the diagnosis.</p><p><b>First check:</b> confirm the exact error/symptom and run the diagnostic commands below.</p>'+cmds((COMMANDS[sc.domain]||[["DIAGNOSTIC","Run the relevant approved diagnostic"],["LOGS","Review relevant logs"]]).slice(0,2))+'<p><b>What result do you get?</b></p>'+choices(["The check works","The check fails","I need help running it"]));prog(1);
}
function genericContinue(text){
 const fail=/fail|error|no |not |cannot|can't|unavailable|offline|blocked/.test(text.toLowerCase());
 active.step=(active.step||0)+1;const c=COMMANDS[active.domain]||[];
 if(active.step>=3){state="verifyGeneric";add("ai",'<p><b>We have enough evidence to move toward a fix.</b></p><p>Apply the smallest approved correction for the confirmed cause, then repeat the original action.</p>'+cmds(c.slice(0,3))+'<p><b>After the fix, is the original issue resolved?</b></p>'+choices(["Yes, resolved","No, still happening"]));prog(4);return;}
 add("ai",'<p>'+(fail?"That check failed, so we follow the failure path.":"Good — that check passed, so we move to the next layer.")+'</p><p><b>Next diagnostic step:</b> check the relevant configuration, service, permission or log.</p>'+cmds(c.slice(0,3))+'<p><b>What result do you get?</b></p>'+choices(["It works","It fails","Different error"]));prog(Math.min(3,active.step+1));
}
function send(text){
 text=text.trim();if(!text)return;add("user","<p>"+esc(text)+"</p>");input.value="";const w=wait();
 setTimeout(function(){w.remove();const t=text.toLowerCase();
  if(/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|how's it going)[!,. ]*$/i.test(text)){
    add("ai",'<p><b>Hello'+(visitorName?", "+esc(visitorName):"")+'.</b> How can I help you today?</p><p>You can tell me an IT problem in your own words, such as “Wi-Fi is connected but the internet is not working.”</p>');
    return;
  }
  if(awaitingName){handleName(text);return;}
  if(["gateway","gatewayFail","gatewayPass","dnsFail","verify"].includes(state)&&network(t))return;
  if(state==="generic"){genericContinue(t);return;}
  if(state==="verifyGeneric"){if(/yes|resolved|fixed|works/.test(t)){state="resolved";add("ai",'<p><b>Great — the issue is resolved.</b> Verify the original action one final time and document the confirmed root cause and fix.</p>');prog(4)}else{add("ai",'<p>The issue is still present. We will not close it yet. Continue with the next evidence point or escalate with the diagnostic results.</p>');prog(3)}return;}
  const sc=find(text);
  if(!sc){unsupported();return;}
  if(sc.domain==="Network & Internet"&&/wifi|wi-fi/.test(t)&&/internet|website|web/.test(t)){networkStart();return;}
  genericStart(sc);
 },380);
}
/* STEP 6 — Sidebar navigation and topic rendering */
function renderTopics(q){
 topics.innerHTML="";q=(q||"").toLowerCase();
 DOMAINS.filter(d=>!q||d[0].toLowerCase().includes(q)||d[1].some(k=>k.includes(q))).forEach(d=>{
  const b=document.createElement("button");b.type="button";b.className="ai-topic"+(d[0]===activeDomain?" active":"");
  b.innerHTML="<span>"+esc(d[0])+'</span><small>20</small>';
  b.onclick=function(){activeDomain=d[0];state="idle";active=null;document.querySelectorAll(".ai-topic").forEach(x=>x.classList.remove("active"));b.classList.add("active");b.scrollIntoView({block:"nearest",behavior:"smooth"});add("ai",'<p>Selected <b>'+esc(d[0])+'</b>.</p><p>Describe the issue and I’ll guide you through it step-by-step.</p>');input.focus();};
  topics.appendChild(b);
 });
}
/* STEP 7 — Reset, composer and interaction handlers */
function reset(){
 chat.innerHTML="";state="idle";active=null;activeDomain="Network & Internet";prog(0);awaitingName=!visitorName;greeting();
 quick.innerHTML="";
 ["My laptop is connected to Wi-Fi but websites are not opening.","A user cannot sign in to Windows.","The printer shows offline.","DNS is not resolving websites."].forEach(x=>{const b=document.createElement("button");b.type="button";b.textContent=x;b.onclick=function(){input.value=x;form.requestSubmit()};quick.appendChild(b)});
}
form.onsubmit=e=>{e.preventDefault();send(input.value)};
input.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}};
input.oninput=()=>{input.style.height="auto";input.style.height=Math.min(110,input.scrollHeight)+"px"};
resetBtn.onclick=reset;
if(search)search.oninput=()=>renderTopics(search.value);
chat.onclick=e=>{const c=e.target.closest("[data-copy]");if(c){navigator.clipboard?.writeText(c.dataset.copy);c.textContent="COPIED";setTimeout(()=>c.textContent="COPY",900)}const a=e.target.closest("[data-answer]");if(a){input.value=a.dataset.answer;form.requestSubmit()}};
if(count)count.textContent=KB.length+"+";
const scCount=document.getElementById("aiScenarioCount");if(scCount)scCount.textContent=KB.length+"+";
renderTopics();reset();
})();

