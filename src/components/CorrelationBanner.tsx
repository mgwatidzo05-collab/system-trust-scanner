import React from 'react';
import { Zap, AlertTriangle, ShieldCheck, ArrowRight, Network, FileWarning, KeyRound } from 'lucide-react';
import { CorrelatedChain } from '../types';

interface CorrelationBannerProps {
  chains: CorrelatedChain[];
  totalBoost: number;
}

export const CorrelationBanner: React.FC<CorrelationBannerProps> = ({ chains, totalBoost }) => {
  if (chains.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Correlated Threat Multiplier: Nominal (No Cross-Module Triad Found)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolated benign anomalies do not trigger false alerts. An unsigned tool without outbound traffic or startup hooks is not escalated to Critical.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-900">
          Correlation Weight: +0 pts
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-rose-950/50 border-2 border-rose-600/70 rounded-xl p-4 shadow-lg shadow-rose-950/30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-rose-500 text-slate-950 animate-bounce">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-rose-200 tracking-tight">
                CORRELATED THREAT ENGINE TRIGGERED
              </h3>
              <span className="text-[11px] px-2 py-0.5 font-bold rounded-full bg-rose-500 text-slate-950">
                +{totalBoost} Risk Points Multiplier
              </span>
            </div>
            <p className="text-xs text-rose-300/80">
              PDF Section 5 Formula: An isolated flag may be benign, but correlated cross-module indicators indicate active compromise.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono font-bold text-rose-300 bg-rose-950 px-3 py-1 rounded-lg border border-rose-700/60">
          Active Triads: {chains.length}
        </div>
      </div>

      {/* Triad Visual Nodes */}
      <div className="space-y-3">
        {chains.map((chain, idx) => (
          <div key={idx} className="bg-slate-950/80 rounded-lg p-3 border border-rose-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Target Process: <code className="text-rose-200 bg-rose-950/80 px-1.5 py-0.5 rounded font-mono">{chain.processName} (PID {chain.pid})</code>
              </span>
              <span className="text-[11px] font-mono font-semibold text-rose-300">
                +{chain.bonusPoints} Escalation Boost
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              
              {/* Node 1 */}
              <div className={`p-2 rounded border flex items-center space-x-2 ${
                chain.hasUnusualPath
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <FileWarning className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-rose-400/80 font-bold">1. Path Check</div>
                  <div>Temp/Downloads Dir</div>
                </div>
              </div>

              {/* Node 2 */}
              <div className={`p-2 rounded border flex items-center space-x-2 ${
                chain.hasOutboundSocket
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <Network className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-rose-400/80 font-bold">2. Network Watch</div>
                  <div>Active Outbound C2 Socket</div>
                </div>
              </div>

              {/* Node 3 */}
              <div className={`p-2 rounded border flex items-center space-x-2 ${
                chain.hasStartupPersistence
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <KeyRound className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-rose-400/80 font-bold">3. Persistence</div>
                  <div>Auto-Run Registry Key</div>
                </div>
              </div>

            </div>

            <p className="text-xs text-rose-200/90 mt-2 italic bg-rose-950/30 p-2 rounded border border-rose-900/40">
              "{chain.description}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
