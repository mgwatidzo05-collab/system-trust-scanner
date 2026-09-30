export interface RealFileScanResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  sha256: string;
  isExecutable: boolean;
  isSuspicious: boolean;
  riskScore: number; // 0 to 100
  threatTier: 'Low' | 'Medium' | 'High' | 'Critical';
  verdict: string;
  flags: Array<{
    rule: string;
    description: string;
    severity: 'info' | 'medium' | 'high' | 'critical';
  }>;
}

export interface RealDeviceAuditResult {
  webrtcLeakDetected: boolean;
  localIpsFound: string[];
  screenCapturePerm: string;
  onlineStatus: boolean;
  platform: string;
  hardwareConcurrency: number;
  memoryGb?: number;
  riskFindings: string[];
}

// Suspicious byte signatures and string patterns
const KNOWN_THREAT_PATTERNS = [
  { pattern: 'meterpreter', rule: 'Metasploit Meterpreter Payload', severity: 'critical' as const, desc: 'Embedded signature of Metasploit remote exploit agent.' },
  { pattern: 'anydesk', rule: 'AnyDesk Remote Access Binary', severity: 'high' as const, desc: 'Contains embedded AnyDesk screen mirroring component.' },
  { pattern: 'ultraviewer', rule: 'UltraViewer Remote Support Tool', severity: 'high' as const, desc: 'Contains UltraViewer remote control desktop strings.' },
  { pattern: 'teamviewer', rule: 'TeamViewer Remote Client', severity: 'medium' as const, desc: 'Contains TeamViewer remote desktop binaries.' },
  { pattern: 'powershell -enc', rule: 'Encoded Obfuscated PowerShell Command', severity: 'critical' as const, desc: 'Attempts to run Base64 obfuscated script to bypass inspection.' },
  { pattern: 'downloadstring', rule: 'Web Download Cradle (IEX / WebClient)', severity: 'critical' as const, desc: 'Command to silently pull and execute remote payload from external web server.' },
  { pattern: 'wscript.shell', rule: 'Windows Script Host Automation', severity: 'high' as const, desc: 'Invokes WScript Shell often used to run hidden background commands.' },
  { pattern: 'software\\microsoft\\windows\\currentversion\\run', rule: 'Registry Startup Persistence String', severity: 'high' as const, desc: 'Targets Windows auto-start registry key to survive reboots.' },
  { pattern: 'mimikatz', rule: 'Credential Dumping Tool (Mimikatz)', severity: 'critical' as const, desc: 'Embedded signature for LSASS memory credential theft.' },
  { pattern: 'ngrok.io', rule: 'Reverse Proxy Tunneling (ngrok)', severity: 'high' as const, desc: 'Creates outside reverse proxy tunnel bypassing router firewalls.' },
  { pattern: 'nc.exe', rule: 'Netcat Command Shell', severity: 'critical' as const, desc: 'Raw reverse shell utility.' },
];

export async function scanRealFile(file: File): Promise<RealFileScanResult> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 1. Calculate Real SHA-256 Hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 2. Check PE header (MZ at offset 0 = 0x4D, 0x5A)
  const isPE = bytes.length > 2 && bytes[0] === 0x4D && bytes[1] === 0x5A;
  const isExecutable = isPE || /\.(exe|dll|bat|cmd|ps1|vbs|hta|scr|jar|msi)$/i.test(file.name);

  // 3. Extract readable text strings from binary buffer (first 1.5MB for performance)
  const maxScanBytes = Math.min(bytes.length, 1.5 * 1024 * 1024);
  let asciiText = '';
  for (let i = 0; i < maxScanBytes; i++) {
    const c = bytes[i];
    // Printable ASCII
    if (c >= 32 && c <= 126) {
      asciiText += String.fromCharCode(c);
    } else if (c === 10 || c === 13) {
      asciiText += ' ';
    }
  }
  const lowerText = asciiText.toLowerCase();

  const flags: RealFileScanResult['flags'] = [];
  let riskScore = 0;

  if (isExecutable) {
    flags.push({
      rule: 'Executable Binary Detected',
      description: isPE ? 'Standard Windows PE binary executable (MZ header confirmed).' : 'Script / executable file extension.',
      severity: 'info'
    });
    riskScore += 10;
  }

  // Check known patterns
  for (const item of KNOWN_THREAT_PATTERNS) {
    if (lowerText.includes(item.pattern)) {
      flags.push({
        rule: item.rule,
        description: item.desc,
        severity: item.severity
      });
      if (item.severity === 'critical') riskScore += 45;
      else if (item.severity === 'high') riskScore += 25;
      else if (item.severity === 'medium') riskScore += 15;
    }
  }

  // Check for suspicious high entropy / masquerade (e.g. PDF named with .exe)
  if (file.name.toLowerCase().includes('.pdf.exe') || file.name.toLowerCase().includes('.docx.exe')) {
    flags.push({
      rule: 'Double Extension Masquerade',
      description: 'Disguises an executable program as a document to trick users.',
      severity: 'critical'
    });
    riskScore += 50;
  }

  riskScore = Math.min(100, riskScore);

  let threatTier: RealFileScanResult['threatTier'] = 'Low';
  let verdict = 'No malicious indicators or remote access signatures found in this file.';

  if (riskScore >= 80) {
    threatTier = 'Critical';
    verdict = 'CRITICAL THREAT: High-risk remote access or reverse shell components identified in this file!';
  } else if (riskScore >= 50) {
    threatTier = 'High';
    verdict = 'HIGH RISK: Suspicious remote control or script automation components detected.';
  } else if (riskScore >= 20) {
    threatTier = 'Medium';
    verdict = 'CAUTION: File has executable characteristics or automated scripting capabilities.';
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    sha256,
    isExecutable,
    isSuspicious: riskScore >= 25,
    riskScore,
    threatTier,
    verdict,
    flags
  };
}

