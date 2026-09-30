import React from 'react';
import { 
  Globe, 
  Cpu, 
  KeyRound, 
  MonitorCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ShieldX, 
  Lock, 
  DollarSign, 
  Phone,
  Trash2,
  XCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { 
  ScanModuleId, 
  Finding, 
  ProcessItem, 
  NetworkConnection, 
  PersistenceEntry, 
  RatItem 
} from '../types';

interface ModuleDetailsProps {
  activeTab: ScanModuleId | 'all-findings' | 'mobile-money';
  onSelectTab: (tab: ScanModuleId | 'all-findings' | 'mobile-money') => void;
  findings: Finding[];
  processes: ProcessItem[];
  connections: NetworkConnection[];
  persistenceEntries: PersistenceEntry[];
  ratTools: RatItem[];
  remediatedIds: Set<string>;
  onRemediate: (id: string, name: string) => void;
}

export const ModuleDetails: React.FC<ModuleDetailsProps> = ({
  activeTab,
  onSelectTab,
  findings,
  processes,
  connections,
  persistenceEntries,
  ratTools,
  remediatedIds,
  onRemediate
}) => {
  const tabs = [
    { id: 'network' as const, label: '1. Network Watch', count: findings.filter(f => f.moduleId === 'network').length },
    { id: 'integrity' as const, label: '2. Process Integrity', count: findings.filter(f => f.moduleId === 'integrity').length },
    { id: 'persistence' as const, label: '3. Persistence Hunter', count: findings.filter(f => f.moduleId === 'persistence').length },
    { id: 'rats' as const, label: '4. Known RATs', count: findings.filter(f => f.moduleId === 'rats').length },
    { id: 'all-findings' as const, label: `All Plain-Language Findings (${findings.length})` },
    { id: 'mobile-money' as const, label: '🛡️ Mobile Money Shield' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Navigation tabs header */}
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/70 p-1.5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {typeof (tab as any).count === 'number' && (tab as any).count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {(tab as any).count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        
        {/* TAB 1: NETWORK WATCH */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Module 1: Network Watch
                </h3>
                <p className="text-xs text-slate-400">
                  Core Question: <em>"Who is talking to the outside world?"</em> Inspecting active outbound TCP sockets for unfamiliar remote destinations or known C2 ports.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Total Sockets: {connections.length}
              </div>
            </div>

            {/* Sockets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Process / PID</th>
                    <th className="py-2.5 px-3">Local Endpoint</th>
                    <th className="py-2.5 px-3">Remote Destination</th>
                    <th className="py-2.5 px-3">Location / Org</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {connections.map((c) => {
                    const isRemediated = remediatedIds.has(c.id);
                    return (
                      <tr 
                        key={c.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          c.isSuspicious && !isRemediated ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-cyan-400">{c.processName}</span>
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1 py-0.5 rounded">
                              PID {c.pid}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {c.localAddress}:{c.localPort}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className={c.isSuspicious && !isRemediated ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {c.remoteAddress}:{c.remotePort}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-200">{c.remoteGeo || 'Unknown'}</div>
                          <div className="text-[11px] text-slate-400">{c.remoteOrg}</div>
                        </td>
                        <td className="py-3 px-3">
                          {isRemediated ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Severed / Blocked
                            </span>
                          ) : c.isSuspicious ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                              <AlertTriangle className="w-3.5 h-3.5" /> Flagged Outbound
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Normal ({c.state})</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {c.isSuspicious && !isRemediated && (
                            <button
                              onClick={() => onRemediate(c.id, `Socket ${c.processName} ➔ ${c.remoteAddress}`)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                            >
                              Sever Socket
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Analyst Translation Callouts for Network */}
            <div className="mt-4 space-y-2">
              {findings
                .filter(f => f.moduleId === 'network')
                .map(f => (
                  <div key={f.id} className="bg-slate-950 border-l-4 border-rose-500 p-3.5 rounded-r-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-300">{f.title}</span>
                      <span className="text-[11px] font-mono text-rose-400">+{f.riskPoints} pts</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1.5">{f.plainLanguageExplanation}</p>
                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-900/50 flex items-start gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mobile Money Impact: </strong>{f.mobileMoneyImpact}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROCESS INTEGRITY */}
        {activeTab === 'integrity' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  Module 2: Process Integrity
                </h3>
                <p className="text-xs text-slate-400">
                  Core Question: <em>"Is anything running from a suspicious place?"</em> Flagging processes launched from unusual folders (%TEMP%, Downloads) instead of standard directories.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Active Processes: {processes.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Process / PID</th>
                    <th className="py-2.5 px-3">Executable Path</th>
                    <th className="py-2.5 px-3">Signature / Publisher</th>
                    <th className="py-2.5 px-3">Location Category</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {processes.map((p) => {
                    const isRemediated = remediatedIds.has(p.id);
                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          p.inTempOrDownloads && !isRemediated ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-cyan-400">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1 py-0.5 rounded">
                              PID {p.pid}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{p.description}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] max-w-xs truncate text-slate-400" title={p.path}>
                          {p.path}
                        </td>
                        <td className="py-3 px-3">
                          {p.isSigned ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {p.signer || 'Valid Certificate'}
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Unsigned Binary
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isRemediated ? (
                            <span className="text-emerald-400 font-medium">Quarantined</span>
                          ) : p.inTempOrDownloads ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                              <FolderOpen className="w-3 h-3" /> Temp / Downloads Path
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Program Files / OS</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.inTempOrDownloads && !isRemediated && (
                            <button
                              onClick={() => onRemediate(p.id, `Process ${p.name}`)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                            >
                              Kill & Quarantine
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Analyst Callout */}
            <div className="mt-4 space-y-2">
              {findings
                .filter(f => f.moduleId === 'integrity')
                .map(f => (
                  <div key={f.id} className="bg-slate-950 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300">{f.title}</span>
                      <span className="text-[11px] font-mono text-amber-400">+{f.riskPoints} pts</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1.5">{f.plainLanguageExplanation}</p>
                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                      <strong>Analyst Note: </strong>{f.technicalDetails}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: PERSISTENCE HUNTER */}
        {activeTab === 'persistence' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  Module 3: Persistence Hunter
                </h3>
                <p className="text-xs text-slate-400">
                  Core Question: <em>"What launches automatically at startup?"</em> Inspecting Windows Registry Run keys (`HKCU\\...\\Run`) and Startup folder entries.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Auto-Starts Inspected: {persistenceEntries.length}
              </div>
            </div>

            <div className="space-y-3">
              {persistenceEntries.map((pers) => {
                const isRemediated = remediatedIds.has(pers.id);
                return (
                  <div 
                    key={pers.id}
                    className={`p-4 rounded-xl border transition-all ${
                      pers.isUnrecognized && !isRemediated
                        ? 'bg-rose-950/20 border-rose-800/80'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100 text-sm">{pers.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {pers.locationDisplay}
                        </span>
                      </div>
                      <div>
                        {isRemediated ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Registry Key Removed
                          </span>
                        ) : pers.isUnrecognized ? (
                          <button
                            onClick={() => onRemediate(pers.id, `Startup Key: ${pers.name}`)}
                            className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                          >
                            Delete Startup Hook
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Standard OS Auto-Run</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded font-mono text-xs text-slate-300 break-all border border-slate-800/80">
                      <code>{pers.command}</code>
                    </div>

                    {pers.isUnrecognized && !isRemediated && (
                      <p className="text-xs text-rose-300/90 mt-2 italic">
                        Warning: This entry guarantees the unauthorized process will wake up again after computer reboots, surviving quick logouts.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: KNOWN RATs */}
        {activeTab === 'rats' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <MonitorCheck className="w-5 h-5 text-purple-400" />
                  Module 4: Known Remote-Access Tools
                </h3>
                <p className="text-xs text-slate-400">
                  Core Question: <em>"Is a known remote-control program running?"</em> Cross-checking running binaries against commercial tools and covert remote shells.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Cataloged Signatures: {ratTools.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ratTools.map((rat) => {
                const isRemediated = remediatedIds.has(rat.id);
                const isCurrentlyActive = rat.isRunning && !isRemediated;
                return (
                  <div
                    key={rat.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrentlyActive
                        ? 'bg-rose-950/30 border-rose-700 shadow-md shadow-rose-950/40'
                        : 'bg-slate-950 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{rat.toolName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                            {rat.category}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">{rat.processName}</div>
                      </div>

                      <div>
                        {isRemediated ? (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terminated
                          </span>
                        ) : isCurrentlyActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white animate-pulse">
                            ACTIVE IN MEMORY
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">Inactive</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{rat.description}</p>

                    {isCurrentlyActive && (
                      <div className="flex items-center justify-between pt-2 border-t border-rose-900/60">
                        <span className="text-[11px] font-semibold text-rose-300">
                          Threat Weight: +{rat.riskPoints} pts
                        </span>
                        <button
                          onClick={() => onRemediate(rat.id, `Remote Tool ${rat.toolName}`)}
                          className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                        >
                          Terminate Tool
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: ALL PLAIN-LANGUAGE FINDINGS */}
        {activeTab === 'all-findings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Plain-Language Security Analyst Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Instead of cryptic log dumps, every indicator is translated into plain terms with its direct risk to personal data and mobile money.
                </p>
              </div>
              <div className="text-xs font-mono text-cyan-400">
                {findings.length} Unresolved Issues
              </div>
            </div>

            {findings.length === 0 ? (
              <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-200">System State Clean!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  All scan modules verified. No active unauthorized remote control software, unusual process directories, or persistence mechanisms detected.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {findings.map((f, index) => (
                  <div
                    key={f.id}
                    className={`rounded-xl border p-4 transition-all ${
                      f.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-700/80 shadow-md'
                        : f.severity === 'high'
                        ? 'bg-orange-950/20 border-orange-800/80'
                        : 'bg-amber-950/20 border-amber-800/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm">{f.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {f.moduleId.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          +{f.riskPoints} pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2 text-xs">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-cyan-400" />
                          Plain-Language Explanation
                        </div>
                        <p className="text-slate-200 leading-relaxed">{f.plainLanguageExplanation}</p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-amber-900/60">
                        <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-400" />
                          Mobile Money & Fraud Vulnerability
                        </div>
                        <p className="text-amber-200/90 leading-relaxed">{f.mobileMoneyImpact}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="text-slate-400">
                        <strong>Recommended Action: </strong>{f.recommendedAction}
                      </div>
                      {f.entityId && (
                        <button
                          onClick={() => onRemediate(f.entityId!, f.title)}
                          className="px-3 py-1 font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors text-xs self-end"
                        >
                          Remediate Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MOBILE MONEY SHIELD */}
        {activeTab === 'mobile-money' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Mobile Money Defense (Zimbabwe & Regional Focus)
              </h3>
              <p className="text-xs text-slate-400">
                PDF Section 2: Why silent remote access is the root cause of drained mobile wallets (EcoCash, OneMoney, Innbucks) and online banking fraud.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">Silent Screen Observation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Remote Access Tools (RATs) like silent AnyDesk or custom VNC relay the user's screen in real-time. When you enter a one-time PIN (OTP) or dial *151# on an Android emulator or web client, the attacker writes it down.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">Session Hijack & OTP Relay</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Even with 2-Factor Authentication, if the attacker has an active remote shell, they can wait until you complete 2FA login, then push transactions or copy browser session cookies while you are distracted.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">Break The Chain Early</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  System Trust Scanner checks the OS telemetry for these indicators before you open financial portals. Catching the remote-access stage early breaks the attack chain before money or data is ever lost.
                </p>
              </div>

            </div>

            {/* Checklist */}
            <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Emergency Action Checklist If Compromise Is Detected
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>Disconnect Wi-Fi / Ethernet immediately</strong>: Cut off the attacker's active socket command pipe.</li>
                <li><strong>Log out of active sessions from your phone</strong>: Use your mobile phone (on cellular data) to change your EcoCash / banking app PIN.</li>
                <li><strong>Inspect Startup Registry</strong>: Never leave unrecognized scripts in `%APPDATA%\\Local\\Temp`.</li>
                <li><strong>Run System Trust Scanner</strong> again to confirm your score returns to <strong>Low (0-20)</strong>.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
