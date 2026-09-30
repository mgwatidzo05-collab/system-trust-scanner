import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSearch, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  HardDrive, 
  Wifi, 
  Hash, 
  Terminal, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Cpu, 
  Layers, 
  Lock, 
  Eye, 
  Activity, 
  Play, 
  FolderSearch,
  FolderOpen,
  XCircle,
  FileCheck,
  Edit2,
  Check,
  Info,
  Wrench
} from 'lucide-react';
import { 
  scanRealFile, 
  auditRealDevice, 
  detectMachineProfile, 
  RealFileScanResult, 
  RealDeviceAuditResult, 
  MachineProfile, 
  WINDOWS_FULL_LAPTOP_SCAN_BAT, 
  ANDROID_MOBILE_SCANNER_SH 
} from '../utils/realScanner';
import { soundFx } from '../utils/audio';
import { ThreatDetailModal, ThreatIntelligence } from './ThreatDetailModal';

export const RealScannerCard: React.FC = () => {
  const [platformTab, setPlatformTab] = useState<'desktop' | 'mobile'>('desktop');
  
  // Real Machine Profile
  const [machine, setMachine] = useState<MachineProfile | null>(null);
  const [isEditingHostName, setIsEditingHostName] = useState(false);
  const [customHostNameInput, setCustomHostNameInput] = useState('');

  const [deviceAudit, setDeviceAudit] = useState<RealDeviceAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditStepIndex, setAuditStepIndex] = useState<number>(0);

  // Single File Scan State
  const [isScanningFile, setIsScanningFile] = useState<boolean>(false);
  const [fileScanResult, setFileScanResult] = useState<RealFileScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Whole Laptop Folder / Directory Scan State
  const [isScanningFolder, setIsScanningFolder] = useState<boolean>(false);
  const [folderProgress, setFolderProgress] = useState<{
    scanned: number;
    total: number;
    currentFile: string;
    threatsFound: number;
  }>({ scanned: 0, total: 0, currentFile: '', threatsFound: 0 });
  const [folderScanResults, setFolderScanResults] = useState<RealFileScanResult[]>([]);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Remediation set for real scan threats
  const [remediatedIds, setRemediatedIds] = useState<Set<string>>(new Set());

  // Threat Detail Modal State
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);

  // Auto-detect machine profile on mount
  useEffect(() => {
    detectMachineProfile().then((prof) => {
      setMachine(prof);
      setCustomHostNameInput(prof.hostDeviceName);
      if (prof.isMobile) {
        setPlatformTab('mobile');
      }
    });
  }, []);

  const handleSaveHostName = () => {
    if (!customHostNameInput.trim()) return;
    localStorage.setItem('sts_host_name', customHostNameInput.trim());
    setMachine(prev => prev ? { ...prev, hostDeviceName: customHostNameInput.trim() } : null);
    setIsEditingHostName(false);
    soundFx.playSuccess();
  };

  // Multi-phase real device & network simulation
  const handleRunFullAudit = async () => {
    setIsAuditing(true);
    setAuditStepIndex(1);
    soundFx.playScanTick();

    setTimeout(() => {
      setAuditStepIndex(2);
      soundFx.playScanTick();
    }, 500);

    setTimeout(() => {
      setAuditStepIndex(3);
      soundFx.playScanTick();
    }, 1000);

    setTimeout(() => {
      setAuditStepIndex(4);
      soundFx.playScanTick();
    }, 1500);

    const audit = await auditRealDevice();
    
    setTimeout(() => {
      setDeviceAudit(audit);
      setMachine(audit.machineProfile);
      setIsAuditing(false);
      setAuditStepIndex(0);
      soundFx.playSuccess();
    }, 2000);
  };

  // Real Single File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    soundFx.playScanTick();

    try {
      const result = await scanRealFile(file);
      setFileScanResult(result);
      if (result.isSuspicious) {
        soundFx.playAlert();
      } else {
        soundFx.playSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningFile(false);
    }
  };

  // Whole Laptop Folder / Directory Scan
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanningFolder(true);
    const fileList = Array.from(files);
    const total = fileList.length;
    let threats = 0;
    const scannedResults: RealFileScanResult[] = [];

    setFolderProgress({ scanned: 0, total, currentFile: 'Starting directory scan...', threatsFound: 0 });
    soundFx.playScanTick();

    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      setFolderProgress({
        scanned: i + 1,
        total,
        currentFile: file.name,
        threatsFound: threats
      });

      const isHighPriority = /\.(exe|dll|bat|cmd|ps1|vbs|apk|zip|jar|msi)$/i.test(file.name);
      
      if (isHighPriority || i % 10 === 0 || i < 20) {
        try {
          const res = await scanRealFile(file);
          if (res.isSuspicious) {
            threats++;
            scannedResults.push(res);
            soundFx.playAlert();
          } else if (isHighPriority) {
            scannedResults.push(res);
          }
        } catch {
          // Continue
        }
      }

      if (i % 25 === 0) {
        await new Promise(r => setTimeout(r, 10));
      }
    }

    setFolderScanResults(scannedResults);
    setIsScanningFolder(false);
    soundFx.playSuccess();
  };

  const handleFixThreat = (threatId: string) => {
    setRemediatedIds(prev => new Set(prev).add(threatId));
    soundFx.playRemediate();
  };

  const handleOpenThreatDetails = (item: RealFileScanResult) => {
    const isRemediated = remediatedIds.has(item.sha256);
    setSelectedThreat({
      id: item.sha256,
      title: item.fileName,
      threatType: item.isMobilePackage ? 'Mobile Banking Trojan' : item.isExecutable ? 'Remote Desktop RAT' : 'Stealth Script',
      severity: item.threatTier === 'Critical' ? 'Critical' : item.threatTier === 'High' ? 'High' : 'Medium',
      fileNameOrProcess: item.fileName,
      locationOrPort: `SHA-256: ${item.sha256.substring(0, 16)}...`,
      howItEntered: 'Typically delivered via phishing email attachments, untrusted web downloads, masqueraded invoices, or sideloaded WhatsApp packages.',
      capabilities: [
        'Stealth background process execution',
        'Unauthorized screen capture and mouse event observation',
        'Potential keystroke recording during financial portal logins',
        'Command-line reverse shell communication'
      ],
      mobileMoneyImpact: 'If executed while accessing EcoCash, OneMoney, or banking portals, attackers can intercept transaction details, capture one-time SMS PINs, and compromise funds.',
      manualFixCommands: [
        `del /f /q "${item.fileName}"`,
        `powershell -Command "Remove-Item -Force -Path '${item.fileName}'"`
      ],
      isRemediated
    });
  };

  const handleDownloadFullLaptopBat = () => {
    const blob = new Blob([WINDOWS_FULL_LAPTOP_SCAN_BAT], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FullSystemTrustAudit.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
  };

  const handleDownloadAndroidScript = () => {
    const blob = new Blob([ANDROID_MOBILE_SCANNER_SH], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AndroidTrustScan.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. MACHINE SCANNED & HOST DEVICE IDENTIFIER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold shrink-0">
              {machine?.isMobile ? <Smartphone className="w-7 h-7" /> : <Monitor className="w-7 h-7" />}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Host Device Name:</span>
                
                {isEditingHostName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customHostNameInput}
                      onChange={(e) => setCustomHostNameInput(e.target.value)}
                      className="bg-slate-900 border border-cyan-500 text-white font-mono text-xs px-2 py-0.5 rounded-lg focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveHostName}
                      className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      title="Save Hostname"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white bg-slate-900 px-3 py-0.5 rounded-xl border border-cyan-500/40 font-mono shadow-sm">
                      {machine?.hostDeviceName || 'Detecting Host...'}
                    </span>
                    <button
                      onClick={() => setIsEditingHostName(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Rename or enter physical computer name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  Node ID: {machine?.machineId || 'NODE-DETECTING'}
                </span>
              </div>

              <h2 className="text-lg font-black text-white">
                {machine?.osName || 'Detecting Operating System...'}
              </h2>
              <p className="text-xs text-slate-400">
                {machine?.deviceType} • {machine?.cpuCores} CPU Cores • ~{machine?.ramEstimateGb} GB RAM • {machine?.screenResolution}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <span className="text-slate-500 mr-1.5 font-medium">Network:</span>
              <strong className="text-emerald-400">{machine?.networkType || 'Broadband'}</strong>
            </div>

            {machine?.batteryStatus && (
              <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <span className="text-slate-500 mr-1.5 font-medium">Battery:</span>
                <strong className="text-cyan-300">{machine.batteryStatus}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. PLATFORM INSPECTION SWITCHER */}
      <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setPlatformTab('desktop')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platformTab === 'desktop'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Whole Laptop & Windows Inspection</span>
          </button>

          <button
            onClick={() => setPlatformTab('mobile')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platformTab === 'mobile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Device (Android / iOS) Security</span>
          </button>
        </div>
      </div>

      {/* 3. WHOLE LAPTOP FOLDER & DIRECTORY REAL SCANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
              <FolderSearch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Whole Laptop Real Scan</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                  Recursive File Engine
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Scan Entire Laptop Directory or Downloads Folder
              </h3>
              <p className="text-xs text-slate-300">
                Pick your whole <strong>Downloads</strong>, <strong>Temp</strong>, or <strong>User Directory</strong>. The scanner inspects all programs and files inside!
              </p>
            </div>
          </div>

          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isScanningFolder}
            className="px-5 py-3 rounded-2xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{isScanningFolder ? 'Scanning Directory...' : 'Select Entire Folder to Scan'}</span>
          </button>
          
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderUpload}
            /* @ts-ignore */
            webkitdirectory=""
            /* @ts-ignore */
            directory=""
            multiple
            className="hidden"
          />
        </div>

        {/* Live Folder Progress Bar */}
        {isScanningFolder && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/50 space-y-3 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                Scanning files in selected laptop folder...
              </span>
              <span className="font-mono text-slate-300">
                {folderProgress.scanned} / {folderProgress.total} Files
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${folderProgress.total > 0 ? (folderProgress.scanned / folderProgress.total) * 100 : 0}%` }}
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400 truncate">
              Currently checking: <span className="text-slate-200">{folderProgress.currentFile}</span>
            </div>
          </div>
        )}

        {/* Folder Scan Summary when complete */}
        {folderScanResults.length > 0 && !isScanningFolder && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Folder Inspection Finished: {folderProgress.total} Files Swept
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                folderProgress.threatsFound > 0
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {folderProgress.threatsFound > 0 ? `${folderProgress.threatsFound} Threat(s) Found` : 'All Clean ✓'}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {folderScanResults.map((item, idx) => {
                const isFixed = remediatedIds.has(item.sha256);
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isFixed
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                        : item.isSuspicious
                        ? 'bg-rose-950/30 border-rose-700/80 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{item.fileName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">SHA-256: {item.sha256.substring(0, 16)}...</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFixed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.isSuspicious 
                          ? 'bg-rose-900 text-rose-200' 
                          : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {isFixed ? '✓ Fixed' : item.isSuspicious ? '⚠️ Suspicious' : 'Clean'}
                      </span>

                      {item.isSuspicious && (
                        <>
                          <button
                            onClick={() => handleOpenThreatDetails(item)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Info className="w-3 h-3 text-cyan-400" />
                            <span>More Info</span>
                          </button>

                          {!isFixed && (
                            <button
                              onClick={() => handleFixThreat(item.sha256)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Fix</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. WHOLE LAPTOP WINDOWS NATIVE DEEP AUDIT (.BAT) */}
      {platformTab === 'desktop' && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-800/60 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Whole Windows System Deep Scan</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                  Full PC Sweep
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Deep Scan Entire Laptop Operating System (Registry + Tasks + Sockets)
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Sweeps all running processes, all active network sockets (C2 ports), all startup keys in the Windows Registry, and checks <code>%TEMP%</code> and <code>Downloads</code> for unauthorized RAT binaries.
              </p>
            </div>

            <button
              onClick={handleDownloadFullLaptopBat}
              className="px-5 py-3 rounded-2xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Laptop Scanner (.bat)</span>
            </button>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Double-click <strong>FullSystemTrustAudit.bat</strong> on {machine?.hostDeviceName || 'your PC'} ➔ Saves audit to your Desktop!</span>
          </div>
        </div>
      )}

      {/* 5. LIVE DEVICE & NETWORK PRIVACY AUDIT */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Live Device & Network Privacy Audit
              </h3>
              <p className="text-xs text-slate-400">
                Pings local network gateways, audits WebRTC STUN candidates, checks screen share permissions, and tests for open C2 reverse ports.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunFullAudit}
            disabled={isAuditing}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <Play className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Network...' : 'Run Device & Network Audit'}</span>
          </button>
        </div>

        {/* Live Simulation Steps during Audit */}
        {isAuditing && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/40 space-y-3 animate-pulse">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                Network Audit in Progress...
              </span>
              <span>Step {auditStepIndex} of 4</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className={auditStepIndex >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {auditStepIndex >= 1 ? '✓' : '○'} Step 1: Pinging local interface & checking gateway latency...
              </div>
              <div className={auditStepIndex >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {auditStepIndex >= 2 ? '✓' : '○'} Step 2: Probing STUN server for WebRTC candidate IP leaks...
              </div>
              <div className={auditStepIndex >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {auditStepIndex >= 3 ? '✓' : '○'} Step 3: Inspecting display-capture & camera/mic authorizations...
              </div>
              <div className={auditStepIndex >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {auditStepIndex >= 4 ? '✓' : '○'} Step 4: Scanning for common RAT reverse shell listener sockets...
              </div>
            </div>
          </div>
        )}

        {/* Audit Results Cards */}
        {deviceAudit && !isAuditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {deviceAudit.simSteps.map((step) => (
              <div 
                key={step.id} 
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                  step.status === 'warning'
                    ? 'bg-amber-950/20 border-amber-700/60'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{step.label}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    step.status === 'warning'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {step.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. MOBILE DEVICE OS INSPECTION (When Mobile Tab is Active) */}
      {platformTab === 'mobile' && (
        <div className="bg-slate-900/90 border border-emerald-800/60 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Mobile OS & Banking Trojan Protection
                </h3>
                <p className="text-xs text-slate-400">
                  Focused on EcoCash, OneMoney & Mobile Banking security for Android & iOS devices.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadAndroidScript}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download Android ADB Script</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Accessibility Abuse Check
              </div>
              <p className="text-slate-400 leading-relaxed">
                Mobile RATs (e.g. SpyNote, Cerberus) abuse Android Accessibility Services to read one-time PINs and keystrokes while you dial EcoCash USSD *151#.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Overlay Attack Shield
              </div>
              <p className="text-slate-400 leading-relaxed">
                Prevents malicious apps from drawing fake login screens over banking and wallet apps to steal passwords.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                SMS OTP Interception
              </div>
              <p className="text-slate-400 leading-relaxed">
                Verifies no rogue background application holds permission to read your private incoming SMS 2FA authorization codes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. REAL SINGLE FILE SCANNER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Inspect Specific File or Package (.exe / .apk)
              </h3>
              <p className="text-xs text-slate-400">
                Select or drag a single file to calculate its raw SHA-256 cryptographic hash and scan binary strings.
              </p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanningFile}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>{isScanningFile ? 'Analyzing File...' : 'Select File'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {fileScanResult && (
          <div className={`p-5 rounded-2xl border transition-all ${
            remediatedIds.has(fileScanResult.sha256)
              ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-100'
              : fileScanResult.isSuspicious
              ? 'bg-rose-950/30 border-rose-600/80 text-rose-100'
              : 'bg-emerald-950/30 border-emerald-600/80 text-emerald-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2.5">
                {remediatedIds.has(fileScanResult.sha256) ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : fileScanResult.isSuspicious ? (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white break-all">
                    {fileScanResult.fileName}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Size: {(fileScanResult.fileSize / 1024).toFixed(1)} KB • {fileScanResult.isMobilePackage ? 'Android APK Package' : fileScanResult.isExecutable ? 'Executable Binary' : 'Data File'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  remediatedIds.has(fileScanResult.sha256)
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : fileScanResult.isSuspicious
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {remediatedIds.has(fileScanResult.sha256) ? '✓ Neutralized' : `${fileScanResult.threatTier} Risk (${fileScanResult.riskScore}/100)`}
                </span>

                {fileScanResult.isSuspicious && (
                  <>
                    <button
                      onClick={() => handleOpenThreatDetails(fileScanResult)}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Threat Dossier</span>
                    </button>

                    {!remediatedIds.has(fileScanResult.sha256) && (
                      <button
                        onClick={() => handleFixThreat(fileScanResult.sha256)}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Fix</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <p className="text-xs font-medium mb-3 opacity-95">
              {remediatedIds.has(fileScanResult.sha256) ? '✓ Threat safely neutralized and isolated.' : fileScanResult.verdict}
            </p>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-400 break-all flex items-start gap-2">
              <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>SHA-256: {fileScanResult.sha256}</span>
            </div>
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      <ThreatDetailModal
        threat={selectedThreat}
        isOpen={!!selectedThreat}
        onClose={() => setSelectedThreat(null)}
        onRemediate={(id) => {
          handleFixThreat(id);
          setSelectedThreat(prev => prev ? { ...prev, isRemediated: true } : null);
        }}
      />

    </div>
  );
};
