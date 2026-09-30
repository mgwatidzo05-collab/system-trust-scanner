import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Wrench, 
  PhoneCall, 
  Lock, 
  Eye, 
  Wifi, 
  FolderMinus, 
  Power 
} from 'lucide-react';
import { ScanEvaluation } from '../types';

interface SimpleHealthCardProps {
  evaluation: ScanEvaluation;
  isScanning: boolean;
  onFixAll: () => void;
  onScanAgain: () => void;
  onFixSingle: (id: string, name: string) => void;
}

export const SimpleHealthCard: React.FC<SimpleHealthCardProps> = ({
  evaluation,
  isScanning,
  onFixAll,
  onScanAgain,
  onFixSingle
}) => {
  const isSafe = evaluation.tier === 'Low';
  const isCaution = evaluation.tier === 'Medium';
  const isDanger = evaluation.tier === 'High' || evaluation.tier === 'Critical';

  return (
    <div className="space-y-6">
      
      {/* BIG STATUS CARD (TRAFFIC LIGHT) */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl transition-all ${
        isSafe 
          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 shadow-emerald-950/40' 
          : isCaution
          ? 'bg-amber-950/40 border-amber-500/80 text-amber-100 shadow-amber-950/40'
          : 'bg-rose-950/50 border-rose-500 text-rose-100 shadow-rose-950/50'
      }`}>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          
          {/* Big Status Icon */}
          <div className={`p-5 rounded-2xl shrink-0 shadow-lg ${
            isSafe 
              ? 'bg-emerald-500 text-slate-950' 
              : isCaution 
              ? 'bg-amber-500 text-slate-950' 
              : 'bg-rose-500 text-white animate-pulse'
          }`}>
            {isSafe ? (
              <ShieldCheck className="w-16 h-16" />
            ) : isCaution ? (
              <AlertTriangle className="w-16 h-16" />
            ) : (
              <ShieldAlert className="w-16 h-16" />
            )}
          </div>

          {/* Status Text & Message */}
          <div className="space-y-2 flex-1">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/40 border border-white/20">
              {isSafe ? '🟢 All Clear' : isCaution ? '🟡 Attention Needed' : '🔴 Action Needed'}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isSafe && "Your Computer is Safe & Clean"}
              {isCaution && "A Remote Program is Open — Did you ask for it?"}
              {isDanger && "Warning: Someone May Be Secretly Watching Your Computer"}
            </h1>

            <p className="text-base sm:text-lg opacity-90 leading-relaxed max-w-2xl">
              {isSafe && "No strangers, remote control tools, or sneaky programs are connected to your computer. Your screen and passwords are safe."}
              {isCaution && "We noticed a remote access tool is open. If a trusted friend or family member is helping you fix your computer right now, this is okay. Otherwise, you should close it."}
              {isDanger && "We detected unauthorized programs talking to an outside computer. Please do NOT type your bank passwords, EcoCash PINs, or sensitive information until this is fixed."}
            </p>

            {/* Quick Mobile Money / EcoCash Warning Banner for danger state */}
            {isDanger && (
              <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-rose-500/50 text-rose-200 text-sm flex items-start gap-3 text-left">
                <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-base">Simple Rule Right Now:</strong>
                  Do not log into <strong>EcoCash, OneMoney, Innbucks, or Bank Apps</strong> on this computer until you click the green "Fix Everything" button below.
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Action Button inside Status Card */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium opacity-80">
            {isSafe ? "Checked just now • Zero suspicious activity" : `Found ${evaluation.findings.length} item(s) that need your attention`}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* If there are threats, show BIG green fix button */}
            {!isSafe && (
              <button
                onClick={onFixAll}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Wrench className="w-5 h-5 text-slate-950" />
                <span>Fix Everything For Me (One Click)</span>
              </button>
            )}

            {/* Scan Again Button */}
            <button
              onClick={onScanAgain}
              disabled={isScanning}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSafe 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/40 text-emerald-200' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? "Checking computer..." : "Check My Computer Again"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* THE 4 SIMPLE QUESTIONS CHECKLIST (Section 4 made human) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
        <h2 className="text-lg font-bold text-slate-100 mb-1">
          What We Checked on Your Computer
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          We answer 4 simple questions without touching any of your personal files or photos:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Question 1: Outside talk */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            evaluation.moduleFindingsCount.network > 0 
              ? 'bg-rose-950/20 border-rose-700/60' 
              : 'bg-slate-950 border-slate-800/80'
          }`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${
              evaluation.moduleFindingsCount.network > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-200">1. Talking to Strangers?</h3>
                {evaluation.moduleFindingsCount.network > 0 ? (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800">
                    Found 1 Problem
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Safe ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {evaluation.moduleFindingsCount.network > 0 
                  ? "A secret program was found sending information to an unknown computer outside."
                  : "No secret outside connections found. Only normal programs like your browser are talking."}
              </p>
            </div>
          </div>

          {/* Question 2: Hidden in strange folders */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            evaluation.moduleFindingsCount.integrity > 0 
              ? 'bg-rose-950/20 border-rose-700/60' 
              : 'bg-slate-950 border-slate-800/80'
          }`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${
              evaluation.moduleFindingsCount.integrity > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <FolderMinus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-200">2. Hiding in Strange Folders?</h3>
                {evaluation.moduleFindingsCount.integrity > 0 ? (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800">
                    Found 1 Problem
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Safe ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {evaluation.moduleFindingsCount.integrity > 0
                  ? "A program is running out of a Temporary or Downloads folder instead of where normal programs belong."
                  : "All running programs are located in standard, trusted Windows folders."}
              </p>
            </div>
          </div>

          {/* Question 3: Automatic startup */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            evaluation.moduleFindingsCount.persistence > 0 
              ? 'bg-rose-950/20 border-rose-700/60' 
              : 'bg-slate-950 border-slate-800/80'
          }`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${
              evaluation.moduleFindingsCount.persistence > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-200">3. Sneaky Auto-Start?</h3>
                {evaluation.moduleFindingsCount.persistence > 0 ? (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800">
                    Found 1 Problem
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Safe ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {evaluation.moduleFindingsCount.persistence > 0
                  ? "An unauthorized setting was found that turns the sneaky program on every time you restart your laptop."
                  : "Only verified system programs turn on when your computer boots up."}
              </p>
            </div>
          </div>

          {/* Question 4: Remote Control tools */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            evaluation.moduleFindingsCount.rats > 0 
              ? 'bg-rose-950/20 border-rose-700/60' 
              : 'bg-slate-950 border-slate-800/80'
          }`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${
              evaluation.moduleFindingsCount.rats > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-200">4. Remote Screen Watchers?</h3>
                {evaluation.moduleFindingsCount.rats > 0 ? (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800">
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Safe ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {evaluation.moduleFindingsCount.rats > 0
                  ? "A remote desktop tool (like AnyDesk or UltraViewer) is running right now in memory."
                  : "No remote desktop or screen mirroring programs are running."}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* EASY TO READ LIST OF PROBLEMS (IF ANY) */}
      {!isSafe && evaluation.findings.length > 0 && (
        <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                What Needs to be Fixed ({evaluation.findings.length})
              </h2>
              <p className="text-xs text-slate-400">
                You can fix each one with a single click, or click the big green "Fix Everything" button above.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {evaluation.findings.map((f, i) => (
              <div 
                key={f.id} 
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {f.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-8">
                    {f.plainLanguageExplanation}
                  </p>

                  <div className="text-[11px] text-amber-300/90 pl-8 font-medium">
                    ⚠️ <strong>Why this matters to you:</strong> {f.mobileMoneyImpact}
                  </div>
                </div>

                {f.entityId && (
                  <button
                    onClick={() => onFixSingle(f.entityId!, f.title)}
                    className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shrink-0 shadow-md cursor-pointer transition-colors"
                  >
                    Fix This One
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HELPFUL ADVICE FOR SENIORS / EVERYDAY USERS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 shrink-0">
          <PhoneCall className="w-8 h-8" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-slate-200">
            Rule of Thumb: Phone Scams & Remote Support
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If someone calls you on WhatsApp or phone claiming to be from your bank, EcoCash, or Microsoft asking you to "download AnyDesk" so they can fix your computer — <strong>hang up immediately!</strong> Banks will never ask to remotely control your computer.
          </p>
        </div>
      </div>

    </div>
  );
};
