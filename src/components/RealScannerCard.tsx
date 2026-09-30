import React, { useState, useRef } from 'react';
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
  ArrowRight,
  Monitor
} from 'lucide-react';
import { scanRealFile, auditRealDevice, RealFileScanResult, RealDeviceAuditResult, WINDOWS_NATIVE_SCANNER_BAT } from '../utils/realScanner';
import { soundFx } from '../utils/audio';

interface RealScannerCardProps {
  onScanComplete?: (res: RealFileScanResult) => void;
}

export const RealScannerCard: React.FC<RealScannerCardProps> = ({ onScanComplete }) => {
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [fileScanResult, setFileScanResult] = useState<RealFileScanResult | null>(null);
  const [deviceAudit, setDeviceAudit] = useState<RealDeviceAuditResult | null>(null);
  const [isAuditingDevice, setIsAuditingDevice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningFile(false);
    }
  };

  const handleRunDeviceAudit = async () => {
    setIsAuditingDevice(true);
    soundFx.playScanTick();
    try {
      const audit = await auditRealDevice();
      setDeviceAudit(audit);
      soundFx.playSuccess();
    } finally {
      setIsAuditingDevice(false);
    }
  };

  const handleDownloadBat = () => {
    const blob = new Blob([WINDOWS_NATIVE_SCANNER_BAT], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SystemTrustScanner.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. REAL FILE & APPLICATION VIRUS SCANNER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Real File & Program Virus Checker
              </h3>
              <p className="text-xs text-slate-400">
                Choose or drop any real file (.exe, .bat, .ps1, .pdf, .zip) from your device to scan for malware & RATs.
              </p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanningFile}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>{isScanningFile ? 'Analyzing File...' : 'Select File to Scan'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Drag & Drop Area */}
        {!fileScanResult && !isScanningFile && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40"
          >
            <HardDrive className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-300">Click to Select Any File on this Device</div>
            <div className="text-xs text-slate-500 mt-0.5">Scans actual cryptographic SHA-256 hash, executable code, and embedded RAT signatures</div>
          </div>
        )}

        {/* Real Scan Results */}
        {fileScanResult && (
          <div className={`p-5 rounded-2xl border transition-all ${
            fileScanResult.isSuspicious
              ? 'bg-rose-950/30 border-rose-600/80 text-rose-100'
              : 'bg-emerald-950/30 border-emerald-600/80 text-emerald-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2.5">
                {fileScanResult.isSuspicious ? (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white break-all">
                    {fileScanResult.fileName}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Size: {(fileScanResult.fileSize / 1024).toFixed(1)} KB • {fileScanResult.isExecutable ? 'Executable Binary' : 'Data File'}
                  </div>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                fileScanResult.isSuspicious
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {fileScanResult.threatTier} Risk ({fileScanResult.riskScore}/100)
              </span>
            </div>

            <p className="text-xs font-medium mb-3 opacity-95">
              {fileScanResult.verdict}
            </p>

            {/* SHA-256 Hash */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-400 break-all flex items-start gap-2 mb-3">
              <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>SHA-256: {fileScanResult.sha256}</span>
            </div>

            {/* Flags */}
            {fileScanResult.flags.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Indicators Found:</span>
                {fileScanResult.flags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg">
                    {flag.severity === 'critical' || flag.severity === 'high' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="text-white">{flag.rule}: </strong>
                      <span className="text-slate-300">{flag.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 2. REAL DEVICE & NETWORK LEAK AUDIT */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Real Device & Network Privacy Audit
              </h3>
              <p className="text-xs text-slate-400">
                Tests your actual live connection for WebRTC IP leaks, screen capture permissions, and hardware profile.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunDeviceAudit}
            disabled={isAuditingDevice}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className={`w-4 h-4 ${isAuditingDevice ? 'animate-spin' : ''}`} />
            <span>{isAuditingDevice ? 'Auditing Device...' : 'Run Live Device Audit'}</span>
          </button>
        </div>

        {deviceAudit && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">WebRTC Network Leak</span>
              <span className={`font-bold flex items-center gap-1.5 ${
                deviceAudit.webrtcLeakDetected ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {deviceAudit.webrtcLeakDetected ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    IP Exposed ({deviceAudit.localIpsFound.join(', ')})
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Zero IP Leaks
                  </>
                )}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">Screen Viewing Permission</span>
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {deviceAudit.screenCapturePerm === 'granted' ? 'Active / Granted' : 'Protected (Prompt Required)'}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">Device Hardware</span>
              <span className="font-bold text-slate-200">
                {deviceAudit.platform} ({deviceAudit.hardwareConcurrency} CPU cores)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. WINDOWS NATIVE 1-CLICK SYSTEM AUDIT SCRIPT */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-800/60 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Windows OS Deep Scan</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                Real OS Inspection
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Scan Windows Registry & Active Sockets for Real
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Because browsers are sandboxed from reading your private Windows Registry, download our <strong>1-click native scanner script</strong>. It runs real <code>netstat</code> and <code>reg query</code> commands on your Windows PC and outputs your real audit!
            </p>
          </div>

          <button
            onClick={handleDownloadBat}
            className="px-5 py-3 rounded-2xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download Windows Scanner (.bat)</span>
          </button>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Double-click <strong>SystemTrustScanner.bat</strong> on your Windows laptop ➔ Saves audit to your Desktop!</span>
        </div>
      </div>

    </div>
  );
};
