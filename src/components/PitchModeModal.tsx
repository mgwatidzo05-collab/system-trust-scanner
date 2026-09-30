import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Target, 
  Cpu, 
  Layers, 
  TrendingUp, 
  Play, 
  DollarSign, 
  CheckCircle2, 
  Zap,
  Award
} from 'lucide-react';
import { ScanEvaluation, Scenario } from '../types';

interface PitchModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: ScanEvaluation;
  scenario: Scenario;
}

export const PitchModeModal: React.FC<PitchModeModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  scenario
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "System Trust Scanner",
      subtitle: "A Local-Scan Remote-Access & Stealth Compromise Detector",
      tag: "NUST CyberHub — Cybersecurity Innovation Challenge",
      content: (
        <div className="space-y-6 text-center max-w-3xl mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            Hackathon Finalist Prototype
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Stop Silent Remote Access <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Before Money or Data is Lost
            </span>
          </h1>

          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Students, small businesses, and institutions have no reliable way to know if their PC is quietly compromised. Traditional antivirus misses Remote Access Tools (RATs) and "living-off-the-land" attacks. <strong>System Trust Scanner</strong> brings expert security inspection to everyday users.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-cyan-400 font-bold text-lg mb-1">0 Privileges Bypassed</div>
              <div className="text-xs text-slate-400">Asks the OS what it already tracks, exactly like Task Manager.</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-amber-400 font-bold text-lg mb-1">Plain-Language Score</div>
              <div className="text-xs text-slate-400">Replaces walls of cryptic syslogs with an actionable 0-100 Trust Score.</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-emerald-400 font-bold text-lg mb-1">Mobile Money Focus</div>
              <div className="text-xs text-slate-400">Stops OTP intercept and credential theft targeting EcoCash and banking.</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Problem & The Zimbabwe Angle",
      subtitle: "Silent Remote Access as the Root Cause of Financial Fraud",
      tag: "Section 1 & 2 of Proposal",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
          <div className="space-y-4">
            <div className="bg-rose-950/30 border border-rose-800/80 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-rose-300 mb-1 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                The Antivirus Blindspot
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Antivirus relies on known malware file hashes. But modern RATs use legitimate tools (AnyDesk, UltraViewer, PowerShell, ngrok) or newly compiled stubs. Antivirus gives users a false sense of security while their screen is actively streamed.
              </p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/80 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                The Mobile Money Threat Chain
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In markets like Zimbabwe where mobile money (EcoCash, OneMoney) and online banking are central to daily survival, silent remote access turns every screen into an open window. Attackers see one-time PINs (OTPs) and password resets in real time.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              The Kill Chain We Disrupt:
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px]">1</span>
                <div>
                  <strong>Silent Infiltration:</strong> Masqueraded file drops into Temp folder.
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px]">2</span>
                <div>
                  <strong>Outbound Pipe:</strong> Reverse shell opens outbound connection to remote C2.
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px]">3</span>
                <div>
                  <strong>Persistence:</strong> Registry Run key installed so RAT restarts on boot.
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800 text-emerald-300">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center font-bold text-[11px]">✓</span>
                <div>
                  <strong>System Trust Scanner Intervention:</strong> Detects the 3-point triad and breaks the attack chain before money is transferred!
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The 4-Module Architecture",
      subtitle: "Four Independent Questions Answering Real Analyst Concerns",
      tag: "Section 4 of Proposal",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Module 1</span>
              <span className="text-[11px] font-mono text-slate-400">psutil.net_connections</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">Network Watch</h4>
            <p className="text-xs text-slate-300 italic my-1">"Who is talking to the outside world?"</p>
            <p className="text-xs text-slate-400">
              Scans every process with an active outbound connection. Flags unfamiliar destinations and suspicious ports (4444, 1337, etc.).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Module 2</span>
              <span className="text-[11px] font-mono text-slate-400">psutil.process_iter</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">Process Integrity</h4>
            <p className="text-xs text-slate-300 italic my-1">"Is anything running from a suspicious place?"</p>
            <p className="text-xs text-slate-400">
              Detects running executables launched from unusual locations (%TEMP%, Downloads, Public) instead of trusted Program Files.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Module 3</span>
              <span className="text-[11px] font-mono text-slate-400">winreg / startup</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">Persistence Hunter</h4>
            <p className="text-xs text-slate-300 italic my-1">"What launches automatically at startup?"</p>
            <p className="text-xs text-slate-400">
              Scans HKCU/HKLM Run keys and the Windows Startup folder for unauthorized commands designed to survive reboots.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Module 4</span>
              <span className="text-[11px] font-mono text-slate-400">Signature catalog</span>
            </div>
            <h4 className="text-base font-bold text-slate-100">Known Remote-Access Tools</h4>
            <p className="text-xs text-slate-300 italic my-1">"Is a known remote program running?"</p>
            <p className="text-xs text-slate-400">
              Cross-references running processes against known software: AnyDesk, TeamViewer, UltraViewer, RustDesk, ngrok, VNC.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Correlated Risk Scoring System",
      subtitle: "Why Combinations Tell a Different Story Than Single Flags",
      tag: "Section 5 of Proposal",
      content: (
        <div className="space-y-6 py-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-slate-200 mb-2">The Core Scoring Philosophy:</h4>
            <blockquote className="text-xs text-slate-300 italic border-l-2 border-cyan-400 pl-3">
              "An unsigned process by itself is common and often harmless. But an unsigned process + a live outbound connection + an unrecognized startup entry, together, tell a very different story."
            </blockquote>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl">
              <div className="text-xs font-bold text-emerald-400">Low Tier</div>
              <div className="text-xl font-black text-slate-100">0 – 20</div>
              <div className="text-[11px] text-slate-400 mt-1">No significant indicators</div>
            </div>

            <div className="bg-amber-950/40 border border-amber-800 p-3 rounded-xl">
              <div className="text-xs font-bold text-amber-400">Medium Tier</div>
              <div className="text-xl font-black text-slate-100">21 – 50</div>
              <div className="text-[11px] text-slate-400 mt-1">Some indicators to review</div>
            </div>

            <div className="bg-orange-950/40 border border-orange-800 p-3 rounded-xl">
              <div className="text-xs font-bold text-orange-400">High Tier</div>
              <div className="text-xl font-black text-slate-100">51 – 80</div>
              <div className="text-[11px] text-slate-400 mt-1">Multiple indicators</div>
            </div>

            <div className="bg-rose-950/40 border border-rose-800 p-3 rounded-xl">
              <div className="text-xs font-bold text-rose-400">Critical Tier</div>
              <div className="text-xl font-black text-slate-100">81+</div>
              <div className="text-[11px] text-slate-400 mt-1">Strong compromise sign</div>
            </div>
          </div>

          <div className="bg-rose-950/40 border-2 border-rose-600/80 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-rose-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-rose-200">The Correlated Triad Multiplier</div>
                <div className="text-xs text-rose-300/80">
                  When 1 process combines Untrusted Path + Outbound Socket + Auto-Run persistence, an automatic <strong>+30 point escalation</strong> is triggered!
                </div>
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-rose-400 shrink-0">+30 pts</div>
          </div>
        </div>
      )
    },
    {
      title: "Current Prototype & v2 Roadmap",
      subtitle: "Tested MVP + Post-Hackathon Expansion",
      tag: "Section 7 & 8 of Proposal",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Built & Working in MVP (Today)
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li><strong>Python 3 Core Engine:</strong> Single script using standard <code>psutil</code>, <code>winreg</code>, <code>colorama</code>.</li>
              <li><strong>Interactive Web Dashboard:</strong> Real-time visual Trust Score, tier gauges, and instant one-click remediation.</li>
              <li><strong>Plain-Language Translations:</strong> Every finding explained in terms of personal privacy and financial exposure.</li>
              <li><strong>Cross-Platform Simulation:</strong> Realistic test scenarios for live laptop judging.</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              Roadmap (Version 2.0)
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li><strong>Cryptographic Authenticode:</strong> Integrate <code>pywin32 WinVerifyTrust</code> to cryptographically verify signatures rather than path heuristics.</li>
              <li><strong>Windows Event Log Parsing:</strong> Flag off-hour administrative logon events and account creations.</li>
              <li><strong>YARA Signatures:</strong> Embedded ruleset to match known malware families by bytecode.</li>
              <li><strong>PyInstaller .exe Package:</strong> Single double-click executable for zero-install deployment by students and non-technical staff.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              {slide.tag}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">{slide.title}</h2>
            <p className="text-sm text-cyan-400 font-medium">{slide.subtitle}</p>
          </div>

          {slide.content}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              currentSlide === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-200 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentSlide ? 'bg-cyan-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              currentSlide === slides.length - 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-200 bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
