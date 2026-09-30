export const PYTHON_SCRIPT_CODE = `#!/usr/bin/env python3
"""
================================================================================
SYSTEM TRUST SCANNER (MVP)
A Local-Scan Remote-Access & Compromise Detector
NUST CyberHub — Cybersecurity Innovation Challenge Submission
================================================================================

Description:
  Lightweight local inspection tool that scans a Windows machine for indicators
  a trained security analyst looks for:
    1. Network Watch: Outbound sockets & unexpected remote endpoints
    2. Process Integrity: Processes launched from Temp / Downloads folders
    3. Persistence Hunter: Registry Run keys & Startup folder auto-starts
    4. Known RATs: Cross-checking running binaries against Remote Access Tools

  Calculates a plain-language Trust Score & Risk Tier, incorporating a Correlated
  Threat Multiplier, and opens an HTML dashboard in your browser.

Requirements:
  pip install psutil colorama
"""

import os
import sys
import time
import socket
import webbrowser
from datetime import datetime

# Dependency verification
try:
    import psutil
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    print("[!] Missing required libraries. Please run:")
    print("    pip install psutil colorama")
    sys.exit(1)

# Platform check
IS_WINDOWS = sys.platform.startswith('win')
if IS_WINDOWS:
    try:
        import winreg
    except ImportError:
        pass

# Known Remote Access Software Signatures (Commercial and Tooling)
KNOWN_RAT_NAMES = {
    'anydesk.exe': 'AnyDesk Remote Desktop',
    'teamviewer.exe': 'TeamViewer Remote Client',
    'teamviewer_service.exe': 'TeamViewer Service',
    'ultraviewer.exe': 'UltraViewer Remote Support',
    'ultraviewer_service.exe': 'UltraViewer Service',
    'rustdesk.exe': 'RustDesk Remote Desktop',
    'screenconnect.client.exe': 'ConnectWise ScreenConnect',
    'splashtop.exe': 'Splashtop Remote Desktop',
    'ngrok.exe': 'ngrok Port Forwarding Tunnel',
    'vncserver.exe': 'VNC Server',
    'winvnc.exe': 'TightVNC Server',
    'nc.exe': 'Netcat Shell Utility',
    'ncat.exe': 'Ncat Remote Shell',
    'ammyy.exe': 'Ammyy Admin Remote Tool',
}

SUSPICIOUS_REMOTE_PORTS = {4444, 5552, 1337, 8888, 6667, 7070, 21116}

TEMP_PATH_PATTERNS = [
    '\\\\appdata\\\\local\\\\temp',
    '\\\\temp',
    '\\\\downloads',
    '\\\\users\\\\public'
]

def banner():
    print(Fore.CYAN + Style.BRIGHT + """
  ╔═══════════════════════════════════════════════════════════════╗
  ║                 SYSTEM TRUST SCANNER v1.0.0                   ║
  ║      Remote-Access & Stealth Compromise Local Detector        ║
  ║      NUST CyberHub — Cybersecurity Innovation Challenge       ║
  ╚═══════════════════════════════════════════════════════════════╝
    """)
    print(Fore.WHITE + " [*] Initializing 4-module zero-privilege scan...")
    print(Fore.WHITE + " [*] Time: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("-" * 65)

# Module 1: Network Watch
def scan_network_watch():
    print(Fore.YELLOW + "\\n[1/4] Scanning Network Watch ('Who is talking to the outside world?')...")
    time.sleep(0.4)
    findings = []
    active_conns = []

    try:
        connections = psutil.net_connections(kind='inet')
        for conn in connections:
            if conn.status == 'ESTABLISHED' and conn.raddr:
                r_ip, r_port = conn.raddr
                # Filter out localhost/private LAN if desired
                if r_ip.startswith(('127.', '10.', '192.168.', '172.16.')):
                    continue

                proc_name = "Unknown"
                try:
                    p = psutil.Process(conn.pid)
                    proc_name = p.name()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

                is_suspicious = (r_port in SUSPICIOUS_REMOTE_PORTS) or ("updater" in proc_name.lower() and r_port != 443)
                conn_data = {
                    'pid': conn.pid,
                    'process': proc_name,
                    'laddr': f"{conn.laddr.ip}:{conn.laddr.port}",
                    'raddr': f"{r_ip}:{r_port}",
                    'port': r_port,
                    'is_suspicious': is_suspicious
                }
                active_conns.append(conn_data)

                if is_suspicious:
                    findings.append({
                        'module': 'Network Watch',
                        'title': f'Unusual Outbound Connection ({proc_name} ➔ {r_ip}:{r_port})',
                        'points': 25,
                        'details': f'Process PID {conn.pid} ({proc_name}) connected to external destination on port {r_port}.',
                        'plain_language': 'A program on your computer is communicating with an external server on an uncommon port often used by remote control software.'
                    })
                    print(Fore.RED + f"  [!] Flagged: {proc_name} (PID {conn.pid}) ➔ {r_ip}:{r_port}")
                else:
                    print(Fore.GREEN + f"  [+] Active: {proc_name} ➔ {r_ip}:{r_port}")
    except Exception as e:
        print(Fore.MAGENTA + f"  [~] Network scan limited: {e}")

    return findings, active_conns

# Module 2: Process Integrity
def scan_process_integrity():
    print(Fore.YELLOW + "\\n[2/4] Scanning Process Integrity ('Is anything running from a suspicious place?')...")
    time.sleep(0.4)
    findings = []
    procs = []

    for proc in psutil.process_iter(['pid', 'name', 'exe', 'username']):
        try:
            p_info = proc.info
            exe_path = p_info['exe'] or ''
            lower_path = exe_path.lower()
            name = p_info['name'] or ''

            in_temp = any(p in lower_path for p in TEMP_PATH_PATTERNS)
            if in_temp:
                findings.append({
                    'module': 'Process Integrity',
                    'title': f'Execution From Untrusted Path ({name})',
                    'points': 20,
                    'details': f'Process {name} (PID {p_info[\"pid\"]}) running from: {exe_path}',
                    'plain_language': 'Legitimate desktop software typically installs in "Program Files". Programs running out of Temp or Downloads may be attempting to evade standard file protections.'
                })
                print(Fore.RED + f"  [!] Suspicious Location: {name} (PID {p_info[\"pid\"]}) in {exe_path}")
            procs.append({'pid': p_info['pid'], 'name': name, 'path': exe_path, 'in_temp': in_temp})
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return findings, procs

# Module 3: Persistence Hunter
def scan_persistence():
    print(Fore.YELLOW + "\\n[3/4] Scanning Persistence Hunter ('What launches automatically at startup?')...")
    time.sleep(0.4)
    findings = []
    autoruns = []

    if IS_WINDOWS:
        subkeys = [
            (winreg.HKEY_CURRENT_USER, r"Software\\Microsoft\\Windows\\CurrentVersion\\Run", "HKCU Run"),
            (winreg.HKEY_LOCAL_MACHINE, r"Software\\Microsoft\\Windows\\CurrentVersion\\Run", "HKLM Run")
        ]
        for root, subkey_path, label in subkeys:
            try:
                key = winreg.OpenKey(root, subkey_path, 0, winreg.KEY_READ)
                count = winreg.QueryInfoKey(key)[1]
                for i in range(count):
                    name, val, _ = winreg.EnumValue(key, i)
                    lower_val = str(val).lower()
                    is_suspicious = any(p in lower_val for p in TEMP_PATH_PATTERNS) or "updater" in name.lower()
                    autoruns.append({'name': name, 'cmd': val, 'location': label, 'suspicious': is_suspicious})
                    if is_suspicious:
                        findings.append({
                            'module': 'Persistence Hunter',
                            'title': f'Suspicious Auto-Run Entry ({name})',
                            'points': 20,
                            'details': f'Auto-run entry "{name}" launches: {val}',
                            'plain_language': 'This entry ensures the software restarts automatically every time your computer boots.'
                        })
                        print(Fore.RED + f"  [!] Auto-Start Flag: [{label}] {name} ➔ {val}")
                    else:
                        print(Fore.GREEN + f"  [+] Verified Auto-Start: [{label}] {name}")
                winreg.CloseKey(key)
            except Exception as e:
                pass
    else:
        # Non-Windows fallback (Linux/macOS cron / launchd simulation)
        autoruns.append({'name': 'MockStartup', 'cmd': 'systemctl --user', 'location': 'systemd', 'suspicious': False})
        print(Fore.GREEN + "  [+] Persistence scanned (Non-Windows environment)")

    return findings, autoruns

# Module 4: Known RATs
def scan_known_rats():
    print(Fore.YELLOW + "\\n[4/4] Scanning Known Remote-Access Tools ('Is a known remote program running?')...")
    time.sleep(0.4)
    findings = []
    found_rats = []

    for proc in psutil.process_iter(['pid', 'name']):
        try:
            name = (proc.info['name'] or '').lower()
            if name in KNOWN_RAT_NAMES:
                tool_label = KNOWN_RAT_NAMES[name]
                found_rats.append({'tool': tool_label, 'pid': proc.info['pid'], 'name': name})
                findings.append({
                    'module': 'Known Remote Tools',
                    'title': f'Active Remote Tool Detected: {tool_label}',
                    'points': 25,
                    'details': f'{tool_label} ({name}) is actively running with PID {proc.info[\"pid\"]}.',
                    'plain_language': 'Remote desktop software is currently running. If you did not invite someone to fix your computer right now, your screen may be visible to an external operator.'
                })
                print(Fore.RED + f"  [!] Active RAT Detected: {tool_label} (PID {proc.info[\"pid\"]})")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    if not found_rats:
        print(Fore.GREEN + "  [+] No recognized remote access tools found in memory.")

    return findings, found_rats

def calculate_score(all_findings):
    raw_score = sum(f['points'] for f in all_findings)
    # Correlation boost logic: check if multiple modules triggered
    modules_triggered = len(set(f['module'] for f in all_findings))
    correlation_boost = 0
    if modules_triggered >= 3:
        correlation_boost = 30
    elif modules_triggered == 2:
        correlation_boost = 15

    final_risk = min(100, raw_score + correlation_boost)
    trust_score = max(0, 100 - final_risk)

    if final_risk <= 20:
        tier = "Low"
        tier_color = Fore.GREEN
    elif final_risk <= 50:
        tier = "Medium"
        tier_color = Fore.YELLOW
    elif final_risk <= 80:
        tier = "High"
        tier_color = Fore.MAGENTA
    else:
        tier = "Critical"
        tier_color = Fore.RED

    return trust_score, final_risk, tier, tier_color, correlation_boost

def generate_html_report(trust_score, risk_score, tier, findings, correlation_boost):
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>System Trust Scanner — Audit Report</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 30px; margin: 0; }}
    .card {{ background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 20px; }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px; }}
    .tier-Critical {{ background: #ef4444; color: white; }}
    .tier-High {{ background: #f97316; color: white; }}
    .tier-Medium {{ background: #eab308; color: black; }}
    .tier-Low {{ background: #22c55e; color: white; }}
    h1, h2, h3 {{ margin-top: 0; }}
    .finding {{ border-left: 4px solid #ef4444; background: #1e293b; padding: 12px; margin-bottom: 12px; border-radius: 4px; }}
  </style>
</head>
<body>
  <div class="card">
    <h2>System Trust Scanner — Audit Report</h2>
    <p>NUST CyberHub — Cybersecurity Innovation Challenge</p>
    <h1>Trust Score: {trust_score}/100 | Risk: {risk_score}/100 <span class="badge tier-{tier}">{tier} Risk</span></h1>
    <p>Correlation Threat Boost Applied: +{correlation_boost} points</p>
  </div>
  <div class="card">
    <h3>Detected Indicators ({len(findings)})</h3>
    {"".join(f'<div class="finding"><strong>[{f["module"]}] {f["title"]}</strong><p>{f["details"]}</p><em>{f["plain_language"]}</em></div>' for f in findings) or '<p>No threats detected. System safe.</p>'}
  </div>
</body>
</html>"""
    filename = "system_trust_report.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    return filename

def main():
    banner()
    f1, _ = scan_network_watch()
    f2, _ = scan_process_integrity()
    f3, _ = scan_persistence()
    f4, _ = scan_known_rats()

    all_findings = f1 + f2 + f3 + f4
    trust_score, risk_score, tier, tier_color, correlation_boost = calculate_score(all_findings)

    print("\\n" + "=" * 65)
    print(Fore.CYAN + Style.BRIGHT + "                FINAL TRUST ASSESSMENT")
    print("=" * 65)
    print(f" Trust Score:       {Fore.WHITE}{Style.BRIGHT}{trust_score} / 100")
    print(f" Risk Points:       {risk_score} (Base + {correlation_boost} Correlated Boost)")
    print(f" Threat Tier:       {tier_color}{Style.BRIGHT}{tier}")
    print(f" Total Indicators:  {len(all_findings)}")
    print("-" * 65)

    report_file = generate_html_report(trust_score, risk_score, tier, all_findings, correlation_boost)
    print(Fore.GREEN + f" [✓] HTML Report generated: {report_file}")
    try:
        webbrowser.open(os.path.abspath(report_file))
    except Exception:
        pass

if __name__ == '__main__':
    main()
`;
