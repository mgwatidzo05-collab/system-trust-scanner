import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'clean-laptop',
    name: 'Clean Student Laptop',
    tagline: 'Standard baseline university student machine with trusted apps',
    badge: 'Safe Baseline',
    description: 'A typical laptop used for academic research, typing assignments in Word, and browsing on Chrome. Antivirus is active, no unauthorized remote tools.',
    processes: [
      {
        id: 'p-chrome',
        pid: 3204,
        name: 'chrome.exe',
        path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        isSigned: true,
        signer: 'Google LLC',
        inTempOrDownloads: false,
        cpu: 2.1,
        memoryMb: 412,
        description: 'Google Chrome Web Browser'
      },
      {
        id: 'p-word',
        pid: 5120,
        name: 'WINWORD.EXE',
        path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
        isSigned: true,
        signer: 'Microsoft Corporation',
        inTempOrDownloads: false,
        cpu: 0.4,
        memoryMb: 198,
        description: 'Microsoft Word'
      },
      {
        id: 'p-defender',
        pid: 1844,
        name: 'MsMpEng.exe',
        path: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe',
        isSigned: true,
        signer: 'Microsoft Windows Publisher',
        inTempOrDownloads: false,
        cpu: 0.8,
        memoryMb: 180,
        description: 'Microsoft Defender Antivirus Core'
      },
      {
        id: 'p-explorer',
        pid: 1420,
        name: 'explorer.exe',
        path: 'C:\\Windows\\explorer.exe',
        isSigned: true,
        signer: 'Microsoft Windows',
        inTempOrDownloads: false,
        cpu: 1.0,
        memoryMb: 120,
        description: 'Windows Explorer Shell'
      }
    ],
    connections: [
      {
        id: 'c-chrome-1',
        pid: 3204,
        processName: 'chrome.exe',
        localAddress: '192.168.1.105',
        localPort: 54120,
        remoteAddress: '142.250.190.46',
        remotePort: 443,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'South Africa (Google Edge)',
        remoteOrg: 'Google LLC',
        isSuspicious: false
      },
      {
        id: 'c-defender-1',
        pid: 1844,
        processName: 'MsMpEng.exe',
        localAddress: '192.168.1.105',
        localPort: 54890,
        remoteAddress: '20.190.159.23',
        remotePort: 443,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'United States',
        remoteOrg: 'Microsoft Corporation',
        isSuspicious: false
      }
    ],
    persistenceEntries: [
      {
        id: 'pers-onedrive',
        name: 'OneDrive',
        command: '\"C:\\Users\\Student\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe\" /background',
        locationType: 'HKCU_RUN',
        locationDisplay: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        isUnrecognized: false,
        linkedProcessName: 'OneDrive.exe',
        riskWeight: 0
      },
      {
        id: 'pers-securityhealth',
        name: 'SecurityHealth',
        command: '%windir%\\system32\\SecurityHealthSystray.exe',
        locationType: 'HKLM_RUN',
        locationDisplay: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        isUnrecognized: false,
        riskWeight: 0
      }
    ],
    ratTools: [
      {
        id: 'rat-anydesk',
        toolName: 'AnyDesk Remote Desktop',
        processName: 'AnyDesk.exe',
        isRunning: false,
        category: 'Commercial Support',
        description: 'Legitimate remote desktop utility frequently abused by scammers',
        riskPoints: 20
      },
      {
        id: 'rat-teamviewer',
        toolName: 'TeamViewer',
        processName: 'TeamViewer.exe',
        isRunning: false,
        category: 'Commercial Support',
        description: 'Remote access software',
        riskPoints: 20
      },
      {
        id: 'rat-rustdesk',
        toolName: 'RustDesk',
        processName: 'rustdesk.exe',
        isRunning: false,
        category: 'Open Source RAT',
        description: 'Open-source remote desktop alternative',
        riskPoints: 25
      },
      {
        id: 'rat-ngrok',
        toolName: 'ngrok Tunneling',
        processName: 'ngrok.exe',
        isRunning: false,
        category: 'Tunneling Utility',
        description: 'Reverse proxy tunnel used to bypass firewalls and expose local ports',
        riskPoints: 30
      }
    ]
  },
  {
    id: 'active-rat-attack',
    name: 'Active Silent RAT (Mobile Money Attack)',
    tagline: 'High-risk covert compromise with active reverse shell and startup persistence',
    badge: 'Critical Threat',
    description: 'A covert attack scenario: an unsuspecting user downloaded an assignment or crack that launched a masqueraded process in Temp, opened an active C2 reverse shell, and established persistence. Silent AnyDesk is also running in the background.',
    processes: [
      {
        id: 'p-rat-covert',
        pid: 4892,
        name: 'svchost_updater.exe',
        path: 'C:\\Users\\Victim\\AppData\\Local\\Temp\\svchost_updater.exe',
        parentName: 'explorer.exe',
        isSigned: false,
        inTempOrDownloads: true,
        cpu: 3.4,
        memoryMb: 84,
        description: 'Masqueraded system process hiding in temporary directory'
      },
      {
        id: 'p-anydesk-hidden',
        pid: 6108,
        name: 'AnyDesk.exe',
        path: 'C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe',
        parentName: 'services.exe',
        isSigned: true,
        signer: 'AnyDesk Software GmbH',
        inTempOrDownloads: false,
        cpu: 1.2,
        memoryMb: 110,
        description: 'Background AnyDesk service session running without visible UI tray'
      },
      {
        id: 'p-chrome',
        pid: 3204,
        name: 'chrome.exe',
        path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        isSigned: true,
        signer: 'Google LLC',
        inTempOrDownloads: false,
        cpu: 2.5,
        memoryMb: 390,
        description: 'Google Chrome (User active on EcoCash Web Portal & Gmail)'
      },
      {
        id: 'p-explorer',
        pid: 1420,
        name: 'explorer.exe',
        path: 'C:\\Windows\\explorer.exe',
        isSigned: true,
        signer: 'Microsoft Windows',
        inTempOrDownloads: false,
        cpu: 0.9,
        memoryMb: 115,
        description: 'Windows Explorer Shell'
      }
    ],
    connections: [
      {
        id: 'c-rat-c2',
        pid: 4892,
        processName: 'svchost_updater.exe',
        localAddress: '192.168.1.105',
        localPort: 49832,
        remoteAddress: '185.220.101.42',
        remotePort: 4444,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'Seychelles / Unknown Bulletproof VPS',
        remoteOrg: 'Offshore Hosting Ltd',
        isSuspicious: true,
        suspiciousReason: 'Unfamiliar outbound destination on common Metasploit/RAT port (4444)'
      },
      {
        id: 'c-anydesk-relay',
        pid: 6108,
        processName: 'AnyDesk.exe',
        localAddress: '192.168.1.105',
        localPort: 52194,
        remoteAddress: '194.26.29.112',
        remotePort: 7070,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'Germany (AnyDesk Relay)',
        remoteOrg: 'AnyDesk Network',
        isSuspicious: true,
        suspiciousReason: 'Active unauthorized remote screen mirroring session'
      },
      {
        id: 'c-chrome-ecocash',
        pid: 3204,
        processName: 'chrome.exe',
        localAddress: '192.168.1.105',
        localPort: 54100,
        remoteAddress: '197.221.240.10',
        remotePort: 443,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'Harare, Zimbabwe',
        remoteOrg: 'Liquid Telecom Zimbabwe',
        isSuspicious: false
      }
    ],
    persistenceEntries: [
      {
        id: 'pers-svchost-trojan',
        name: 'WindowsHostService',
        command: '\"C:\\Users\\Victim\\AppData\\Local\\Temp\\svchost_updater.exe\" -silent -autorun',
        locationType: 'HKCU_RUN',
        locationDisplay: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        isUnrecognized: true,
        linkedProcessName: 'svchost_updater.exe',
        riskWeight: 25
      },
      {
        id: 'pers-anydesk-boot',
        name: 'AnyDesk',
        command: '\"C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe\" --service',
        locationType: 'HKLM_RUN',
        locationDisplay: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        isUnrecognized: true,
        linkedProcessName: 'AnyDesk.exe',
        riskWeight: 15
      }
    ],
    ratTools: [
      {
        id: 'rat-anydesk',
        toolName: 'AnyDesk Remote Desktop',
        processName: 'AnyDesk.exe',
        pid: 6108,
        isRunning: true,
        category: 'Commercial Support',
        description: 'Active background session detected. May be broadcasting screen to unauthorized remote party.',
        riskPoints: 25,
        authorizedByUser: false
      },
      {
        id: 'rat-teamviewer',
        toolName: 'TeamViewer',
        processName: 'TeamViewer.exe',
        isRunning: false,
        category: 'Commercial Support',
        description: 'Remote access software',
        riskPoints: 20
      },
      {
        id: 'rat-ultraviewer',
        toolName: 'UltraViewer',
        processName: 'UltraViewer_Desktop.exe',
        isRunning: false,
        category: 'Commercial Support',
        description: 'Remote support tool frequently used in tech support phone scams',
        riskPoints: 20
      },
      {
        id: 'rat-ngrok',
        toolName: 'ngrok Tunneling',
        processName: 'ngrok.exe',
        isRunning: false,
        category: 'Tunneling Utility',
        description: 'Tunneling utility',
        riskPoints: 30
      }
    ]
  },
  {
    id: 'shadow-it',
    name: 'Suspicious Remote Support (Shadow IT)',
    tagline: 'Uncontrolled UltraViewer session & unverified helper tool running from Downloads',
    badge: 'Medium Concern',
    description: 'Common in small offices: someone installed a remote support tool for printer troubleshooting, but left it running permanently with full privileges from the Downloads folder.',
    processes: [
      {
        id: 'p-ultraviewer',
        pid: 2940,
        name: 'UltraViewer_Service.exe',
        path: 'C:\\Users\\Accountant\\Downloads\\UltraViewer_Portable\\UltraViewer_Service.exe',
        isSigned: false,
        inTempOrDownloads: true,
        cpu: 1.1,
        memoryMb: 68,
        description: 'UltraViewer portable client running directly from Downloads folder'
      },
      {
        id: 'p-excel',
        pid: 4120,
        name: 'EXCEL.EXE',
        path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
        isSigned: true,
        signer: 'Microsoft Corporation',
        inTempOrDownloads: false,
        cpu: 0.5,
        memoryMb: 240,
        description: 'Microsoft Excel (Payroll & Invoices)'
      }
    ],
    connections: [
      {
        id: 'c-ultraviewer-conn',
        pid: 2940,
        processName: 'UltraViewer_Service.exe',
        localAddress: '192.168.1.14',
        localPort: 51220,
        remoteAddress: '103.27.236.88',
        remotePort: 21116,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'Vietnam (UltraViewer Cloud Hub)',
        remoteOrg: 'DucFabulous Software Ltd',
        isSuspicious: true,
        suspiciousReason: 'Active listening and outbound relay for external remote control'
      }
    ],
    persistenceEntries: [
      {
        id: 'pers-ultraviewer-shortcut',
        name: 'UltraViewerStartup',
        command: '\"C:\\Users\\Accountant\\Downloads\\UltraViewer_Portable\\UltraViewer_Service.exe\" /autostart',
        locationType: 'STARTUP_FOLDER',
        locationDisplay: 'shell:startup (User Startup Folder)',
        isUnrecognized: true,
        linkedProcessName: 'UltraViewer_Service.exe',
        riskWeight: 15
      }
    ],
    ratTools: [
      {
        id: 'rat-ultraviewer',
        toolName: 'UltraViewer',
        processName: 'UltraViewer_Service.exe',
        pid: 2940,
        isRunning: true,
        category: 'Commercial Support',
        description: 'Active remote desktop tool running from user downloads folder',
        riskPoints: 20,
        authorizedByUser: false
      }
    ]
  },
  {
    id: 'lotl-powershell',
    name: 'Living-off-the-Land (LotL) PowerShell Beacon',
    tagline: 'Legitimate Windows utility abused to maintain an invisible command-and-control beacon',
    badge: 'High Threat',
    description: 'Demonstrates fileless / LotL compromise: no custom malware binary is dropped; instead, Windows powershell.exe runs an encoded payload from Temp communicating outbound to an unknown remote server.',
    processes: [
      {
        id: 'p-powershell-hidden',
        pid: 7724,
        name: 'powershell.exe',
        path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        isSigned: true,
        signer: 'Microsoft Corporation',
        inTempOrDownloads: false,
        cpu: 4.8,
        memoryMb: 145,
        description: 'PowerShell spawned with hidden window and base64 encoded IEX payload'
      },
      {
        id: 'p-helper-script',
        pid: 8812,
        name: 'win_telemetry_stub.exe',
        path: 'C:\\Users\\Student\\AppData\\Local\\Temp\\win_telemetry_stub.exe',
        isSigned: false,
        inTempOrDownloads: true,
        cpu: 1.2,
        memoryMb: 42,
        description: 'Staging dropper executable placed inside AppData Temp directory'
      }
    ],
    connections: [
      {
        id: 'c-ps-beacon',
        pid: 7724,
        processName: 'powershell.exe',
        localAddress: '192.168.1.105',
        localPort: 58210,
        remoteAddress: '91.240.118.62',
        remotePort: 8443,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'Panama (Dynamic DNS Provider)',
        remoteOrg: 'Anonymous Cloud Network',
        isSuspicious: true,
        suspiciousReason: 'PowerShell process with persistent external TCP connection to non-Microsoft IP'
      }
    ],
    persistenceEntries: [
      {
        id: 'pers-ps-task',
        name: 'WindowsUpdateTelemetryCheck',
        command: 'schtasks /create /tn \"WindowsTelemetryUpdate\" /tr \"powershell -WindowStyle Hidden -Enc JABjAGwAaQBlAG4AdAA...\"',
        locationType: 'SCHEDULED_TASK',
        locationDisplay: 'Windows Task Scheduler (Every 30 mins)',
        isUnrecognized: true,
        linkedProcessName: 'powershell.exe',
        riskWeight: 25
      }
    ],
    ratTools: [
      {
        id: 'rat-netcat',
        toolName: 'Netcat / Powercat Reverse Shell',
        processName: 'powershell.exe',
        pid: 7724,
        isRunning: true,
        category: 'Covert RAT',
        description: 'Interactive command shell pipe to remote listener',
        riskPoints: 30,
        authorizedByUser: false
      }
    ]
  }
];
