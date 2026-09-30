import React, { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  FolderMinus, 
  Power, 
  Eye, 
  Sparkles, 
  Wrench, 
  RotateCw,
  Lock,
  FileCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Play,
  Activity,
  Layers,
  HardDrive,
  DownloadCloud,
  FileSearch
} from 'lucide-react';

import { SCENARIOS } from './data/scenarios';
import { evaluateSystem } from './utils/scorer';
import { soundFx } from './utils/audio';
import { PythonScriptModal } from './components/PythonScriptModal';
import { ReportModal } from './components/ReportModal';
import { RealScannerCard } from './components/RealScannerCard';

export default function App() {
  // Mode: 'real' (scans real local files/device) or 'demo' (preset simulation)
  const [appMode, setAppMode] = useState<'real' | 'demo'>('real');
  
  // Demo state
  const [scenarioId, setScenarioId] = useState<'clean-laptop' | 'active-rat-attack'>('active-rat-attack');
  const [remediatedIds, setRemediatedIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentScanningStep, setCurrentScanningStep] = useState<number>(0);
  const [scanningMessage, setScanningMessage] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged' | 'safe'>('all');

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  // Modals for technical inspection
  const [pythonModalOpen, setPythonModalOpen] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Capture PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("To install this application on Windows or Mac, click the 'Install' icon in your browser address bar (top-right in Chrome/Edge) or select 'Add to Home Screen' on mobile.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const activeScenario = scenarioId === 'clean-laptop' ? SCENARIOS[0] : SCENARIOS[1];

  const evaluation = useMemo(() => {
    return evaluateSystem(
      activeScenario.processes,
      activeScenario.connections,
      activeScenario.persistenceEntries,
      activeScenario.ratTools,
      remediatedIds
    );
  }, [activeScenario, remediatedIds]);

  const isSafe = evaluation.tier === 'Low';

  // Build the unified list of tested items for simulation
  const testedItems = useMemo(() => {
    const list: Array<{
      id: string;
      category: 'Remote Screen Tool' | 'Internet Connection' | 'Hidden Program' | 'Startup Key';
      name: string;
      detail: string;
      isSuspicious: boolean;
      statusText: string;
      icon: typeof Wifi;
    }> = [];

    activeScenario.ratTools.forEach((rat) => {
      const isFixed = remediatedIds.has(rat.id);
      const isFlagged = rat.isRunning && !isFixed;
      list.push({
        id: rat.id,
        category: 'Remote Screen Tool',
        name: rat.toolName,
        detail: isFlagged 
          ? 'Active in memory! May be streaming your screen to an outside operator.'
          : isFixed
          ? 'Tool closed and stopped safely.'
          : 'Verified dormant (not running in memory).',
        isSuspicious: isFlagged,
        statusText: isFlagged ? 'Active Screen Watcher' : 'Safe / Clean',
        icon: Eye
      });
    });

    activeScenario.connections.forEach((conn) => {
      const isFixed = remediatedIds.has(conn.id);
      const isFlagged = conn.isSuspicious && !isFixed;
      list.push({
        id: conn.id,
        category: 'Internet Connection',
        name: `${conn.processName} ➔ ${conn.remoteAddress}`,
        detail: isFlagged
          ? `Connected to unauthorized destination (${conn.remoteGeo || 'Unknown Location'}) on port ${conn.remotePort}.`
          : `Connected to verified server (${conn.remoteGeo || 'Verified Cloud'}). Normal activity.`,
        isSuspicious: isFlagged,
        statusText: isFlagged ? 'Suspicious Outside Link' : 'Safe Connection',
        icon: Wifi
      });
    });

    activeScenario.processes.forEach((proc) => {
      const isFixed = remediatedIds.has(proc.id);
      const isFlagged = proc.inTempOrDownloads && !isFixed;
      list.push({
        id: proc.id,
        category: 'Hidden Program',
        name: proc.name,
        detail: isFlagged
          ? `Hiding in temporary directory: ${proc.path}. Unsigned binary.`
          : `Legitimate software running from ${proc.path}.`,
        isSuspicious: isFlagged,
        statusText: isFlagged ? 'Hiding in Temp Folder' : 'Normal Program',
        icon: FolderMinus
      });
    });

    activeScenario.persistenceEntries.forEach((pers) => {
      const isFixed = remediatedIds.has(pers.id);
      const isFlagged = pers.isUnrecognized && !isFixed;
      list.push({
        id: pers.id,
        category: 'Startup Key',
        name: pers.name,
        detail: isFlagged
          ? `Configured to quietly start every time the computer boots: ${pers.command}`
          : 'Standard operating system background service.',
        isSuspicious: isFlagged,
        statusText: isFlagged ? 'Sneaky Auto-Start' : 'Verified Auto-Start',
        icon: Power
      });
    });

    return list;
  }, [activeScenario, remediatedIds]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'flagged') {
      return testedItems.filter(item => item.isSuspicious);
    }
    if (activeFilter === 'safe') {
      return testedItems.filter(item => !item.isSuspicious);
    }
    return testedItems;
  }, [testedItems, activeFilter]);

  // Live Scan Simulation
  const handleRunSimulation = useCallback(() => {
    setIsScanning(true);
    setCurrentScanningStep(1);
    soundFx.playScanTick();
    setScanningMessage('Step 1/4: Inspecting active internet connections talking outside...');

    setTimeout(() => {
      setCurrentScanningStep(2);
      soundFx.playScanTick();
      setScanningMessage('Step 2/4: Scanning temporary & downloads folders for stealth files...');
    }, 600);

    setTimeout(() => {
      setCurrentScanningStep(3);
      soundFx.playScanTick();
      setScanningMessage('Step 3/4: Checking startup keys to see what launches on boot...');
    }, 1200);

    setTimeout(() => {
      setCurrentScanningStep(4);
      soundFx.playScanTick();
      setScanningMessage('Step 4/4: Cross-referencing AnyDesk, TeamViewer & remote control apps...');
    }, 1800);

    setTimeout(() => {
      setIsScanning(false);
      setCurrentScanningStep(0);
      setScanningMessage('');

      if (isSafe) {
        soundFx.playSuccess();
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {}
      } else {
        soundFx.playAlert();
      }
    }, 2400);
  }, [isSafe]);

  const handleFixAll = () => {
    const allIds = new Set<string>();
    activeScenario.processes.filter(p => p.inTempOrDownloads).forEach(p => allIds.add(p.id));
    activeScenario.connections.filter(c => c.isSuspicious).forEach(c => allIds.add(c.id));
    activeScenario.persistenceEntries.filter(p => p.isUnrecognized).forEach(p => allIds.add(p.id));
    activeScenario.ratTools.filter(r => r.isRunning).forEach(r => allIds.add(r.id));

    setRemediatedIds(allIds);
    soundFx.playRemediate();

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch {}
  };

  const handleFixSingle = (id: string) => {
    setRemediatedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    soundFx.playRemediate();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* 1. TOP HEADER & PWA INSTALL BAR */}
      <header className="px-6 py-4 max-w-4xl w-full mx-auto flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">System Trust Scanner</h1>
            <p className="text-[11px] text-slate-400">Installable Compromise & Virus Detector</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-full flex items-center text-xs">
            <button
              onClick={() => setAppMode('real')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                appMode === 'real'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Real Scanner
            </button>
            <button
              onClick={() => setAppMode('demo')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                appMode === 'demo'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Simulation
            </button>
          </div>

          {/* Install Application Button */}
          <button
            onClick={handleInstallApp}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
            title="Install as native desktop or mobile application"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="max-w-3xl w-full mx-auto px-6 py-6 flex-1 space-y-6">
        
        {/* MODE 1: REAL SCANNER (Actual real file scanning, device audit & native Windows scanner) */}
        {appMode === 'real' && (
          <RealScannerCard />
        )}

        {/* MODE 2: DEMO SIMULATION (The 4 modules simulation for NUST judges) */}
        {appMode === 'demo' && (
          <div className="space-y-6">
            
            {/* Demo Switcher Pill */}
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Select Simulation Scenario:</span>
              <div className="bg-slate-950 p-1 rounded-full border border-slate-800 flex items-center text-xs">
                <button
                  onClick={() => { setScenarioId('clean-laptop'); setRemediatedIds(new Set()); }}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    scenarioId === 'clean-laptop' && remediatedIds.size === 0
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Safe PC
                </button>
                <button
                  onClick={() => { setScenarioId('active-rat-attack'); setRemediatedIds(new Set()); }}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    scenarioId === 'active-rat-attack' && !isSafe
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔴 Infected PC
                </button>
              </div>
            </div>

            {/* LIVE SCANNING ANIMATION BANNER */}
            {isScanning && (
              <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/80 rounded-3xl p-5 text-center shadow-xl animate-pulse">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
                  <h2 className="text-base font-bold text-white">Live Inspection in Progress...</h2>
                </div>
                <p className="text-xs text-cyan-200 font-medium">{scanningMessage}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${(currentScanningStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* HERO STATUS CARD */}
            <div className={`p-7 sm:p-8 rounded-3xl border-2 text-center transition-all shadow-xl relative overflow-hidden ${
              isSafe 
                ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/60 border-emerald-500/60 shadow-emerald-950/20' 
                : 'bg-gradient-to-b from-rose-950/50 to-slate-900/60 border-rose-500 shadow-rose-950/30'
            }`}>
              
              <div className="relative mb-4 flex justify-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${
                  isSafe 
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
                    : 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                }`}>
                  {isSafe ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {isSafe ? "Your Computer is Safe & Clean" : "Action Needed: Threat Detected"}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed mb-5">
                {isSafe 
                  ? "All tests passed. No unauthorized screen viewers, hidden programs, or outside connections are present."
                  : "An unauthorized remote program was found running. Someone outside may be able to see your screen or steal PINs."
                }
              </p>

              {!isSafe && (
                <div className="bg-rose-950/80 border border-rose-500/40 rounded-2xl p-3.5 mb-5 text-left max-w-md mx-auto text-xs text-rose-200 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white font-bold">Mobile Money Warning:</strong>
                    Do NOT enter bank passwords or EcoCash PINs until you click the button below.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!isSafe ? (
                  <button
                    onClick={handleFixAll}
                    className="w-full sm:w-auto px-7 py-3 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4 text-slate-950" />
                    <span>Fix Everything For Me (One Click)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRunSimulation}
                    disabled={isScanning}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? "Simulating scan..." : "Run Live Scan Simulation"}</span>
                  </button>
                )}

                {!isSafe && (
                  <button
                    onClick={handleRunSimulation}
                    disabled={isScanning}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Re-Check</span>
                  </button>
                )}
              </div>

            </div>

            {/* LIST OF THINGS BEING TESTED IN SIMULATION */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Inspected System Items ({testedItems.length} items)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live inspection breakdown of sockets, processes, auto-runs, and RAT signatures.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({testedItems.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('flagged')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeFilter === 'flagged' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    Flagged ({testedItems.filter(i => i.isSuspicious).length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('safe')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeFilter === 'safe' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    Safe ({testedItems.filter(i => !i.isSuspicious).length})
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isSuspicious
                          ? 'bg-rose-950/20 border-rose-700/60'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          item.isSuspicious ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-emerald-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.name}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 shrink-0">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                          item.isSuspicious
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {item.isSuspicious ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          <span>{item.statusText}</span>
                        </span>

                        {item.isSuspicious && (
                          <button
                            onClick={() => handleFixSingle(item.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                          >
                            Fix
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* 3. FOOTER */}
      <footer className="px-6 py-4 max-w-4xl w-full mx-auto border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span>Mode: </span>
          <strong className="text-slate-200">
            {appMode === 'real' ? 'Real Device Inspection' : `Simulation (${evaluation.trustScore}% Trust)`}
          </strong>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setPythonModalOpen(true)}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Python Script</span>
          </button>
          <span>•</span>
          <button 
            onClick={() => setReportModalOpen(true)}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full Audit Report</span>
          </button>
        </div>
      </footer>

      {/* Python Script Modal */}
      <PythonScriptModal
        isOpen={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        evaluation={evaluation}
        scenario={activeScenario}
      />

    </div>
  );
}
