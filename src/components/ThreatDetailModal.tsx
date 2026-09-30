import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Lock, 
  Terminal, 
  Sparkles, 
  ArrowRight,
  Info,
  Bug,
  Globe,
  HardDrive
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface ThreatIntelligence {
  id: string;
  title: string;
  threatType: 'Reverse Shell' | 'Remote Desktop RAT' | 'Persistence Hook' | 'Mobile Banking Trojan' | 'Stealth Script';
  severity: 'Critical' | 'High' | 'Medium';
  fileNameOrProcess: string;
  locationOrPort: string;
  howItEntered: string;
  capabilities: string[];
  mobileMoneyImpact: string;
  manualFixCommands: string[];
  isRemediated?: boolean;
}

interface ThreatDetailModalProps {
  threat: ThreatIntelligence | null;
  isOpen: boolean;
  onClose: () => void;
  onRemediate: (id: string) => void;
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({
  threat,
  isOpen,
  onClose,
  onRemediate
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixStep, setFixStep] = useState(0);

  if (!isOpen || !threat) return null;

  const handleFix = () => {
    setIsFixing(true);
    setFixStep(1);
    soundFx.playScanTick();

    setTimeout(() => {
      setFixStep(2);
      soundFx.playScanTick();
    }, 600);

    setTimeout(() => {
      setFixStep(3);
      soundFx.playScanTick();
    }, 1200);

    setTimeout(() => {
      setIsFixing(false);
      setFixStep(0);
      onRemediate(threat.id);
      soundFx.playRemediate();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 ${
          threat.isRemediated
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            : threat.severity === 'Critical'
            ? 'bg-rose-950/50 border-rose-800 text-rose-200'
            : 'bg-amber-950/50 border-amber-800 text-amber-200'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${
              threat.isRemediated
                ? 'bg-emerald-500 text-slate-950'
                : threat.severity === 'Critical'
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500 text-slate-950'
            }`}>
              {threat.isRemediated ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20">
                  {threat.threatType}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  threat.isRemediated
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {threat.isRemediated ? '✓ Neutralized' : `${threat.severity} Severity`}
                </span>
              </div>

              <h2 className="text-xl font-black text-white">
                {threat.title}
              </h2>
              <p className="text-xs opacity-90 mt-0.5 font-mono">
                Target: {threat.fileNameOrProcess} • {threat.locationOrPort}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-slate-300">
          
          {/* Fixing Live Animation */}
          {isFixing && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/60 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Neutralizing Threat & Cleaning System...</span>
              </div>
              <div className="space-y-1 text-slate-300 text-xs">
                <div className={fixStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {fixStep >= 1 ? '✓' : '○'} Step 1: Terminating unauthorized background process...
                </div>
                <div className={fixStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {fixStep >= 2 ? '✓' : '○'} Step 2: Severing foreign C2 network socket connection...
                </div>
                <div className={fixStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {fixStep >= 3 ? '✓' : '○'} Step 3: Removing auto-start persistence entry & isolating file...
                </div>
              </div>
            </div>
          )}

          {/* 1. How it entered */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              How It Likely Entered Your Device
            </h3>
            <p className="leading-relaxed text-slate-400">
              {threat.howItEntered}
            </p>
          </div>

          {/* 2. Attack Capabilities */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-400" />
              What This Threat Can Do (Active Capabilities)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {threat.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Mobile Money & Banking Impact */}
          <div className="bg-rose-950/30 border border-rose-800/80 p-4 rounded-2xl space-y-1.5 text-rose-200">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs">
              <Lock className="w-4 h-4 text-rose-400" />
              Impact on EcoCash, OneMoney & Banking Apps
            </h3>
            <p className="leading-relaxed">
              {threat.mobileMoneyImpact}
            </p>
          </div>

          {/* 4. Manual Removal Commands */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Technical Removal Commands (If fixing manually)
            </h3>
            <div className="bg-black/80 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
              {threat.manualFixCommands.map((cmd, i) => (
                <div key={i} className="break-all">{cmd}</div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {threat.isRemediated 
              ? '✓ This threat is already neutralized on this system.' 
              : 'Click below to stop the process and clean your system immediately.'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!threat.isRemediated ? (
              <button
                onClick={handleFix}
                disabled={isFixing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4 text-slate-950" />
                <span>{isFixing ? 'Fixing...' : 'Fix This Threat Now'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Threat Successfully Cleaned</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
