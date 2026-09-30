import React from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  FileCode, 
  Volume2, 
  VolumeX, 
  FileText, 
  Tv, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Scenario } from '../types';

interface HeaderProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPitchMode: () => void;
  onOpenPythonScript: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  isScanning,
  onStartScan,
  onReset,
  soundEnabled,
  onToggleSound,
  onOpenPitchMode,
  onOpenPythonScript,
  onOpenReport
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & NUST CyberHub challenge badge */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">System Trust Scanner</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                  NUST CyberHub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Local-Scan Remote-Access & Stealth Compromise Detector • Zimbabwe Innovation Challenge
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Scenario selector */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 mr-2 font-medium">Scenario:</span>
              <select
                value={selectedScenarioId}
                onChange={(e) => onSelectScenario(e.target.value)}
                disabled={isScanning}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                    {sc.name} ({sc.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Run Scan Button */}
            <button
              onClick={onStartScan}
              disabled={isScanning}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-95'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Modules...' : 'Run Scanner'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              disabled={isScanning}
              title="Reset current scenario and findings"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Projector Pitch Mode */}
            <button
              onClick={onOpenPitchMode}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              title="Open Projector / Judge Presentation Mode"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Judge Pitch Deck</span>
            </button>

            {/* View Python Script */}
            <button
              onClick={onOpenPythonScript}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
              title="View Python MVP Source Code (Section 7)"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Python MVP</span>
            </button>

            {/* Export Report */}
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
              title="View HTML / PDF Audit Report"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Audit Report</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={soundEnabled ? 'Mute Audio Pings' : 'Enable Audio Feedback'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
