/* Academy content is intentionally separated from rendering and progress logic.
   Add future courses by following this schema; do not duplicate the application. */
window.ACADEMY_COURSES = [{
  id:'it-support', slug:'it-support', title:'IT Support', level:'Beginner', version:1,
  summary:'A dependency-aware path from computer foundations to practical support scenarios.',
  skills:['Hardware','Windows','Networking','Identity','Cloud services','Troubleshooting'],
  completionRules:{requiredTopicCompletion:100,finalAssessmentScore:70},
  modules:[
    {id:'foundations',title:'IT foundations',description:'Understand the systems, safety, and method behind dependable support.',topics:[
      {id:'computer-basics',title:'How computers work',time:'18 min',skills:['Hardware'],prerequisites:[],objectives:['Identify the purpose of core computer components','Separate hardware symptoms from software symptoms'],blocks:[
        {type:'paragraph',title:'The support mental model',body:'A computer is a set of layers: physical components, firmware, operating system, applications, and user data. Good support starts by identifying which layer can produce the observed symptom.'},
        {type:'definition',title:'Core components',body:'CPU processes instructions. RAM holds active working data. Storage keeps files. The motherboard connects components. The power supply converts and distributes electrical power.'},
        {type:'scenario',title:'A useful first question',body:'A desktop powers on but shows no display. Before opening it, check monitor power, input source, cable seating, and whether another display works. External evidence is safer and faster.'},
        {type:'warning',title:'Work safely',body:'Power down, disconnect power, follow ESD precautions, respect warranty and workplace policy, and change only one variable at a time.'}
      ],practical:{title:'Map a computer system',steps:['List the CPU, RAM, storage, display, and network adapter on a computer you can inspect','Record where you found each item in the operating system','Write one likely symptom for each component'],required:true},quiz:{passingScore:70,questions:[
        {id:'cb1',type:'multiple-choice',text:'Which component holds active working data?',options:['CPU','RAM','Storage drive','Power supply'],answer:1,explanation:'RAM holds data currently being used by the operating system and applications.'},
        {id:'cb2',type:'true-false',text:'A no-display symptom always means the graphics hardware has failed.',options:['True','False'],answer:1,explanation:'Cables, power, input selection, memory, firmware, or a display can produce the same symptom.'}
      ]}},
      {id:'support-method',title:'Evidence-based troubleshooting',time:'20 min',skills:['Troubleshooting'],prerequisites:[{topicId:'computer-basics',type:'required'}],objectives:['Use a repeatable troubleshooting sequence','Document evidence and verification'],blocks:[
        {type:'ordered-list',title:'A controlled support sequence',items:['Identify and scope the problem','Establish a probable cause from evidence','Test one cause safely','Plan and implement the change','Verify full functionality','Document findings and actions']},
        {type:'tip',title:'Ask better questions',body:'Ask what changed, when it began, who is affected, what exact error appears, what still works, and what has already been tried.'},
        {type:'scenario',title:'Scope before action',body:'If one user cannot reach a website but colleagues can, start at that device and account. If everyone is affected, investigate a shared network or service boundary.'}
      ],practical:{title:'Write an evidence record',steps:['Choose a recent technical problem','Write its symptom and scope','List two safe tests and the evidence each produces','State how you would verify the result'],required:true},quiz:{passingScore:70,questions:[
        {id:'sm1',type:'multiple-choice',text:'What should happen before changing a system?',options:['Restart everything','Identify scope and collect evidence','Replace the suspected part','Close the ticket'],answer:1,explanation:'Scope and evidence prevent guesswork and unnecessary change.'},
        {id:'sm2',type:'true-false',text:'A fix is complete as soon as the original error disappears.',options:['True','False'],answer:1,explanation:'Full functionality must be verified and the result documented.'}
      ]}}
    ]},
    {id:'operating-systems',title:'Operating systems',description:'Support Windows devices, accounts, applications, and built-in diagnostics.',topics:[
      {id:'windows-basics',title:'Windows fundamentals',time:'24 min',skills:['Windows'],prerequisites:[{topicId:'computer-basics',type:'required'}],objectives:['Explain how Windows manages resources','Use built-in tools to inspect system state'],blocks:[
        {type:'paragraph',title:'The operating system layer',body:'Windows connects applications and users to hardware. It manages processes, memory, files, devices, services, accounts, and security boundaries.'},
        {type:'command',title:'Open diagnostic tools',items:['taskmgr — Task Manager','devmgmt.msc — Device Manager','eventvwr.msc — Event Viewer','msinfo32 — System Information']},
        {type:'scenario',title:'Start with observation',body:'For a slow application, inspect CPU, memory, disk, process state, startup impact, and recent reliability events before restarting the whole computer.'}
      ],practical:{title:'Inspect Windows health',steps:['Open Task Manager and record the highest CPU and memory process','Open Device Manager and confirm whether warning icons exist','Open Reliability Monitor and note the most recent critical event'],required:true},quiz:{passingScore:70,questions:[
        {id:'wb1',type:'multiple-choice',text:'Which tool shows running processes and resource usage?',options:['Event Viewer','Task Manager','File Explorer','Registry Editor'],answer:1,explanation:'Task Manager shows processes and live CPU, memory, disk, and network usage.'},
        {id:'wb2',type:'multiple-select',text:'Which are appropriate first observations for a slow PC?',options:['Resource usage','Recent reliability events','Replace the storage immediately','Startup impact'],answer:[0,1,3],explanation:'Collect resource, history, and startup evidence before proposing hardware changes.'}
      ]}},
      {id:'users-permissions',title:'Users and permissions',time:'22 min',skills:['Windows','Identity'],prerequisites:[{topicId:'windows-basics',type:'required'}],objectives:['Distinguish authentication from authorization','Apply least privilege to support decisions'],blocks:[
        {type:'definition',title:'Identity boundaries',body:'Authentication proves who a user is. Authorization determines what that identity is allowed to access. A correct password does not guarantee permission to a resource.'},
        {type:'tip',title:'Least privilege',body:'Use the minimum access needed for the task. Temporary elevation is safer than making every user a permanent local administrator.'}
      ],practical:{title:'Review a permission path',steps:['Choose a folder you own','Inspect its security permissions','Identify the user or group granting your access','Do not change permissions on a managed device'],required:true},quiz:{passingScore:70,questions:[
        {id:'up1',type:'multiple-choice',text:'What determines what an authenticated user may access?',options:['Authorization','Encryption','Availability','Compression'],answer:0,explanation:'Authorization controls access after identity has been authenticated.'},
        {id:'up2',type:'true-false',text:'Permanent administrator access is the safest default for support users.',options:['True','False'],answer:1,explanation:'Least privilege reduces accidental and malicious impact.'}
      ]}}
    ]},
    {id:'networking',title:'Network foundations',description:'Understand addressing and isolate connectivity or name-resolution failures.',topics:[
      {id:'network-basics',title:'IP and network boundaries',time:'28 min',skills:['Networking'],prerequisites:[{topicId:'windows-basics',type:'required'}],objectives:['Interpret basic IPv4 configuration','Test local, gateway, internet, and service boundaries'],blocks:[
        {type:'definition',title:'Four essential values',body:'An IPv4 address identifies an interface. A subnet mask defines its local network. A default gateway routes to other networks. A DNS server translates names.'},
        {type:'command',title:'Inspect and test',items:['ipconfig /all','ping 127.0.0.1','ping <default-gateway>','tracert <destination>']},
        {type:'warning',title:'Read the result',body:'Running commands is not diagnosis. Record what each result proves and what it does not prove.'}
      ],practical:{title:'Build a network evidence table',steps:['Record the device IP address, mask, gateway, and DNS server','Test loopback and the gateway','Explain which boundary each result verifies'],required:true},quiz:{passingScore:70,questions:[
        {id:'nb1',type:'multiple-choice',text:'Which value routes traffic to other networks?',options:['Subnet mask','Default gateway','MAC address','Hostname'],answer:1,explanation:'The default gateway routes packets beyond the local subnet.'},
        {id:'nb2',type:'true-false',text:'A successful ping to the gateway proves DNS is working.',options:['True','False'],answer:1,explanation:'A gateway reply proves local IP connectivity, not name resolution.'}
      ]}},
      {id:'dns-dhcp',title:'DNS and DHCP',time:'26 min',skills:['Networking'],prerequisites:[{topicId:'network-basics',type:'required'}],objectives:['Separate addressing from name resolution','Use evidence to identify DNS or DHCP failure'],blocks:[
        {type:'definition',title:'Different services',body:'DHCP supplies IP configuration. DNS resolves names. A device can have valid addressing while DNS is unavailable, or fail to communicate because it never received valid configuration.'},
        {type:'command',title:'Focused commands',items:['ipconfig /all','ipconfig /release','ipconfig /renew','nslookup example.com','ipconfig /flushdns']},
        {type:'scenario',title:'Connected but no websites',body:'If a public IP responds but a domain name does not, the internet route may be healthy while name resolution is failing. Confirm with nslookup before changing settings.'}
      ],practical:{title:'Diagnose name resolution',steps:['Record current DNS configuration','Run nslookup for a known domain','Compare a public-IP test with a hostname test','State the most likely failed boundary'],required:true},quiz:{passingScore:70,questions:[
        {id:'dd1',type:'multiple-choice',text:'Which service normally supplies a client its IP configuration?',options:['DNS','DHCP','HTTPS','SMB'],answer:1,explanation:'DHCP supplies address, mask, gateway, DNS, and lease details.'},
        {id:'dd2',type:'multiple-select',text:'Which evidence suggests a DNS-specific issue?',options:['Public IP responds','Hostname fails','Gateway fails','nslookup times out'],answer:[0,1,3],explanation:'Working IP reachability with failed hostname resolution and nslookup points to DNS.'}
      ]}}
    ]},
    {id:'workplace-support',title:'Workplace support',description:'Handle identity, cloud-service, and device issues safely and professionally.',topics:[
      {id:'identity-support',title:'Account and sign-in support',time:'24 min',skills:['Identity','Troubleshooting'],prerequisites:[{topicId:'users-permissions',type:'required'},{topicId:'dns-dhcp',type:'recommended'}],objectives:['Scope common sign-in failures','Protect identity during account support'],blocks:[
        {type:'ordered-list',title:'Sign-in triage',items:['Verify the user through approved policy','Confirm username and sign-in location','Check network and time synchronization','Check lockout, password, and MFA state','Escalate when policy or risk requires it']},
        {type:'warning',title:'Never request secrets',body:'Do not ask for a password, recovery code, or MFA code. Identity support should preserve—not bypass—the security boundary.'}
      ],practical:{title:'Write a safe sign-in checklist',steps:['Define an approved identity verification step','List account, device, network, and time checks','Add an escalation condition','Write a verification note'],required:true},quiz:{passingScore:70,questions:[
        {id:'is1',type:'multiple-choice',text:'What is the safest first action before an account change?',options:['Disable MFA','Verify identity using approved policy','Ask for the password','Create a shared account'],answer:1,explanation:'Identity must be verified through approved procedures before account changes.'},
        {id:'is2',type:'true-false',text:'A support technician should ask the user to send their MFA code.',options:['True','False'],answer:1,explanation:'Passwords and MFA codes must remain private.'}
      ]}},
      {id:'m365-support',title:'Microsoft 365 support',time:'25 min',skills:['Cloud services','Identity'],prerequisites:[{topicId:'identity-support',type:'required'},{topicId:'dns-dhcp',type:'required'}],objectives:['Separate service, account, license, and client causes','Use web access to isolate desktop-client problems'],blocks:[
        {type:'ordered-list',title:'Isolation order',items:['Check service health and scope','Verify the account and license','Confirm MFA and sign-in status','Test web access','Compare another network or device if permitted','Repair the desktop client only after isolation']},
        {type:'scenario',title:'Outlook cannot connect',body:'If Outlook on the web works for the same account, identity, license, and the core service are likely healthy. Focus on the desktop profile, client, device, or local network.'}
      ],practical:{title:'Create a Microsoft 365 isolation tree',steps:['Start with service scope','Branch by web access success or failure','Add account, license, MFA, client, and network checks','End each branch with a verification step'],required:true},quiz:{passingScore:70,questions:[
        {id:'ms1',type:'multiple-choice',text:'Web access works but the desktop client fails. Where should investigation focus?',options:['Global service outage','Desktop client, profile, device, or local network','Password disclosure','Deleting the account'],answer:1,explanation:'Successful web access isolates the issue toward the desktop environment.'},
        {id:'ms2',type:'true-false',text:'Service health should be checked before rebuilding a user profile.',options:['True','False'],answer:0,explanation:'Scope shared service issues before making local changes.'}
      ]}},
      {id:'endpoint-support',title:'Printers and peripherals',time:'20 min',skills:['Hardware','Windows','Troubleshooting'],prerequisites:[{topicId:'windows-basics',type:'required'}],objectives:['Scope local and shared peripheral issues','Inspect queues, drivers, ports, and physical state'],blocks:[
        {type:'paragraph',title:'Move from shared to local',body:'Ask who is affected, confirm power and connection, inspect the queue, check the selected device, validate the port or network path, then review driver and service state.'},
        {type:'tip',title:'Clear only with care',body:'A stuck queue may contain other users’ work. Understand impact and follow workplace policy before cancelling shared jobs or restarting a spooler.'}
      ],practical:{title:'Inspect a print path',steps:['Identify whether a printer is local or networked','Inspect the selected port and queue','Record driver name and device status','Write a safe verification step'],required:true},quiz:{passingScore:70,questions:[
        {id:'ep1',type:'multiple-choice',text:'What question best scopes a printer issue?',options:['Who else is affected?','Can we replace every driver?','Should we disable security?','Can we delete all queues?'],answer:0,explanation:'Affected-user scope separates local from shared causes.'},
        {id:'ep2',type:'true-false',text:'A technician should clear a shared queue without considering other users.',options:['True','False'],answer:1,explanation:'Shared changes require impact awareness and policy.'}
      ]}}
    ]},
    {id:'professional-practice',title:'Professional troubleshooting',description:'Combine technical evidence, communication, and verification in real support work.',topics:[
      {id:'ticketing',title:'Tickets and resolution notes',time:'18 min',skills:['Troubleshooting'],prerequisites:[{topicId:'support-method',type:'required'}],objectives:['Write clear evidence and resolution notes','Separate symptoms, causes, actions, and results'],blocks:[
        {type:'definition',title:'A useful ticket record',body:'Record user impact, scope, exact symptom, evidence, probable or confirmed cause, controlled actions, technical verification, and user confirmation.'},
        {type:'example',title:'Specific beats vague',body:'Instead of “fixed internet,” write: “Renewed expired DHCP lease; device received 192.168.10.42, reached gateway, resolved intranet.example, and user confirmed access.”'}
      ],practical:{title:'Rewrite a weak ticket',steps:['Write a vague one-line resolution','Add symptom and scope','Add exact evidence and controlled action','Add technical and user verification'],required:true},quiz:{passingScore:70,questions:[
        {id:'tk1',type:'multiple-choice',text:'Which note provides the strongest operational evidence?',options:['Fixed issue','Restarted it','Renewed lease; gateway and DNS tests passed; user confirmed access','User happy'],answer:2,explanation:'A strong note records action, technical evidence, and user verification.'},
        {id:'tk2',type:'true-false',text:'Symptoms and root causes should be recorded as the same thing.',options:['True','False'],answer:1,explanation:'A symptom is observed behavior; a root cause explains why it happened.'}
      ]}},
      {id:'support-scenarios',title:'Practical support scenarios',time:'35 min',skills:['Hardware','Windows','Networking','Identity','Cloud services','Troubleshooting'],prerequisites:[{topicId:'m365-support',type:'required'},{topicId:'endpoint-support',type:'required'},{topicId:'ticketing',type:'required'}],objectives:['Combine multiple support boundaries','Choose safe next actions from incomplete information'],blocks:[
        {type:'scenario',title:'A mixed-boundary incident',body:'A new employee can sign in to Windows and browse the internet but cannot open Outlook or a shared printer. Treat these as potentially separate service, license, permission, client, and print-path problems. Scope and test each boundary.'},
        {type:'ordered-list',title:'Your response structure',items:['Separate each reported symptom','Identify shared dependencies','Choose the safest high-information test','Record results before changing state','Verify each service independently']}
      ],practical:{title:'Complete a support case record',steps:['Scope the identity, Outlook, and printer symptoms','Select one evidence-producing test for each','State likely escalation points','Write a complete resolution or handoff note'],required:true},quiz:{passingScore:70,questions:[
        {id:'ss1',type:'multiple-choice',text:'A user reports three symptoms. What is the best first approach?',options:['Assume one cause','Separate symptoms and identify shared dependencies','Reimage the device','Reset every password'],answer:1,explanation:'Separating symptoms prevents one assumption from driving unrelated changes.'},
        {id:'ss2',type:'multiple-select',text:'Which belong in a professional handoff?',options:['Observed evidence','Actions already taken','Secrets and MFA codes','Current impact and escalation reason'],answer:[0,1,3],explanation:'A handoff needs evidence, actions, impact, and reason—never secrets.'}
      ]}}
    ]},
    {id:'assessment',title:'Final readiness check',description:'Demonstrate the full support workflow across knowledge and practical judgment.',topics:[
      {id:'final-assessment',title:'IT Support readiness assessment',time:'30 min',skills:['Hardware','Windows','Networking','Identity','Cloud services','Troubleshooting'],prerequisites:[{topicId:'support-scenarios',type:'required'}],objectives:['Demonstrate safe cross-domain support judgment','Identify an appropriate next action and verification'],blocks:[
        {type:'paragraph',title:'Before you begin',body:'This assessment measures course readiness only. Review any weak areas first. Completion alone does not guarantee mastery or professional certification.'},
        {type:'tip',title:'Think like a technician',body:'Choose the action that is safest, produces useful evidence, respects policy, and moves the incident toward a verified outcome.'}
      ],practical:{title:'Final written incident response',steps:['Choose one hardware, Windows, network, or identity scenario','Write scope, evidence plan, probable causes, safe action, rollback, and verification','Complete the checklist honestly'],required:true},quiz:{passingScore:75,questions:[
        {id:'fa1',type:'multiple-choice',text:'Which action best begins an unfamiliar support incident?',options:['Apply the most common fix','Identify scope and collect evidence','Replace hardware','Escalate without notes'],answer:1,explanation:'Scope and evidence produce a safe, transferable starting point.'},
        {id:'fa2',type:'multiple-select',text:'What contributes to a verified resolution?',options:['Technical test','User confirmation','Documented action','Assumption without evidence'],answer:[0,1,2],explanation:'Technical verification, user confirmation, and documentation support a verified result.'},
        {id:'fa3',type:'true-false',text:'Completing every lesson automatically means 100% readiness.',options:['True','False'],answer:1,explanation:'Readiness also reflects quiz mastery and practical work.'}
      ]}}
    ]}
  ]
}];

/* Static persistence bridge: Admin saves the complete library under one key.
   A future authenticated service can replace this adapter without changing course data. */
try {
  const savedLibrary = JSON.parse(localStorage.getItem('academy-os-content-v1'));
  if (savedLibrary?.version === 1 && Array.isArray(savedLibrary.courses) && savedLibrary.courses.length) {
    window.ACADEMY_COURSES = savedLibrary.courses;
  }
} catch (error) {
  console.warn('Academy OS could not load the local course library.', error);
}
