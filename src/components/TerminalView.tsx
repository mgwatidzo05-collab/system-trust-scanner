import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, RefreshCw } from 'lucide-react';
import { ScanEvaluation, Scenario } from '../types';

interface TerminalViewProps {
  scenario: Scenario;
  evaluation: ScanEvaluation;
  onRunScan: () => void;
  isScanning: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  scenario,
  evaluation,
  onRunScan,
  isScanning
}) => {
  const [copied, setCopied] = useState(false);

  const getTerminalText = () => {
    const timeStr = new Date().toLocaleTimeString();
    return `
C:\\Users\\Student> python system_trust_scanner.py

  ╔═══════════════════════════════════════════════════════════════╗
  ║                 SYSTEM TRUST SCANNER v1.0.0                   ║
  ║      Remote-Access & Stealth Compromise Local Detector        ║
  ║      NUST CyberHub — Cybersecurity Innovation Challenge       ║
  ╚═══════════════════════════════════════════════════════════════╝

 [*] Target Scenario: ${scenario.name}
 [*] Active Timestamp: ${timeStr}
 [*] Initializing 4-module zero-privilege scan...
-----------------------------------------------------------------

[1/4] Scanning Network Watch ('Who is talking to the outside world?')...
${scenario.connections.map(c => 
  c.isSuspicious 
    ? `  [!] FLAGGED OUTBOUND: PID ${c.pid} (${c.processName}) ➔ ${c.remoteAddress}:${c.remotePort} [${c.remoteGeo || 'Unknown'}]` 
    : `  [+] Verified Outbound: PID ${c.pid} (${c.processName}) ➔ ${c.remoteAddress}:${c.remotePort}`
).join('\n')}

[2/4] Scanning Process Integrity ('Is anything running from a suspicious place?')...
${scenario.processes.map(p => 
  p.inTempOrDownloads 
    ? `  [!] SUSPICIOUS PATH: ${p.name} (PID ${p.pid}) in ${p.path} [${p.isSigned ? p.signer : 'UNSIGNED'}]` 
    : `  [+] Legitimate Path: ${p.name} in ${p.path}`
).join('\n')}

[3/4] Scanning Persistence Hunter ('What launches automatically at startup?')...
${scenario.persistenceEntries.map(e => 
  e.isUnrecognized 
    ? `  [!] UNRECOGNIZED AUTO-RUN: [${e.locationType}] ${e.name} ➔ ${e.command}` 
    : `  [+] Verified Auto-Run: [${e.locationType}] ${e.name}`
).join('\n')}

[4/4] Scanning Known Remote-Access Tools ('Is a known remote program running?')...
${scenario.ratTools.map(r => 
  r.isRunning 
    ? `  [!] ACTIVE RAT DETECTED: ${r.toolName} (${r.processName}) - Category: ${r.category}` 
    : `  [+] Dormant/Clean: ${r.toolName}`
).join('\n')}

=================================================================
                    FINAL TRUST ASSESSMENT
=================================================================
 Trust Score:       ${evaluation.trustScore} / 100
 Risk Points:       ${evaluation.finalRiskScore} (Base: ${evaluation.rawScore} + Correlation: ${evaluation.correlationBoost})
 Threat Tier:       [ ${evaluation.tier.toUpperCase()} RISK ]
 Total Indicators:  ${evaluation.findings.length}
 Active Triads:     ${evaluation.correlatedChains.length}
=================================================================
 [✓] Summary: ${evaluation.summaryMessage}
 [✓] HTML Audit report written to: ./system_trust_report.html
 [✓] Browser dashboard launched automatically.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTerminalText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Title bar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-400 font-semibold text-xs ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            cmd.exe — python system_trust_scanner.py (Section 6 & 7 Terminal Output)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[11px]"
          >
            {isScanning ? <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isScanning ? 'Running...' : 'Re-Run CLI'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 overflow-x-auto text-slate-200 max-h-96 leading-relaxed select-text bg-[#0b0f19]">
        <pre className="whitespace-pre font-mono text-[11px] leading-snug">
          {getTerminalText()}
        </pre>
      </div>
    </div>
  );
};
