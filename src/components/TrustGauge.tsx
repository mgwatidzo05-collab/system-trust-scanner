import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, Activity, Zap } from 'lucide-react';
import { RiskTier } from '../types';

interface TrustGaugeProps {
  trustScore: number;
  riskScore: number;
  rawScore: number;
  correlationBoost: number;
  tier: RiskTier;
  summaryMessage: string;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({
  trustScore,
  riskScore,
  rawScore,
  correlationBoost,
  tier,
  summaryMessage
}) => {
  // Gauge radius
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Arc mapped to trust score (100 = full green circle, 0 = empty)
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  const getTierConfig = (t: RiskTier) => {
    switch (t) {
      case 'Low':
        return {
          color: 'text-emerald-400',
          stroke: '#10b981',
          bg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
          badge: 'Safe (0-20)',
          icon: ShieldCheck,
          accentBg: 'from-emerald-500/10 to-teal-500/5'
        };
      case 'Medium':
        return {
          color: 'text-amber-400',
          stroke: '#f59e0b',
          bg: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
          badge: 'Medium Risk (21-50)',
          icon: AlertTriangle,
          accentBg: 'from-amber-500/10 to-yellow-500/5'
        };
      case 'High':
        return {
          color: 'text-orange-400',
          stroke: '#f97316',
          bg: 'bg-orange-950/40 border-orange-800/60 text-orange-300',
          badge: 'High Risk (51-80)',
          icon: AlertOctagon,
          accentBg: 'from-orange-500/10 to-red-500/5'
        };
      case 'Critical':
        return {
          color: 'text-rose-500',
          stroke: '#f43f5e',
          bg: 'bg-rose-950/50 border-rose-800/70 text-rose-300',
          badge: 'Critical Threat (81+)',
          icon: ShieldAlert,
          accentBg: 'from-rose-500/20 to-red-600/10'
        };
    }
  };

  const config = getTierConfig(tier);
  const TierIcon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br ${config.accentBg} p-6 shadow-xl`}>
      {/* Background ambient glow */}
      <div 
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: config.stroke }}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left: Gauge Visual */}
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={config.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Center Score Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Trust Score</span>
              <div className="flex items-baseline">
                <span className={`text-4xl font-black tracking-tight ${config.color}`}>
                  {trustScore}
                </span>
                <span className="text-slate-400 font-bold text-sm ml-0.5">%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">100 Max</span>
            </div>
          </div>

          {/* Quick stats beside gauge */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
                <TierIcon className="w-3.5 h-3.5" />
                {tier} Risk Tier
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Calculated Risk:</span>
                <span className="font-bold text-slate-100">{riskScore} / 100 pts</span>
              </div>

              {correlationBoost > 0 && (
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>+{correlationBoost} pts Correlated Triad Multiplier</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Plain-language verdict & Zimbabwe Mobile Money context */}
        <div className="flex-1 max-w-xl bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Analyst Plain-Language Verdict
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Section 5 Scoring Engine</span>
          </div>

          <p className="text-sm font-semibold text-slate-100 mb-2 leading-relaxed">
            {summaryMessage}
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Breakdown: <strong>{rawScore}</strong> raw flags + <strong>{correlationBoost}</strong> correlation boost</span>
            </div>
            <span className="font-mono text-cyan-300">
              Score Range: {tier === 'Low' ? '0-20' : tier === 'Medium' ? '21-50' : tier === 'High' ? '51-80' : '81+'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