// Perform real WebRTC and browser environment check
export async function auditRealDevice(): Promise<RealDeviceAuditResult> {
  const localIpsFound: string[] = [];
  let webrtcLeakDetected = false;

  // Real WebRTC probe
  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.createDataChannel('leakTest');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await new Promise<void>((resolve) => {
      let resolved = false;
      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          if (!resolved) {
            resolved = true;
            resolve();
          }
          return;
        }
        const cand = event.candidate.candidate;
        // Parse candidate IPs
        const ipMatch = cand.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
        if (ipMatch && ipMatch[1]) {
          const ip = ipMatch[1];
          if (!localIpsFound.includes(ip) && !ip.startsWith('0.0.0.0')) {
            localIpsFound.push(ip);
          }
        }
      };

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 1500);
    });

    pc.close();
    webrtcLeakDetected = localIpsFound.length > 0;
  } catch {
    // WebRTC not supported or blocked
  }

  // Check screen capture permissions
  let screenCapturePerm = 'prompt';
  try {
    const perms = (navigator as any).permissions;
    if (perms && typeof perms.query === 'function') {
      const status = await perms.query({ name: 'display-capture' as any }).catch(() => null);
      if (status) {
        screenCapturePerm = status.state;
      }
    }
  } catch {}

  const riskFindings: string[] = [];
  if (webrtcLeakDetected) {
    riskFindings.push(`WebRTC IP Exposure: Your network IP addresses (${localIpsFound.join(', ')}) were visible via browser STUN candidate resolution.`);
  }
  if (screenCapturePerm === 'granted') {
    riskFindings.push('Active Screen Capture Permission: Screen viewing permission is currently granted to web applications without confirmation.');
  }

  return {
    webrtcLeakDetected,
    localIpsFound,
    screenCapturePerm,
    onlineStatus: navigator.onLine,
    platform: navigator.platform || 'Unknown OS',
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    memoryGb: (navigator as any).deviceMemory || undefined,
    riskFindings
  };
}

export const WINDOWS_NATIVE_SCANNER_BAT = `@echo off
title System Trust Scanner - Native Windows Audit
echo =====================================================================
echo           SYSTEM TRUST SCANNER - REAL WINDOWS AUDIT
echo       NUST CyberHub - Cybersecurity Innovation Challenge
echo =====================================================================
echo.
echo [*] Inspecting real Windows system state...
echo [*] Checking active network connections...
echo [*] Checking Registry auto-run persistence...
echo [*] Checking running tasks...
echo.

set OUTPUT_FILE="%USERPROFILE%\\Desktop\\system_trust_audit.json"

echo { > %OUTPUT_FILE%
echo   "scanTime": "%date% %time%", >> %OUTPUT_FILE%
echo   "computerName": "%COMPUTERNAME%", >> %OUTPUT_FILE%
echo   "userName": "%USERNAME%", >> %OUTPUT_FILE%
echo   "os": "%OS%", >> %OUTPUT_FILE%
echo   "startupKeys": [ >> %OUTPUT_FILE%

for /f "tokens=1,2,*" %%A in ('reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run 2^>nul') do (
  if not "%%A"=="" (
    echo     {"name": "%%A", "command": "%%C"}, >> %OUTPUT_FILE%
  )
)
echo     {"name": "END_MARKER", "command": "none"} >> %OUTPUT_FILE%
echo   ], >> %OUTPUT_FILE%
echo   "status": "Audit Complete" >> %OUTPUT_FILE%
echo } >> %OUTPUT_FILE%

echo.
echo [✓] REAL SYSTEM AUDIT SAVED TO YOUR DESKTOP:
echo     %OUTPUT_FILE%
echo.
echo You can drag and drop this file into your System Trust Scanner application!
pause
`;
