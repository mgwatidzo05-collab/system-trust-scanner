import React from 'react';
import { Globe, Cpu, KeyRound, MonitorCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ScanModuleId } from '../types';

interface ScanProgressProps {
  activeModule: ScanModuleId | 'complete' | 'idle';
  isScanning: boolean;
  findingsCount: {
    network: number;
    integrity: number;
    persistence: number;
    rats: number;
  };
  onSelectTab: (tab: ScanModuleId) => void;
  selectedTab: ScanModuleId | string;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({
  activeModule,
  isScanning,
  findingsCount,
  onSelectTab,
  selectedTab
}) => {
  const modules = [
    {
      id: 'network' as ScanModuleId,
      label: 'Network Watch',
      question: 'Who is talking to the outside world?',
      icon: Globe,
      findings: findingsCount.network,
      detail: 'Outbound TCP/UDP sockets'
    },
    {
      id: 'integrity' as ScanModuleId,
      label: 'Process Integrity',
      question: 'Is anything running from a suspicious place?',
      icon: Cpu,
      findings: findingsCount.integrity,
      detail: 'Temp/Downloads paths & signatures'
    },
    {
      id: 'persistence' as ScanModuleId,
      label: 'Persistence Hunter',
      question: 'What launches automatically at startup?',
      icon: KeyRound,
      findings: findingsCount.persistence,
      detail: 'Registry Run keys & auto-start'
    },
    {
      id: 'rats' as ScanModuleId,
      label: 'Known RATs',
      question: 'Is a known remote program running?',
      icon: MonitorCheck,
      findings: findingsCount.rats,
      detail: 'AnyDesk, TeamViewer & tooling'
    }
  ];

  const getModuleState = (modId: ScanModuleId) => {
    if (!isScanning && activeModule === 'idle') return 'ready';
    if (!isScanning && activeModule === 'complete') return 'done';
    
    // Order of execution
    const order: ScanModuleId[] = ['network', 'integrity', 'persistence', 'rats'];
    const currentIdx = order.indexOf(activeModule as ScanModuleId);
    const modIdx = order.indexOf(modId);

    if (modIdx < currentIdx) return 'done';
    if (modIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {modules.map((m, index) => {
        const state = getModuleState(m.id);
        const Icon = m.icon;
        const isSelected = selectedTab === m.id;
        const hasFindings = m.findings > 0;

        return (
          <button
            key={m.id}
            onClick={() => onSelectTab(m.id)}
            className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
              isSelected
                ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
            }`}
          >
            {/* Active scan animated accent bar */}
            {state === 'active' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-pulse" />
            )}

            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    state === 'active'
                      ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                      : state === 'done'
                      ? hasFindings
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Module 0{index + 1}
                </span>
              </div>

              {/* Status indicator badge */}
              <div>
                {state === 'active' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                    <Loader2 className="w-3 h-3 animate-spin" /> Scanning
                  </span>
                )}
                {state === 'done' && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      hasFindings
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {hasFindings ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        {m.findings} Flag{m.findings > 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Clean
                      </>
                    )}
                  </span>
                )}
                {state === 'ready' && (
                  <span className="text-[11px] font-mono text-slate-500">Ready</span>
                )}
                {state === 'pending' && (
                  <span className="text-[11px] font-mono text-slate-600">Pending</span>
                )}
              </div>
            </div>

            <div className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
              {m.label}
            </div>

            <div className="text-xs text-slate-400 mt-1 italic leading-snug">
              "{m.question}"
            </div>

            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>{m.detail}</span>
              <span className="font-semibold text-slate-400 group-hover:text-cyan-400">View ➔</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
