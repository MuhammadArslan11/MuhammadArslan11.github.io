/* =========================================================
   AI IT SUPPORT ASSISTANT
   V5.0 — MINIMAL CHAT UI / CONTEXT-AWARE / LOCAL CHAT + PDF

   STAGE 1 — Evidence-based conversational diagnostic engine
   Static GitHub Pages implementation; no external AI API.
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     STEP 1 — DOM / CONFIGURATION
     ======================================================= */
  const $ = (id) => document.getElementById(id);
  const chat = $("aiChat");
  const form = $("aiForm");
  const input = $("aiMessage");
  const resetBtn = $("aiReset");
  const quick = $("aiQuick");
  const topics = $("aiTopicList");
  const search = $("aiKbSearch");
  const count = $("aiScenarioCount");
  const topicToggle = $("aiTopicToggle");
  const topicSidebar = document.querySelector(".ai-sidebar");
  const topicDrawer = document.querySelector(".topic-drawer");
  const progress = $("aiProgress");

  if (!chat || !form || !input) {
    console.error("AI Support: required chat elements are missing.");
    return;
  }

  const STAGES = ["REPORT", "CHECK", "DIAGNOSE", "RESOLVE", "VERIFY"];

  /* =======================================================
     STEP 2 — KNOWLEDGE BASE
     ======================================================= */
  const TOPICS = [
    ["Network & Internet", ["network", "internet", "ethernet", "connection", "gateway", "online", "offline", "web"]],
    ["Wi-Fi", ["wifi", "wi-fi", "wireless", "ssid", "access point"]],
    ["DNS", ["dns", "resolve", "resolution", "hostname", "nxdomain", "name resolution"]],
    ["DHCP / IP", ["dhcp", "ip address", "169.254", "apipa", "default gateway", "subnet", "lease"]],
    ["Windows", ["windows", "windows 10", "windows 11", "task manager", "event viewer", "windows update"]],
    ["Active Directory", ["active directory", "domain controller", "gpo", "group policy", "domain join", "organizational unit"]],
    ["Accounts & Login", ["login", "log in", "sign in", "account", "credential", "locked account", "username"]],
    ["Password & MFA", ["password", "password expired", "password reset", "mfa", "verification code", "authenticator"]],
    ["Printers", ["printer", "printing", "print queue", "spooler", "paper jam"]],
    ["Email / Outlook", ["outlook", "email", "mail", "exchange", "send email", "receive email", "mailbox"]],
    ["Microsoft 365", ["microsoft 365", "office 365", "word", "excel", "powerpoint"]],
    ["Teams", ["teams", "meeting", "teams call", "teams microphone", "teams camera"]],
    ["OneDrive", ["onedrive", "sync", "cloud files"]],
    ["SharePoint", ["sharepoint", "document library", "sharepoint access"]],
    ["Hardware", ["laptop", "computer", "desktop", "battery", "usb", "docking station"]],
    ["Monitors & Displays", ["monitor", "display", "screen", "hdmi", "displayport", "resolution", "dual monitor"]],
    ["Keyboard & Mouse", ["keyboard", "mouse", "touchpad", "trackpad", "cursor"]],
    ["USB & Peripherals", ["usb", "flash drive", "webcam", "headset", "dock", "peripheral"]],
    ["Software & Applications", ["software", "application", "app", "program", "install", "crash", "license"]],
    ["Browsers", ["chrome", "edge", "firefox", "browser", "cache", "cookies", "certificate"]],
    ["VPN / Remote Access", ["vpn", "remote access", "rdp", "remote desktop", "remote login"]],
    ["File Shares & Drives", ["shared folder", "file share", "network drive", "mapped drive", "shared drive"]],
    ["Servers", ["server", "file server", "server down", "server connection", "service unavailable"]],
    ["Performance", ["slow", "performance", "cpu", "memory", "ram", "lag", "freeze"]],
    ["Storage & Disk", ["disk", "storage", "ssd", "hdd", "disk full", "low disk space"]],
    ["Backup & Recovery", ["backup", "restore", "recovery", "restore point"]],
    ["Security / Endpoint", ["antivirus", "defender", "firewall", "malware", "endpoint", "threat"]],
    ["Permissions & Access", ["permission", "access denied", "unauthorized", "rights"]],
    ["Certificates & Time", ["time sync", "clock", "certificate", "tls", "ssl", "ntp"]],
    ["Audio / Video", ["microphone", "camera", "speaker", "audio", "video", "sound"]],
    ["Mobile & BYOD", ["iphone", "android", "mobile", "phone", "tablet", "byod"]],
    ["Virtualization", ["virtualbox", "vmware", "virtual machine", "vm", "hyper-v"]],
    ["Cloud / IAM", ["aws", "azure", "cloud", "ec2", "s3", "iam", "security group"]],
    ["Git / Developer Tools", ["git", "github", "repository", "npm", "node", "python", "branch"]],
    ["PowerShell / Command Line", ["powershell", "command prompt", "cmd", "terminal", "command line"]],
    ["File & Folder Management", ["file", "folder", "rename", "copy", "move", "delete", "zip"]],
    ["Windows Updates", ["windows update", "update failed", "update stuck", "cumulative update"]],
    ["Drivers & Device Manager", ["driver", "device manager", "unknown device", "driver update"]],
    ["System Services", ["service", "services.msc", "service stopped", "service failed"]],
    ["Event Logs", ["event viewer", "event log", "application log", "system log", "error log"]],
    ["Help Desk & Tickets", ["ticket", "incident", "service desk", "sla", "escalation"]],
    ["Remote Support", ["remote support", "screen sharing", "remote assistance", "anydesk", "teamviewer"]],
    ["User Onboarding", ["new user", "onboarding", "new employee", "account setup", "computer setup"]],
    ["Offboarding", ["offboarding", "leaver", "disable account", "remove access"]],
    ["Asset Management", ["asset", "inventory", "serial number", "equipment", "it asset"]],
    ["Network Devices", ["switch", "router", "firewall", "access point", "network device", "port"]],
    ["Internet & Proxy", ["proxy", "web filter", "internet filter", "blocked website"]],
    ["Data & Privacy", ["data privacy", "sensitive data", "personal data", "data protection"]]
  ];

  const COMMANDS = {
    "Network & Internet": [["IP CONFIG", "ipconfig /all"], ["GATEWAY", "ping <default-gateway>"], ["ROUTE", "tracert 8.8.8.8"]],
    "Wi-Fi": [["WIRELESS", "netsh wlan show interfaces"], ["IP CONFIG", "ipconfig /all"], ["GATEWAY", "ping <default-gateway>"]],
    "DNS": [["LOOKUP", "nslookup example.com"], ["CONFIG", "ipconfig /all"], ["CACHE", "ipconfig /flushdns"]],
    "DHCP / IP": [["CONFIG", "ipconfig /all"], ["RENEW", "ipconfig /renew"], ["ROUTE", "route print"]],
    "Windows": [["SYSTEM", "systeminfo"], ["TASKS", "taskmgr"], ["EVENTS", "eventvwr.msc"]],
    "Active Directory": [["IDENTITY", "whoami"], ["DOMAIN", "echo %USERDOMAIN%"], ["GROUPS", "whoami /groups"]],
    "Accounts & Login": [["IDENTITY", "whoami"], ["GROUPS", "whoami /groups"]],
    "Password & MFA": [["IDENTITY", "whoami"], ["ACCOUNT", "net user <username> /domain"]],
    "Printers": [["PRINTERS", "control printers"], ["SPOOLER", "services.msc"], ["REACHABILITY", "ping <printer-ip>"]],
    "Email / Outlook": [["SAFE MODE", "outlook.exe /safe"], ["NETWORK", "ipconfig /all"], ["WEBMAIL", "Open approved organizational webmail"]],
    "Microsoft 365": [["WEB TEST", "Open the approved Microsoft 365 portal"], ["NETWORK", "ipconfig /all"]],
    "Teams": [["NETWORK", "ipconfig /all"], ["MIC", "Open Windows sound settings"], ["CAMERA", "Open Windows camera settings"]],
    "Hardware": [["DEVICES", "devmgmt.msc"], ["SYSTEM", "msinfo32"]],
    "Monitors & Displays": [["DISPLAY", "Open Display Settings"], ["DEVICES", "devmgmt.msc"]],
    "Keyboard & Mouse": [["DEVICES", "devmgmt.msc"], ["USB", "Check Device Manager for HID/USB errors"]],
    "Performance": [["TASKS", "taskmgr"], ["RESOURCE", "resmon"], ["SYSTEM", "msinfo32"]],
    "Storage & Disk": [["SPACE", "wmic logicaldisk get size,freespace,caption"], ["DISK", "diskmgmt.msc"], ["CHECK", "chkdsk /scan"]],
    "VPN / Remote Access": [["IP CONFIG", "ipconfig /all"], ["ROUTES", "route print"], ["TEST", "ping <internal-host>"]],
    "File Shares & Drives": [["IDENTITY", "whoami"], ["SERVER", "ping <server>"], ["SHARE", "dir \\<server>\\<share>"]],
    "Browsers": [["DNS", "nslookup example.com"], ["PROXY", "netsh winhttp show proxy"], ["BROWSER", "Test the same URL in another browser"]],
    "Windows Updates": [["UPDATE", "Open Windows Update settings"], ["EVENTS", "eventvwr.msc"]],
    "Drivers & Device Manager": [["DEVICES", "devmgmt.msc"], ["SYSTEM", "msinfo32"]],
    "System Services": [["SERVICES", "services.msc"], ["EVENTS", "eventvwr.msc"]]
  };

  const SCENARIOS = [
    { id: "wifi-no-internet", domain: "Wi-Fi", phrases: ["wifi connected but no internet", "wi-fi connected but no internet", "connected to wifi but no internet", "wifi has no internet", "internet not working on wifi"], start: "wifi" },
    { id: "network-no-internet", domain: "Network & Internet", phrases: ["internet is not working", "no internet", "internet not working", "cannot access internet", "can't access internet"], start: "network" },
    { id: "wifi-disconnects", domain: "Wi-Fi", phrases: ["wifi keeps disconnecting", "wifi keeps dropping", "wireless keeps disconnecting"], start: "wifi-drop" },
    { id: "dhcp-apipa", domain: "DHCP / IP", phrases: ["169.254", "apipa", "dhcp not giving ip", "not getting an ip address"], start: "dhcp" },
    { id: "dns-nxdomain", domain: "DNS", phrases: ["dns_probe_finished_nxdomain", "nxdomain", "website says dns", "dns is not resolving", "dns not working"], start: "dns" },
    { id: "printer-offline", domain: "Printers", phrases: ["printer is offline", "printer shows offline", "printer offline"], start: "printer" },
    { id: "outlook-send", domain: "Email / Outlook", phrases: ["outlook is not sending", "outlook not sending", "cannot send email", "emails are stuck in outbox", "email stuck in outbox"], start: "outlook-send" },
    { id: "windows-login", domain: "Accounts & Login", phrases: ["cannot log into windows", "can't log into windows", "cannot sign in to windows", "windows login not working"], start: "login" },
    { id: "password-expired", domain: "Password & MFA", phrases: ["password expired", "password has expired", "password reset"], start: "password" },
    { id: "slow-computer", domain: "Performance", phrases: ["computer is very slow", "laptop is very slow", "pc is slow", "computer running slow", "laptop running slow"], start: "slow" },
    { id: "domain-join", domain: "Active Directory", phrases: ["join computer to domain", "cannot join domain", "can't join domain", "domain join failed"], start: "domain" },
    { id: "vpn-internal", domain: "VPN / Remote Access", phrases: ["vpn connected but internal", "vpn is connected but i cannot access", "vpn connected but cannot access internal", "vpn connected but internal resources"], start: "vpn" },
    { id: "monitor", domain: "Monitors & Displays", phrases: ["monitor not detected", "second monitor not detected", "external monitor not detected", "monitor is not detected"], start: "monitor" },
    { id: "keyboard", domain: "Keyboard & Mouse", phrases: ["keyboard is not working", "keyboard not working", "keys not working"], start: "keyboard" }
  ];

  /* =======================================================
     STEP 3 — STATE MANAGEMENT
     ======================================================= */
  const state = {
    domain: "",
    problem: "",
    scenario: null,
    phase: "idle",
    step: 0,
    evidence: [],
    asked: [],
    originalMessage: ""
  };

  /* =======================================================
     CLOUDFLARE D1 CHAT SESSION
     Only the session locator is stored in the visitor's browser.
     ======================================================= */
  const API_BASE_URL = "https://portfolio-api.m-arslanrafaqat.workers.dev";
  const SESSION_ID_KEY = "muhammadArsalanAiSupportSessionIdV1";

  let backendSyncTimer = null;
  let isInitializing = true;
  let restoreGeneration = 0;
  let backendPersistenceEnabled = false;
  let activeSessionId = null;

  function getSessionId() {
    try {
      return localStorage.getItem(SESSION_ID_KEY);
    } catch (error) {
      console.warn("AI Support: session ID unavailable.", error);
      return null;
    }
  }

  function createSessionId() {
    try {
      const sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      return sessionId;
    } catch (error) {
      console.warn("AI Support: session ID unavailable.", error);
      return null;
    }
  }

  function chatSnapshot() {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      domain: state.domain || "",
      phase: state.phase || "idle",
      step: state.step || 0,
      problem: state.problem || "",
      originalMessage: state.originalMessage || "",
      evidence: state.evidence.slice(-12),
      scenarioId: state.scenario?.id || null,
      messages: Array.from(chat.querySelectorAll(".ai-msg")).map((el) => ({
        role: el.classList.contains("user") ? "user" : "ai",
        text: (el.querySelector(".ai-bubble")?.innerText || "").trim()
      }))
    };
  }

  function scheduleBackendSync() {
    if (isInitializing || !backendPersistenceEnabled || !activeSessionId) return;

    clearTimeout(backendSyncTimer);
    backendSyncTimer = setTimeout(async () => {
      backendSyncTimer = null;
      if (isInitializing || !backendPersistenceEnabled || !activeSessionId) return;

      const id = activeSessionId;
      if (getSessionId() !== id) return;

      try {
        const snapshot = chatSnapshot();
        const response = await fetch(`${API_BASE_URL}/assistant/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, snapshot })
        });

        if (!response.ok) {
          throw new Error(`Backend sync failed with status ${response.status}.`);
        }
      } catch (error) {
        console.warn("AI Support: backend chat sync unavailable.", error);
      }
    }, 800);
  }

  function persistChat() {
    scheduleBackendSync();
  }

  async function restoreChat() {
    const generation = restoreGeneration;
    const id = getSessionId();

    if (!id) return "no-session-id";

    try {
      const response = await fetch(`${API_BASE_URL}/assistant/session/${encodeURIComponent(id)}`);
      if (generation !== restoreGeneration || !isInitializing || getSessionId() !== id) {
        return "superseded";
      }
      if (response.status === 404) return "not-found";
      if (!response.ok) {
        throw new Error(`Backend restore failed with status ${response.status}.`);
      }

      const data = await response.json();
      const saved = data?.session?.snapshot;
      if (!saved || !Array.isArray(saved.messages)) {
        throw new Error("Backend restore returned an invalid session snapshot.");
      }
      if (generation !== restoreGeneration || !isInitializing || getSessionId() !== id) {
        return "superseded";
      }

      saved.messages.slice(-80).forEach((m) => {
        if (!m || !m.text) return;
        add(m.role === "user" ? "user" : "ai", "<p>" + esc(m.text).replace(/\\n/g, "<br>") + "</p>", false);
      });
      state.domain = saved.domain || "";
      state.phase = saved.phase || "idle";
      state.step = saved.step || 0;
      state.problem = saved.problem || "";
      state.originalMessage = saved.originalMessage || "";
      state.evidence = Array.isArray(saved.evidence) ? saved.evidence.slice(-12) : [];
      state.scenario = SCENARIOS.find((item) => item.id === saved.scenarioId) || null;
      activeSessionId = id;
      backendPersistenceEnabled = true;
      isInitializing = false;
      return "restored";
    } catch (error) {
      if (generation !== restoreGeneration || !isInitializing || getSessionId() !== id) {
        return "superseded";
      }
      console.warn("AI Support: backend chat restore unavailable.", error);
      return "error";
    }
  }

  let pdfEnginePromise;
  function loadPdfEngine(){
    if(window.jspdf&&typeof window.jspdf.jsPDF==='function')return Promise.resolve();
    if(pdfEnginePromise)return pdfEnginePromise;
    pdfEnginePromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/vendor/jspdf.umd.min.js';script.async=true;script.onload=()=>window.jspdf&&typeof window.jspdf.jsPDF==='function'?resolve():reject(new Error('PDF engine unavailable'));script.onerror=()=>reject(new Error('PDF engine unavailable'));document.head.appendChild(script);});
    return pdfEnginePromise;
  }

  async function exportChat() {
    const nodes = Array.from(chat.querySelectorAll(".ai-msg")).filter((el) => !el.querySelector(".ai-typing"));
    if (!nodes.length) {
      alert("Start a conversation before downloading the chat PDF.");
      return;
    }

    const exportBtn = $("aiExport");
    const originalLabel = exportBtn ? exportBtn.textContent : "";
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.textContent = "PREPARING...";
    }

    const transcript = nodes.map((el) => {
      const isUser = el.classList.contains("user");
      const bubble = el.querySelector(".ai-bubble");
      return {
        isUser,
        role: isUser ? "YOU" : "IT SUPPORT AI ASSISTANT",
        text: (bubble ? bubble.innerText : el.innerText || "").replace(/\u00a0/g, " ").trim()
      };
    }).filter((item) => item.text);

    function finishExport() {
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = originalLabel || "DOWNLOAD PDF";
      }
    }

    function printableFallback() {
      const stamp = new Date().toLocaleString();
      const rows = transcript.map((item) =>
        '<section class="msg ' + (item.isUser ? "user" : "ai") + '"><b>' +
        esc(item.role) + '</b><div>' + esc(item.text).replace(/\n/g, "<br>") + '</div></section>'
      ).join("");

      const popup = window.open("", "_blank");
      if (!popup) {
        alert("The PDF engine is unavailable and the print window was blocked. Allow pop-ups and try again.");
        finishExport();
        return;
      }
      popup.document.write('<!doctype html><html><head><meta charset="utf-8"><title>IT Support AI Assistant — Chat Report</title><style>' +
        '@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17202a;margin:0}' +
        '.head{background:#10212b;color:#fff;padding:22px;border-radius:12px}.head h1{margin:5px 0;font-size:24px}' +
        '.meta{font-size:11px;line-height:1.6;opacity:.9}.msg{margin:12px 0;padding:12px 14px;border-radius:9px;page-break-inside:avoid}' +
        '.msg b{font-size:9px;letter-spacing:1px}.msg div{font-size:11px;line-height:1.55;margin-top:6px;white-space:normal}' +
        '.user{background:#edf6fa;border-left:4px solid #2e8ba8}.ai{background:#f5f5f5;border-left:4px solid #6c7880}' +
        '.foot{margin-top:20px;border-top:1px solid #ccd3d6;padding-top:8px;font-size:9px;color:#6b7479}' +
        '</style></head><body><header class="head"><small>TECHNICAL SUPPORT RECORD</small><h1>IT Support AI Assistant</h1>' +
        '<div class="meta">Muhammad Arsalan Portfolio<br>' + esc(location.href) + '<br>Generated: ' + esc(stamp) +
        '<br>Messages: ' + transcript.length + '</div></header>' + rows +
        '<div class="foot">Muhammad Arsalan Portfolio · Browser-generated troubleshooting report</div></body></html>');
      popup.document.close();
      popup.focus();
      window.setTimeout(() => {
        popup.print();
        finishExport();
      }, 300);
    }

    try {
      await loadPdfEngine();
      if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
        printableFallback();
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = pageW - margin * 2;
      const footerY = pageH - 7;
      const bottomLimit = pageH - 18;
      const stamp = new Date().toLocaleString();
      let y = margin;

      doc.setProperties({
        title: "IT Support AI Assistant — Chat Report",
        subject: "Stage 1 IT Support troubleshooting conversation",
        author: "Muhammad Arsalan Portfolio",
        creator: "Muhammad Arsalan Portfolio"
      });

      function header() {
        doc.setFillColor(16, 33, 43);
        doc.roundedRect(margin, y, contentW, 38, 4, 4, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("TECHNICAL SUPPORT RECORD", margin + 7, y + 8);
        doc.setFontSize(20);
        doc.text("IT Support AI Assistant", margin + 7, y + 18);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("Muhammad Arsalan Portfolio", margin + 7, y + 25);
        doc.setFontSize(7.2);
        doc.text("Generated: " + stamp + "   |   Messages: " + transcript.length, margin + 7, y + 33);
        y += 45;

        doc.setFillColor(242, 247, 249);
        const urlLines = doc.splitTextToSize("Website: " + location.href, contentW - 12);
        const metaH = Math.max(13, urlLines.length * 4 + 7);
        doc.roundedRect(margin, y, contentW, metaH, 3, 3, "F");
        doc.setTextColor(55, 70, 78);
        doc.setFontSize(7.5);
        doc.text(urlLines, margin + 6, y + 7);
        y += metaH + 7;
      }

      function nextPage() {
        doc.addPage();
        y = margin;
        header();
      }

      header();

      transcript.forEach((item) => {
        const role = item.role;
        const allLines = doc.splitTextToSize(item.text || "—", contentW - 14);
        let offset = 0;

        while (offset < allLines.length) {
          const available = bottomLimit - y;
          const maxLines = Math.max(1, Math.floor((available - 16) / 4.6));
          if (maxLines < 2) {
            nextPage();
            continue;
          }

          const lines = allLines.slice(offset, offset + maxLines);
          const boxH = Math.max(18, lines.length * 4.6 + 14);

          if (y + boxH > bottomLimit) {
            nextPage();
            continue;
          }

          if (item.isUser) {
            doc.setFillColor(237, 246, 250);
            doc.setDrawColor(46, 139, 168);
          } else {
            doc.setFillColor(247, 247, 247);
            doc.setDrawColor(108, 120, 128);
          }

          doc.roundedRect(margin, y, contentW, boxH, 3, 3, "FD");
          doc.setTextColor(72, 83, 90);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.text(role, margin + 6, y + 7);

          doc.setTextColor(30, 35, 38);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(lines, margin + 6, y + 14, { lineHeightFactor: 1.35 });

          y += boxH + 7;
          offset += lines.length;
        }
      });

      const pages = doc.getNumberOfPages();
      for (let page = 1; page <= pages; page++) {
        doc.setPage(page);
        doc.setDrawColor(210, 216, 219);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setTextColor(105, 116, 122);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Muhammad Arsalan Portfolio  •  IT Support AI Assistant", margin, footerY);
        doc.text("Page " + page + " / " + pages, pageW - margin, footerY, { align: "right" });
      }

      const date = new Date().toISOString().slice(0, 10);
      doc.save("Muhammad-Arsalan-IT-Support-Chat-" + date + ".pdf");
      finishExport();
    } catch (error) {
      console.error("AI Support PDF export failed:", error);
      printableFallback();
    }
  }

  /* =======================================================
     STEP 4 — INTENT DETECTION
     ======================================================= */
  function normalize(text) {
    return String(text || "").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
  }

  function isGreeting(text) {
    return /^(hi|hello|hey|hiya|good morning|good afternoon|good evening|how are you|how's it going|how are things)[!,.? ]*$/i.test(text.trim());
  }

  function intentOf(text) {
    const t = normalize(text);
    if (isGreeting(t)) return "GREETING";
    if (/^(what is|what's|define|explain|difference between|how does)\b/.test(t)) return "IT_QUESTION";
    if (/^(thanks|thank you|ok|okay|great|perfect|got it)\b/.test(t)) return "ACKNOWLEDGEMENT";
    if (/\b(error|failed|failure|exception|code)\b/.test(t) || /[A-Z_]{4,}_[A-Z_]{4,}/.test(text)) return "ERROR_REPORT";
    if (/\b(help|not working|doesn't work|does not work|can't|cannot|unable|problem|issue|broken|offline|slow|stuck|disconnect|missing|blocked)\b/i.test(t)) return "IT_PROBLEM";
    return "UNKNOWN";
  }

  /* =======================================================
     STEP 5 — DOMAIN + SCENARIO DETECTION
     ======================================================= */
  function scorePhrase(text, phrase) {
    const t = normalize(text);
    const p = normalize(phrase);
    if (!p) return 0;
    if (t === p) return 100;
    if (t.includes(p)) return p.length > 8 ? 30 : 12;
    const words = p.split(/\s+/).filter(Boolean);
    const hit = words.filter((w) => t.includes(w)).length;
    return words.length >= 2 && hit === words.length ? 18 : hit >= Math.max(1, Math.ceil(words.length * 0.7)) ? 8 : 0;
  }

  function detectScenario(text) {
    let best = null;
    let bestScore = 0;
    SCENARIOS.forEach((scenario) => {
      const score = Math.max(...scenario.phrases.map((p) => scorePhrase(text, p)));
      if (score > bestScore) { bestScore = score; best = scenario; }
    });
    return bestScore >= 12 ? best : null;
  }

  function detectDomain(text) {
    let best = null;
    let bestScore = 0;
    TOPICS.forEach(([domain, phrases]) => {
      let score = 0;
      phrases.forEach((p) => { score += scorePhrase(text, p); });
      if (score > bestScore) { bestScore = score; best = domain; }
    });
    return bestScore >= 8 ? best : null;
  }

  /* =======================================================
     STEP 6 — UI / RESPONSE HELPERS
     ======================================================= */
  function esc(value) {
    return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  }

  function add(role, html, persist = true) {
    const el = document.createElement("div");
    el.className = "ai-msg " + role;
    el.innerHTML = '<div class="ai-avatar">' + (role === "ai" ? "AI" : "YOU") + '</div><div class="ai-bubble">' + html + "</div>";
    chat.appendChild(el);
    if (role === "user") document.querySelector(".ai-panel")?.classList.add("has-user-message");
    chat.scrollTop = chat.scrollHeight;
    if (persist) persistChat();
    return el;
  }

  function wait() {
    return add("ai", '<span class="ai-typing">Analyzing your information <i></i><i></i><i></i></span>', false);
  }

  function choices(items) {
    return '<div class="ai-follow">' + items.map((x) => '<button type="button" data-answer="' + esc(x) + '">' + esc(x) + "</button>").join("") + "</div>";
  }

  function commands(list) {
    return '<div class="ai-command-block"><div class="ai-command-head"><span>DIAGNOSTIC CHECKS</span><span>EVIDENCE FIRST</span></div>' +
      list.map((item) => '<div class="ai-command-row"><div><small>' + esc(item[0]) + '</small><code>' + esc(item[1]) + '</code></div><button class="ai-copy" data-copy="' + esc(item[1]) + '" type="button">COPY</button></div>').join("") +
      "</div>";
  }

  function prog(index) {
    if (!progress) return;
    const safeIndex = Math.max(0, Math.min(index, STAGES.length - 1));
    progress.innerHTML = '<div class="ai-progress-current"><b>' + String(safeIndex + 1).padStart(2, "0") + '</b><span>' + esc(STAGES[safeIndex]) + '</span></div><small>Step ' + (safeIndex + 1) + " of " + STAGES.length + "</small>";
  }

  function rememberEvidence(text) {
    state.evidence.push(text);
    if (state.evidence.length > 12) state.evidence.shift();
  }

  function setState(phase, step) {
    state.phase = phase;
    state.step = step || 0;
    persistChat();
  }

  function greeting(persist = true) {
    add("ai", '<p><b>IT Support AI Assistant</b></p><p>Describe the problem or paste the exact error. I’ll troubleshoot it step-by-step and stay inside the current Stage 1 knowledge base.</p>', persist);
  }

  function outOfScope() {
    add("ai", '<p><b>This request is outside the current Stage 1 IT Support knowledge base.</b></p><p>I won’t invent a solution or introduce an unrelated support path. Ask about one of the supported IT areas shown in the assistant, or describe the exact IT symptom/error.</p>');
  }

  function clarify(problem, options) {
    add("ai", '<p>I understand that you’re having a <b>' + esc(problem) + '</b> problem.</p><p>Before I recommend a fix, I need one detail so I don’t send you down the wrong troubleshooting path.</p>' + choices(options));
    setState("clarify", 0);
  }

  /* =======================================================
     STEP 7 — SPECIALIZED DECISION TREES
     ======================================================= */
  function startWifi() {
    state.problem = "Wi-Fi connected but internet access is not working";
    add("ai", '<p>Got it. <b>Wi-Fi is connected, but internet access is failing.</b></p><p>We’ll separate the problem into local network, internet routing and DNS. We will not assume the cause.</p><p><b>Step 1 — Check the local gateway.</b></p><p>On Windows, run <code class="ai-inline-cmd">ipconfig /all</code> and then ping the listed Default Gateway.</p>' + commands(COMMANDS["Wi-Fi"].slice(0, 3)) + '<p><b>What happened?</b></p>' + choices(["Gateway replies", "Gateway fails", "I cannot run the command"]));
    setState("wifi-gateway", 1); prog(1);
  }

  function handleWifi(text) {
    const t = normalize(text);
    if (state.phase === "wifi-gateway") {
      rememberEvidence(text);
      if (/gateway (replies|works)|reply|successful|success|yes/.test(t) && !/fail|no reply|unreachable/.test(t)) {
        add("ai", '<p><b>Good — the gateway is reachable.</b> That means the local device-to-gateway path is working.</p><p>Next, test whether the device can reach the public internet without using DNS.</p>' + commands([["PUBLIC CONNECTIVITY", "ping 8.8.8.8"], ["DNS", "nslookup example.com"]]) + '<p>Tell me whether <b>8.8.8.8 replies</b>, <b>fails</b>, or <b>nslookup fails</b>.</p>');
        setState("wifi-public", 2); prog(2); return true;
      }
      if (/cannot|can't|don't know|unknown/.test(t)) {
        add("ai", '<p>No problem. If you cannot run commands, we can use a simpler check.</p><p>Open your network settings and confirm the device has a normal IPv4 address and Default Gateway. If you see <b>169.254.x.x</b>, tell me — that points toward DHCP.</p>');
        return true;
      }
      add("ai", '<p>The gateway check did not succeed. <b>Do not change DNS yet.</b> The failure is closer to the local network path.</p><p>Check the Wi-Fi connection/SSID, IPv4 address, subnet and gateway. If the address is <b>169.254.x.x</b>, tell me.</p>' + commands([["IP CONFIG", "ipconfig /all"], ["WIRELESS", "netsh wlan show interfaces"]]) + '<p><b>What IPv4 address do you have?</b></p>');
      setState("wifi-local", 2); prog(2); return true;
    }
    if (state.phase === "wifi-local") {
      rememberEvidence(text);
      if (/169\.254|apipa/.test(t)) return startDhcpFromWifi();
      if (/192\.168\.|10\.\d+\.|172\.(1[6-9]|2\d|3[0-1])\./.test(t)) {
        add("ai", '<p>That looks like a private IPv4 address, so DHCP may have provided an address. Because the gateway test failed, let’s verify the gateway and local link rather than assuming DNS is responsible.</p>' + commands([["IP CONFIG", "ipconfig /all"], ["GATEWAY", "ping <default-gateway>"]]) + '<p><b>Does the gateway reply now?</b></p>' + choices(["Yes", "No"]));
        return true;
      }
      add("ai", '<p>I need the actual IPv4 result to diagnose this accurately. Please send the IPv4 address shown by <code>ipconfig /all</code> (you can hide public/private details you do not want to share).</p>');
      return true;
    }
    if (state.phase === "wifi-public") {
      rememberEvidence(text);
      if (/8\.8\.8\.8.*(fail|no)|fail.*8\.8\.8\.8|public.*fail/.test(t)) {
        add("ai", '<p><b>The gateway works but public IP connectivity fails.</b> That makes DNS less likely to be the primary fault. The next areas are upstream routing, firewall/VPN/ISP or the wider network.</p>' + commands([["TRACE ROUTE", "tracert 8.8.8.8"], ["SECOND DEVICE", "Test internet on another device"]]) + '<p><b>Does another device on the same network have internet?</b></p>' + choices(["Yes", "No"]));
        setState("wifi-upstream", 3); prog(3); return true;
      }
      if (/nslookup.*fail|dns.*fail|dns.*not/.test(t)) {
        add("ai", '<p><b>Public IP connectivity works, but DNS resolution is failing.</b> That is useful evidence: the internet path works and name resolution is the next layer to troubleshoot.</p>' + commands([["DNS LOOKUP", "nslookup example.com"], ["DNS CONFIG", "ipconfig /all"], ["CLEAR CACHE", "ipconfig /flushdns"]]) + '<p>Run <code>nslookup example.com</code> and paste the result.</p>');
        setState("wifi-dns", 3); prog(3); return true;
      }
      if (/both|8\.8\.8\.8.*(reply|work)|works.*dns|dns.*works/.test(t)) {
        add("ai", '<p><b>The gateway, public connectivity and DNS appear healthy.</b></p><p>Now verify the exact website or application that originally failed. If only one site fails, the issue may be browser, proxy, security policy or the site itself.</p>' + choices(["Original site works now", "Original site still fails"]));
        setState("verify", 4); prog(4); return true;
      }
      add("ai", '<p>Please tell me the exact result of the two checks. For example: <b>“8.8.8.8 replies, but nslookup fails.”</b> I need that evidence before choosing the next path.</p>');
      return true;
    }
    if (state.phase === "wifi-dns") {
      rememberEvidence(text);
      if (/name|address|server|answer|works|resolved/.test(t) && !/fail|error|can't|cannot|nxdomain/.test(t)) {
        add("ai", '<p>Good. DNS is responding now. Test the original website again.</p>' + choices(["It works now", "It still does not work"]));
        setState("verify", 4); prog(4); return true;
      }
      add("ai", '<p>DNS is still not giving us a successful result. Please paste the <code>nslookup example.com</code> output (remove any sensitive internal information). I’ll interpret the exact response instead of guessing.</p>');
      return true;
    }
    if (state.phase === "wifi-upstream") {
      if (/yes|another.*(works|internet)/.test(t)) add("ai", '<p>If another device works, the fault is more likely isolated to this device or its configuration. We should compare its IP/DNS/proxy settings with the working device.</p>' + commands([["IP CONFIG", "ipconfig /all"], ["PROXY", "netsh winhttp show proxy"]]) + '<p>Tell me whether the affected device is using a VPN or proxy.</p>');
      else add("ai", '<p>If multiple devices cannot reach the internet, this is unlikely to be a single-PC DNS problem. Treat it as a wider network/upstream incident and escalate with the gateway/public-IP/traceroute evidence.</p>');
      return true;
    }
    if (state.phase === "verify") {
      if (/yes|works|resolved|fixed/.test(t)) { resolve(); return true; }
      add("ai", '<p>The lower network layers look healthy, so the remaining possibilities are browser/proxy/security policy or the specific website. Test the same URL in another browser and check the proxy configuration.</p>' + commands([["PROXY", "netsh winhttp show proxy"], ["BROWSER", "Test the same URL in another browser"]]) + '<p>Tell me whether the site works in another browser.</p>');
      return true;
    }
    return false;
  }

  function startDhcpFromWifi() {
    state.domain = "DHCP / IP";
    state.problem = "No valid DHCP IPv4 address";
    add("ai", '<p><b>169.254.x.x is an APIPA address.</b> Windows assigned it because it did not obtain a normal DHCP address.</p><p>That points toward DHCP/local connectivity rather than DNS.</p>' + commands(COMMANDS["DHCP / IP"]) + '<p>Run <code>ipconfig /renew</code>. What IPv4 address do you receive afterward?</p>');
    setState("dhcp", 2); prog(2); return true;
  }

  function handleDhcp(text) {
    rememberEvidence(text);
    if (/169\.254|apipa|still/.test(normalize(text))) {
      add("ai", '<p>The device is still receiving an APIPA address, so DHCP is still not completing successfully.</p><p>Check the Ethernet/Wi-Fi link, correct VLAN/SSID, DHCP availability and whether another device on the same network receives a valid address.</p>' + commands([["IP CONFIG", "ipconfig /all"], ["WIRELESS", "netsh wlan show interfaces"]]) + '<p>Does another device on the same network receive a normal IPv4 address?</p>' + choices(["Yes", "No"]));
      setState("dhcp-scope", 3); prog(3); return true;
    }
    if (/192\.168\.|10\.\d+\.|172\.(1[6-9]|2\d|3[0-1])\./.test(text)) {
      add("ai", '<p>Good — DHCP has now provided a private IPv4 address. Next verify the Default Gateway and DNS, then retry the original connection.</p>' + commands([["GATEWAY", "ping <default-gateway>"], ["DNS", "nslookup example.com"]]) + '<p>Does the original internet problem still occur?</p>');
      setState("verify", 4); prog(4); return true;
    }
    add("ai", '<p>Please send the IPv4 address shown after <code>ipconfig /renew</code>. I need the actual result to determine whether DHCP succeeded.</p>');
    return true;
  }

  function genericStart(scenario, domain) {
    state.scenario = scenario;
    state.domain = domain || scenario.domain;
    state.problem = state.originalMessage;
    const profileQuestions = {
      "Printers": ["Does Windows show the printer as Offline?", "Is the print job stuck in the queue?"],
      "Email / Outlook": ["Can you receive emails but not send them?", "Is the message stuck in Outbox?"],
      "Accounts & Login": ["Do you see an error message?", "Does another user have the same login problem?"],
      "Password & MFA": ["Is the password explicitly reported as expired?", "Is the problem the MFA verification code instead?"],
      "Performance": ["Is the computer slow all the time or only with one application?", "Does Task Manager show unusually high CPU or memory?"],
      "Active Directory": ["Is this a domain-join problem or a login/GPO problem?", "Does the computer have network access to the domain?"],
      "VPN / Remote Access": ["Does the VPN say Connected?", "Can you reach internal resources after connecting?"],
      "Monitors & Displays": ["Is the monitor powered on and detected in Display Settings?", "Does another cable or port work?"],
      "Keyboard & Mouse": ["Is the device wired, Bluetooth or USB-dongle based?", "Does another keyboard/mouse work on the same computer?"]
    };
    const qs = profileQuestions[state.domain] || ["What exact error or message do you see?", "Is the problem affecting only this device or other users/devices too?"];
    add("ai", '<p>I understand the problem as: <b>' + esc(state.problem) + '</b>.</p><p>I’m not going to assume the cause. First I need to narrow the symptom so the troubleshooting stays relevant.</p><p><b>Which describes it best?</b></p>' + choices(qs));
    setState("generic-clarify", 1); prog(1);
  }

  function genericContinue(text) {
    rememberEvidence(text);
    const domain = state.domain;
    if (domain === "Printers") {
      add("ai", '<p>Thanks. For printer issues, the next useful distinction is whether the device is reachable or the Windows print pipeline is stuck.</p>' + commands(COMMANDS["Printers"]) + '<p>Is the printer physically/network reachable, but the print job remains stuck?</p>' + choices(["Printer is reachable, queue is stuck", "Printer is offline/unreachable"]));
      setState("printer-next", 2); prog(2); return;
    }
    if (domain === "Email / Outlook") {
      add("ai", '<p>Thanks. Let’s separate an Outlook client problem from an account/service/network problem.</p>' + commands(COMMANDS["Email / Outlook"]) + '<p>Can the same account send mail successfully through approved webmail?</p>' + choices(["Yes, webmail sends successfully", "No, webmail also fails"]));
      setState("outlook-next", 2); prog(2); return;
    }
    if (domain === "Performance") {
      add("ai", '<p>Let’s measure the bottleneck before changing anything.</p>' + commands(COMMANDS["Performance"]) + '<p>Which resource is unusually high: CPU, Memory, Disk, or none?</p>' + choices(["CPU", "Memory", "Disk", "None / not sure"]));
      setState("performance-next", 2); prog(2); return;
    }
    if (domain === "Accounts & Login") {
      add("ai", '<p>Let’s identify whether this is a credential issue, account-state issue or device/domain issue.</p>' + commands(COMMANDS["Accounts & Login"]) + '<p>What exact Windows sign-in message do you see?</p>');
      setState("login-next", 2); prog(2); return;
    }
    if (domain === "Password & MFA") {
      add("ai", '<p>Do not share your password or MFA code with me. Tell me only the exact error/message.</p><p>Is it explicitly saying the password is expired, or is the MFA verification failing?</p>' + choices(["Password expired", "MFA verification fails", "Other message"]));
      setState("password-next", 2); prog(2); return;
    }
    if (domain === "Active Directory") {
      add("ai", '<p>For Active Directory problems, the network/domain relationship matters before changing policies.</p>' + commands(COMMANDS["Active Directory"]) + '<p>Is the computer connected to the corporate network/VPN and able to reach the domain controller?</p>' + choices(["Yes", "No", "Not sure"]));
      setState("ad-next", 2); prog(2); return;
    }
    if (domain === "VPN / Remote Access") {
      add("ai", '<p>Let’s separate VPN authentication from internal routing.</p>' + commands(COMMANDS["VPN / Remote Access"]) + '<p>Does the VPN show <b>Connected</b>, and can you resolve/reach an internal hostname?</p>' + choices(["Connected and internal access works", "Connected but internal access fails", "VPN does not connect"]));
      setState("vpn-next", 2); prog(2); return;
    }
    if (domain === "Monitors & Displays") {
      add("ai", '<p>Let’s check detection before changing drivers.</p>' + commands(COMMANDS["Monitors & Displays"]) + '<p>Does Windows detect the monitor in Display Settings?</p>' + choices(["Yes", "No"]));
      setState("monitor-next", 2); prog(2); return;
    }
    if (domain === "Keyboard & Mouse") {
      add("ai", '<p>Let’s isolate hardware, USB/Bluetooth and driver causes.</p>' + commands(COMMANDS["Keyboard & Mouse"]) + '<p>Does another keyboard/mouse work on the same computer?</p>' + choices(["Yes", "No", "I have not tested"]));
      setState("keyboard-next", 2); prog(2); return;
    }
    const c = COMMANDS[domain] || [["FIRST CHECK", "Use the application's approved diagnostic/logs"], ["ERROR", "Capture the exact error message"]];
    add("ai", '<p>Thanks. The next step depends on the exact evidence, so I won’t guess a root cause.</p>' + commands(c.slice(0, 2)) + '<p>What exact result or error do you get?</p>');
    setState("generic-evidence", 2); prog(2);
  }

  /* =======================================================
     STEP 8 — FOLLOW-UP STATE HANDLERS
     ======================================================= */
  function handleState(text) {
    const t = normalize(text);
    rememberEvidence(text);

    if (state.phase === "clarify") {
      if (/different/i.test(t)) {
        add("ai", '<p>No problem. Describe the exact symptom in one sentence and include any error message if you have one.</p>');
        setState("idle", 0);
        return true;
      }
      const domainMap = {
        "network / internet": "Network & Internet",
        "windows / login": "Accounts & Login",
        "printer": "Printers",
        "email / outlook": "Email / Outlook",
        "hardware": "Hardware",
        "software / application": "Software & Applications"
      };
      const chosen = Object.keys(domainMap).find((key) => t.includes(key));
      if (chosen) {
        state.domain = domainMap[chosen];
        add("ai", '<p>Understood. I’ll focus on <b>' + esc(state.domain) + '</b>.</p><p>Now describe the exact symptom, what you expected to happen, and any error message you see.</p>');
        setState("idle", 0);
        return true;
      }
      add("ai", '<p>Please choose one of the listed areas, or describe the exact IT problem in your own words.</p>');
      return true;
    }
    if (state.phase === "generic-clarify") {
      genericContinue(text);
      return true;
    }
    if (state.phase === "printer-next") {
      const printerHtml = /stuck|queue/.test(t)
        ? '<p>If the printer is reachable but the queue is stuck, inspect the Windows Print Spooler and clear only the affected job through the approved print-management process.</p>' + commands([["PRINTERS", "control printers"], ["SPOOLER", "services.msc"]]) + '<p>After the queue is cleared, does a new test page print?</p>' + choices(["Yes", "No"])
        : '<p>If the printer is offline/unreachable, verify power, network connection, IP/reachability and whether other users can print to it before changing drivers.</p>' + commands([["PRINTER", "control printers"], ["REACHABILITY", "ping <printer-ip>"]]) + '<p>Can another user reach/print to this printer?</p>' + choices(["Yes", "No"]);
      add("ai", printerHtml);
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "outlook-next") {
      add("ai", /yes|success/.test(t) ? '<p>If webmail works, the account/service is more likely healthy and the problem is isolated to Outlook on this device.</p><p>Next check Outlook Safe Mode/add-ins and the local profile. Do not remove the profile until approved and backed up.</p>' + commands([["SAFE MODE", "outlook.exe /safe"]]) + '<p>Does Outlook send successfully in Safe Mode?</p>' + choices(["Yes", "No"]): '<p>If webmail also fails, the issue is not limited to the Outlook desktop client. Check service/account status and the exact send error before changing local Outlook settings.</p><p>What exact error appears when you send?</p>');
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "performance-next") {
      const resource = /cpu/.test(t) ? "CPU" : /memory|ram/.test(t) ? "Memory" : /disk/.test(t) ? "Disk" : "the resource usage";
      add("ai", '<p><b>' + resource + '</b> usage is the next evidence point.</p><p>Identify the top process and whether it is expected business software. Do not terminate critical system/security processes blindly.</p>' + commands([["TASK MANAGER", "taskmgr"], ["RESOURCE MONITOR", "resmon"]]) + '<p>What process is using the most of that resource?</p>');
      setState("performance-evidence", 3); prog(3); return true;
    }
    if (state.phase === "login-next") {
      add("ai", '<p>Use the exact sign-in message to distinguish credentials, account lockout, domain connectivity and local-profile issues.</p><p>Do not send your password.</p><p>What is the exact message/code shown on the Windows sign-in screen?</p>');
      setState("login-evidence", 3); prog(3); return true;
    }
    if (state.phase === "password-next") {
      if (/expired/.test(t)) add("ai", '<p>If Windows explicitly reports an expired password, follow your organization’s approved password-reset process. I can guide the technical checks, but I should not request or handle your password.</p><p>After the reset, can you sign in normally?</p>' + choices(["Yes", "No"]));
      else add("ai", '<p>If MFA is failing, do not share the verification code. Check device time, approved authenticator status and the exact MFA error. If multiple users are affected, treat it as a service/authentication incident.</p><p>What exact MFA error do you see?</p>');
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "ad-next") {
      add("ai", /no|not sure/.test(t) ? '<p>If the device cannot reach the corporate network/domain controller, domain troubleshooting should start with connectivity/DNS/VPN rather than Group Policy changes.</p>' + commands([["IP CONFIG", "ipconfig /all"], ["DNS", "nslookup <domain>"], ["ROUTE", "tracert <domain-controller>"]]) + '<p>Can the device resolve and reach the domain controller?</p>' + choices(["Yes", "No"]) : '<p>If domain connectivity is healthy, capture the exact domain-join or authentication error before changing AD/GPO settings.</p><p>What exact error appears?</p>');
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "vpn-next") {
      add("ai", /connected.*internal|internal.*fail/.test(t) ? '<p>The VPN tunnel is established but internal access fails. That points toward internal DNS, routes, ACL/security policy or the destination service.</p>' + commands([["ROUTES", "route print"], ["DNS", "nslookup <internal-host>"], ["TEST", "ping <internal-host>"]]) + '<p>Does the internal hostname resolve?</p>' + choices(["Yes", "No"]) : '<p>If the VPN itself does not connect, capture the exact VPN error and check authentication, network reachability and client status. Do not change security settings blindly.</p><p>What exact VPN error do you see?</p>');
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "monitor-next") {
      add("ai", /yes/.test(t) ? '<p>If Windows detects the monitor, check the selected display mode, resolution and cable/input before reinstalling drivers.</p>' + choices(["It works after changing display settings", "Still no picture"]) : '<p>If Windows does not detect it, check power/input, cable/port, docking station and Device Manager. Test a known-good cable or monitor if available.</p>' + commands([["DISPLAY", "Open Display Settings"], ["DEVICES", "devmgmt.msc"]]) + '<p>Does a known-good monitor work on the same port?</p>' + choices(["Yes", "No"]));
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "keyboard-next") {
      add("ai", /yes/.test(t) ? '<p>If another keyboard works, the original device/cable/receiver is the likely area. Check connection, batteries and device pairing before changing drivers.</p>' : '<p>If another keyboard also fails, investigate the USB/Bluetooth subsystem or computer-level input device/driver issue.</p>' + commands(COMMANDS["Keyboard & Mouse"]));
      setState("verify", 4); prog(4); return true;
    }
    if (state.phase === "verify") {
      if (/yes|works|resolved|fixed|successful/.test(t) && !/not|no|still/.test(t)) { resolve(); return true; }
      if (/^no\b|still|not resolved|not fixed|doesn.?t work|does not work|fails?|failed/.test(t)) {
        add("ai", '<p><b>The issue is still present.</b> I’ll keep the current diagnostic context instead of starting over.</p><p>Send the exact result or error from the last check so I can choose the next evidence point.</p>');
        return true;
      }
      add("ai", '<p>Tell me whether the original problem now works. If not, include the exact result or error from the last check.</p>');
      return true;
    }
    if (state.phase === "generic-evidence" || state.phase === "login-evidence" || state.phase === "performance-evidence") {
      const hasFailure = /fail|failed|failure|timeout|timed out|no reply|no response|offline|error|denied|cannot|can't|not working/.test(t);
      const hasSuccess = /works|working|success|successful|reply|connected|resolved|fixed/.test(t) && !/not|no|fail/.test(t);
      if (hasFailure) {
        add("ai", '<p><b>That check failed.</b> I’ve kept it as diagnostic evidence for <b>' + esc(state.domain || "this issue") + '</b>.</p><p>Send the exact error, code, or command output from that failed check. I’ll use that result before choosing the next action.</p>');
      } else if (hasSuccess) {
        add("ai", '<p><b>That check succeeded.</b> Now test the original problem again and tell me whether it is resolved.</p>' + choices(["Original problem is resolved", "Original problem still happens"]));
        setState("verify", 4);
        prog(4);
      } else {
        add("ai", '<p>Thanks. Paste the exact value, error, or command result from the last check (remove passwords, tokens, and sensitive company data). I’ll interpret that evidence before recommending the next step.</p>');
      }
      return true;
    }
    return false;
  }

  function resolve() {
    state.phase = "resolved";
    state.step = 4;
    prog(4);
    add("ai", '<p><b>Resolved.</b> Verify the original user action once more. In a real support ticket, document the symptom, evidence, fix, and verification result.</p>');
    persistChat();
  }

  function relevantSupportMatch(text) {
    const scenario = detectScenario(text);
    const domain = detectDomain(text);
    return { scenario, domain, confident: Boolean(scenario || domain) };
  }

  function focusedUnknown(text) {
    add("ai", '<p><b>I need one IT symptom to continue.</b></p><p>Tell me the device or service and what is failing — for example, “Wi-Fi connected but websites do not open” or “printer shows Offline.”</p>');
  }

  /* =======================================================
     STEP 9 — MAIN CONVERSATION ENGINE
     ======================================================= */
  function send(text) {
    text = String(text || "").trim();
    if (!text) return;
    add("user", "<p>" + esc(text) + "</p>");
    input.value = "";
    const typing = wait();

    window.setTimeout(() => {
      typing.remove();
      try {
        const intent = intentOf(text);
        const t = normalize(text);

        if (intent === "GREETING") {
          add("ai", '<p><b>Describe the IT problem.</b> I’ll keep the diagnosis focused on the current knowledge base and the evidence you provide.</p>');
          return;
        }


        if (state.phase === "wifi-gateway" || state.phase === "wifi-local" || state.phase === "wifi-public" || state.phase === "wifi-dns" || state.phase === "wifi-upstream" || state.phase === "verify") {
          if (handleWifi(text)) return;
        }
        if (state.phase !== "idle" && handleState(text)) return;
        if (state.phase === "dhcp" || state.phase === "dhcp-scope") {
          if (handleDhcp(text)) return;
        }

        if (intent === "IT_QUESTION") {
          const domain = detectDomain(text);
          if (!domain) { outOfScope(); return; }
          const explanations = {
            "Active Directory": "Active Directory is Microsoft’s directory service for centrally managing users, computers, groups, authentication and policies in a Windows domain.",
            "DNS": "DNS translates hostnames such as example.com into IP addresses so clients can locate services.",
            "DHCP / IP": "DHCP automatically provides clients with network configuration such as an IP address, subnet mask, gateway and DNS servers.",
            "Wi-Fi": "Wi-Fi is the wireless network connection between a client and an access point. Being connected to Wi-Fi does not by itself prove that internet access works."
          };
          add("ai", '<p><b>' + esc(domain) + ':</b> ' + esc(explanations[domain] || "This is an IT Support topic in the current Stage 1 knowledge base.") + '</p><p>If you want, describe a real problem and I can troubleshoot it step-by-step.</p>');
          return;
        }

        if (intent === "ACKNOWLEDGEMENT") {
          if (state.phase !== "idle" && state.phase !== "resolved") {
            add("ai", '<p>Okay. Send me the result of the last check and I’ll continue from the same troubleshooting step.</p>');
          } else {
            add("ai", '<p>You’re welcome. Describe another IT problem whenever you’re ready.</p>');
          }
          return;
        }

        if (state.phase === "idle") {
          const match = relevantSupportMatch(text);
          if (!match.confident && intent !== "IT_PROBLEM" && intent !== "ERROR_REPORT") {
            focusedUnknown(text);
            return;
          }
        }

        state.originalMessage = text;
        state.domain = detectDomain(text) || "";
        const scenario = detectScenario(text);

        if (scenario && scenario.start === "wifi") { state.domain = "Wi-Fi"; startWifi(); return; }
        if (scenario && scenario.start === "network") { state.domain = "Network & Internet"; state.problem = text; startWifi(); return; }
        if (scenario && scenario.start === "dhcp") { state.domain = "DHCP / IP"; state.problem = text; startDhcpFromWifi(); return; }
        if (scenario && scenario.start === "dns") {
          state.domain = "DNS"; state.problem = text;
          add("ai", '<p><b>I understand this as a DNS/name-resolution problem.</b> I won’t assume the DNS server is the cause until we inspect the exact result.</p>' + commands(COMMANDS.DNS) + '<p>Run <code>nslookup example.com</code>. What exact response do you get?</p>');
          setState("generic-evidence", 2); prog(2); return;
        }
        if (scenario) { genericStart(scenario, scenario.domain); return; }

        if (!state.domain) {
          clarify("IT problem", ["Network / Internet", "Windows / Login", "Printer", "Email / Outlook", "Hardware", "Software / Application"]);
          return;
        }

        clarify(state.domain, ["This is the exact problem", "It is a different problem"]);
      } catch (error) {
        console.error("AI Support runtime error:", error);
        add("ai", '<p><b>I couldn’t process that message correctly.</b> Let’s continue safely. Please describe the exact IT problem and any error message you see.</p>');
      }
    }, 280);
  }

  /* =======================================================
     STEP 10 — SIDEBAR / SEARCH
     ======================================================= */
  function renderTopics(query) {
    if (!topics) return;
    const q = normalize(query);
    topicSidebar?.classList.toggle("searching", Boolean(q));
    topics.innerHTML = "";
    TOPICS.filter(([domain, phrases]) => !q || normalize(domain).includes(q) || phrases.some((p) => normalize(p).includes(q))).forEach(([domain]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ai-topic" + (domain === state.domain ? " active" : "");
      const scenarioCount = SCENARIOS.filter((s) => s.domain === domain).length;
      button.innerHTML = "<span>" + esc(domain) + "</span><small>" + (scenarioCount ? scenarioCount + "+" : "Support") + "</small>";
      button.addEventListener("click", () => {
        if (isInitializing) return;
        state.domain = domain;
        state.phase = "idle";
        state.scenario = null;
        state.evidence = [];
        document.querySelectorAll(".ai-topic").forEach((x) => x.classList.remove("active"));
        button.classList.add("active");
        button.scrollIntoView({ block: "nearest", behavior: "smooth" });
        add("ai", '<p><b>' + esc(domain) + '</b> selected.</p><p>Describe the exact symptom. I’ll ask the minimum questions needed before recommending a fix.</p>');
        if (topicDrawer) topicDrawer.open = false;
        input.focus();
      });
      topics.appendChild(button);
    });
    if (!topics.children.length) topics.innerHTML = '<p class="ai-topic-empty">No matching topic. Describe the problem in the chat instead.</p>';
    if (topicToggle) topicToggle.hidden = Boolean(q) || topics.querySelectorAll(".ai-topic").length <= 6;
  }

  /* =======================================================
     STEP 11 — RESET / SESSION
     ======================================================= */
  function reset() {
    restoreGeneration += 1;
    isInitializing = false;
    backendPersistenceEnabled = false;
    activeSessionId = null;
    clearTimeout(backendSyncTimer);
    backendSyncTimer = null;
    const newSessionId = createSessionId();
    if (newSessionId) {
      activeSessionId = newSessionId;
      backendPersistenceEnabled = true;
    }
    chat.innerHTML = "";
    document.querySelector(".ai-panel")?.classList.remove("has-user-message");
    state.domain = "";
    state.problem = "";
    state.scenario = null;
    state.phase = "idle";
    state.step = 0;
    state.evidence = [];
    state.asked = [];
    state.originalMessage = "";
    prog(0);
    greeting();
  }

  function renderQuick() {
    if (!quick) return;
    quick.innerHTML = "";
    [
      "Wi-Fi connected, but no internet",
      "Printer shows Offline",
      "Outlook will not send email"
    ].forEach((example) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = example;
      button.addEventListener("click", () => {
        if (isInitializing) return;
        input.value = example;
        form.requestSubmit();
      });
      quick.appendChild(button);
    });
  }

  /* =======================================================
     STEP 12 — EVENT HANDLERS / ERROR SAFETY
     ======================================================= */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isInitializing) return;
    send(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(110, input.scrollHeight) + "px"; });
  /* Mobile keyboard support: keep the latest response and composer visible
     without forcing the whole page to jump. */
  function keepChatLatest() {
    requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
  }
  if (window.visualViewport) {
    const syncViewport = () => {
      document.documentElement.style.setProperty("--ai-vh", window.visualViewport.height + "px");
    };
    window.visualViewport.addEventListener("resize", syncViewport);
    window.visualViewport.addEventListener("scroll", syncViewport);
    syncViewport();
  }
  input.addEventListener("focus", () => {
    setTimeout(keepChatLatest, 180);
  });
  window.addEventListener("resize", keepChatLatest);

  if (resetBtn) resetBtn.addEventListener("click", reset);
  const exportBtn = $("aiExport");
  if (exportBtn) exportBtn.addEventListener("click", exportChat);
  if (search) search.addEventListener("input", () => renderTopics(search.value));
  if (topicToggle) topicToggle.addEventListener("click", () => {
    const expanded = topicSidebar?.classList.toggle("show-all") || false;
    topicToggle.setAttribute("aria-expanded", String(expanded));
    topicToggle.textContent = expanded ? "Show fewer topics" : "Show all topics";
  });
  document.addEventListener("click", (event) => {
    if (topicDrawer?.open && !topicDrawer.contains(event.target)) topicDrawer.open = false;
  });
  topicDrawer?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      topicDrawer.open = false;
      topicDrawer.querySelector("summary")?.focus();
    }
  });

  chat.addEventListener("click", (event) => {
    const copy = event.target.closest("[data-copy]");
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
        copy.textContent = "COPIED";
        window.setTimeout(() => { copy.textContent = "COPY"; }, 900);
      }).catch(() => { copy.textContent = "COPY"; });
      return;
    }
    const answer = event.target.closest("[data-answer]");
    if (answer && !isInitializing) { input.value = answer.dataset.answer; form.requestSubmit(); }
  });

  /* =======================================================
     STEP 13 — INITIALIZATION / QA METRICS
     ======================================================= */
  if (count) count.textContent = SCENARIOS.length + " core guided flows";
  renderTopics();
  renderQuick();

  async function initializeChat() {
    const restoreResult = await restoreChat();
    if (restoreResult === "restored" || restoreResult === "superseded") return;

    if (restoreResult === "no-session-id" || restoreResult === "not-found") {
      const sessionId = createSessionId();
      activeSessionId = sessionId;
      backendPersistenceEnabled = Boolean(sessionId);
      isInitializing = false;
      greeting(false);
      return;
    }

    activeSessionId = null;
    backendPersistenceEnabled = false;
    isInitializing = false;
    greeting(false);
  }

  initializeChat();
})();

function escapeHtml(value) {
  return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
