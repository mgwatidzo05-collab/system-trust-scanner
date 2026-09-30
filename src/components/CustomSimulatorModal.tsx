import React, { useState } from 'react';
import { X, Plus, Trash2, Cpu, Globe, KeyRound, MonitorCheck, Sparkles } from 'lucide-react';
import { ProcessItem, NetworkConnection, PersistenceEntry, RatItem } from '../types';

interface CustomSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustom: (
    processes: ProcessItem[],
    connections: NetworkConnection[],
    persistence: PersistenceEntry[],
    rats: RatItem[]
  ) => void;
}

export const CustomSimulatorModal: React.FC<CustomSimulatorModalProps> = ({
  isOpen,
  onClose,
  onApplyCustom
}) => {
  const [procName, setProcName] = useState('payload_rat.exe');
  const [procPath, setProcPath] = useState('C:\\Users\\Student\\AppData\\Local\\Temp\\payload_rat.exe');
  const [inTemp, setInTemp] = useState(true);
  const [remoteIp, setRemoteIp] = useState('198.51.100.88');
  const [remotePort, setRemotePort] = useState(4444);
  const [hasOutbound, setHasOutbound] = useState(true);
  const [regKeyName, setRegKeyName] = useState('WindowsUpdateHelper');
  const [hasPersistence, setHasPersistence] = useState(true);
  const [hasKnownRat, setHasKnownRat] = useState(true);
  const [ratChoice, setRatChoice] = useState('AnyDesk Remote Desktop');

  if (!isOpen) return null;

  const handleApply = () => {
    const pid = Math.floor(Math.random() * 5000 + 2000);
    const customProcesses: ProcessItem[] = [
      {
        id: `custom-p-${Date.now()}`,
        pid,
        name: procName,
        path: procPath,
        isSigned: false,
        inTempOrDownloads: inTemp,
        cpu: 1.8,
        memoryMb: 64,
        description: 'Simulated custom adversary binary'
      },
      {
        id: 'p-chrome-clean',
        pid: 3204,
        name: 'chrome.exe',
        path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        isSigned: true,
        signer: 'Google LLC',
        inTempOrDownloads: false,
        cpu: 1.5,
        memoryMb: 350,
        description: 'Google Chrome Web Browser'
      }
    ];

    const customConnections: NetworkConnection[] = [];
    if (hasOutbound) {
      customConnections.push({
        id: `custom-c-${Date.now()}`,
        pid,
        processName: procName,
        localAddress: '192.168.1.105',
        localPort: 52140,
        remoteAddress: remoteIp,
        remotePort,
        protocol: 'TCP',
        state: 'ESTABLISHED',
        remoteGeo: 'External VPS / Dynamic DNS',
        remoteOrg: 'Untrusted Hosting Provider',
        isSuspicious: true,
        suspiciousReason: `Custom outbound socket to ${remoteIp}:${remotePort}`
      });
    }

    const customPersistence: PersistenceEntry[] = [];
    if (hasPersistence) {
      customPersistence.push({
        id: `custom-pers-${Date.now()}`,
        name: regKeyName,
        command: `"${procPath}" --silent`,
        locationType: 'HKCU_RUN',
        locationDisplay: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        isUnrecognized: true,
        linkedProcessName: procName,
        riskWeight: 20
      });
    }

    const customRats: RatItem[] = [
      {
        id: 'rat-custom-sim',
        toolName: ratChoice,
        processName: ratChoice.includes('AnyDesk') ? 'AnyDesk.exe' : 'ultraviewer.exe',
        pid: hasKnownRat ? pid + 10 : undefined,
        isRunning: hasKnownRat,
        category: 'Commercial Support',
        description: 'Remote access software evaluated against heuristic catalog',
        riskPoints: 20,
        authorizedByUser: false
      }
    ];

    onApplyCustom(customProcesses, customConnections, customPersistence, customRats);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Adversary Threat Simulator</h3>
              <p className="text-xs text-slate-400">Inject custom processes, sockets, and auto-starts to test detection logic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[75vh]">
          
          {/* Process Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Cpu className="w-4 h-4 text-cyan-400" />
              1. Simulated Binary / Process
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Process Executable Name</label>
              <input
                type="text"
                value={procName}
                onChange={(e) => setProcName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Execution Path</label>
              <input
                type="text"
                value={procPath}
                onChange={(e) => setProcPath(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-[11px]"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={inTemp}
                onChange={(e) => setInTemp(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="text-amber-300 font-medium">Flag as execution from Temp/Downloads folder (Module 2)</span>
            </label>
          </div>

          {/* Network Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Globe className="w-4 h-4 text-cyan-400" />
              2. Outbound C2 Socket (Module 1)
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOutbound}
                onChange={(e) => setHasOutbound(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="font-semibold text-slate-200">Establish Active Outbound Connection</span>
            </label>
            {hasOutbound && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1">Remote IP</label>
                  <input
                    type="text"
                    value={remoteIp}
                    onChange={(e) => setRemoteIp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Remote Port (e.g. 4444, 1337)</label>
                  <input
                    type="number"
                    value={remotePort}
                    onChange={(e) => setRemotePort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Persistence Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              3. Startup Auto-Run Key (Module 3)
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPersistence}
                onChange={(e) => setHasPersistence(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="font-semibold text-slate-200">Install HKCU Registry Run Key</span>
            </label>
            {hasPersistence && (
              <div>
                <label className="block text-slate-400 mb-1">Registry Value Name</label>
                <input
                  type="text"
                  value={regKeyName}
                  onChange={(e) => setRegKeyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>
            )}
          </div>

          {/* Remote Access Tool catalog */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <MonitorCheck className="w-4 h-4 text-cyan-400" />
              4. Known RAT Catalog Match (Module 4)
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasKnownRat}
                onChange={(e) => setHasKnownRat(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="font-semibold text-slate-200">Simulate Running Remote Desktop Client</span>
            </label>
            {hasKnownRat && (
              <select
                value={ratChoice}
                onChange={(e) => setRatChoice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
              >
                <option value="AnyDesk Remote Desktop">AnyDesk Remote Desktop</option>
                <option value="UltraViewer">UltraViewer Support</option>
                <option value="RustDesk Remote Desktop">RustDesk Open Source</option>
                <option value="ngrok Port Tunnel">ngrok Port Tunnel</option>
              </select>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30"
          >
            Deploy & Scan Simulation
          </button>
        </div>

      </div>
    </div>
  );
};
