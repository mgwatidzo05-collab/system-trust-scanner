import { Finding, CorrelatedChain, ProcessItem, NetworkConnection, PersistenceEntry, RatItem, RiskTier, ScanEvaluation } from '../types';

export function evaluateSystem(
  processes: ProcessItem[],
  connections: NetworkConnection[],
  persistenceEntries: PersistenceEntry[],
  ratTools: RatItem[],
  remediatedIds: Set<string> = new Set()
): ScanEvaluation {
  const findings: Finding[] = [];
  let rawScore = 0;

  // Active items (excluding remediated)
  const activeProcesses = processes.filter(p => !remediatedIds.has(p.id));
  const activeConnections = connections.filter(c => !remediatedIds.has(c.id));
  const activePersistence = persistenceEntries.filter(p => !remediatedIds.has(p.id));
  const activeRats = ratTools.filter(r => !remediatedIds.has(r.id) && r.isRunning);

  // 1. Module: Network Watch ("Who is talking to the outside world?")
  for (const conn of activeConnections) {
    if (conn.isSuspicious) {
      const points = conn.remotePort === 4444 || conn.remotePort === 1337 ? 25 : 18;
      rawScore += points;
      findings.push({
        id: `f-${conn.id}`,
        entityId: conn.id,
        moduleId: 'network',
        title: `Suspicious Outbound Connection: ${conn.processName} ➔ ${conn.remoteAddress}:${conn.remotePort}`,
        severity: points >= 25 ? 'critical' : 'high',
        riskPoints: points,
        technicalDetails: `Process ${conn.processName} (PID ${conn.pid}) established ${conn.protocol} socket to remote host ${conn.remoteAddress} [${conn.remoteGeo || 'Unknown Location'}] on port ${conn.remotePort}. ${conn.suspiciousReason || ''}`,
        plainLanguageExplanation: `An unknown external computer is directly connected to this program. The outside party can potentially send commands or extract information from your machine.`,
        mobileMoneyImpact: `High risk: Outbound traffic can stream your active screen or send keystrokes while you log into banking or mobile money web portals (e.g. EcoCash, OneMoney), compromising OTP codes before they expire.`,
        recommendedAction: `Terminate connection immediately and verify whether you authorized remote support.`
      });
    }
  }

  // 2. Module: Process Integrity ("Is anything running from a suspicious place?")
  for (const proc of activeProcesses) {
    if (proc.inTempOrDownloads) {
      const points = !proc.isSigned ? 20 : 12;
      rawScore += points;
      findings.push({
        id: `f-${proc.id}`,
        entityId: proc.id,
        moduleId: 'integrity',
        title: `Suspicious Execution Path: ${proc.name} in Temporary/Downloads Folder`,
        severity: !proc.isSigned ? 'high' : 'medium',
        riskPoints: points,
        technicalDetails: `Process "${proc.name}" (PID ${proc.pid}) running from "${proc.path}". Code signing: ${proc.isSigned ? `Signed by ${proc.signer}` : 'Unsigned / Unverified Binary'}.`,
        plainLanguageExplanation: `Legitimate software normally installs into "Program Files". Programs running out of Temp or Downloads folders frequently hide there because attackers don't need administrator permissions to place files there.`,
        mobileMoneyImpact: `Malicious download droppers often disguise themselves as legitimate files (receipts, assignment PDFs, cracks) and execute background spyware without opening a visible window.`,
        recommendedAction: `Inspect the file location, terminate the process, and run a digital signature verification.`
      });
    }
  }

  // 3. Module: Persistence Hunter ("What launches automatically at startup?")
  for (const pers of activePersistence) {
    if (pers.isUnrecognized) {
      const points = pers.riskWeight || 18;
      rawScore += points;
      findings.push({
        id: `f-${pers.id}`,
        entityId: pers.id,
        moduleId: 'persistence',
        title: `Unrecognized Startup Entry: ${pers.name}`,
        severity: points >= 20 ? 'high' : 'medium',
        riskPoints: points,
        technicalDetails: `Registry/Startup target: "${pers.command}" located in ${pers.locationDisplay}. Configured to launch silently each time Windows starts.`,
        plainLanguageExplanation: `This program is configured to start itself automatically in the background every time you turn on your computer, even if you never intentionally open it.`,
        mobileMoneyImpact: `Persistence ensures that even if you restart your laptop before making a financial transfer, the remote attacker automatically regains access.`,
        recommendedAction: `Remove or disable this startup registry entry to sever automatic re-infection on reboot.`
      });
    }
  }

  // 4. Module: Known Remote-Access Tools ("Is a known remote-control program running?")
  for (const rat of activeRats) {
    if (!rat.authorizedByUser) {
      const points = rat.riskPoints || 22;
      rawScore += points;
      findings.push({
        id: `f-${rat.id}`,
        entityId: rat.id,
        moduleId: 'rats',
        title: `Remote Control Software Running: ${rat.toolName}`,
        severity: rat.category === 'Covert RAT' ? 'critical' : 'high',
        riskPoints: points,
        technicalDetails: `${rat.category} "${rat.toolName}" (Process: ${rat.processName}) detected actively running. ${rat.description}`,
        plainLanguageExplanation: `A remote desktop tool is running on your laptop. If you did not invite a verified technician to help you right now, someone else may be watching your screen or controlling your mouse.`,
        mobileMoneyImpact: `Direct financial threat: Remote control tools allow an attacker to view SMS 2FA codes, copy one-time passwords, or take over your session immediately after you authenticate.`,
        recommendedAction: `Close and uninstall this remote access tool unless currently in an active, trusted IT support session.`
      });
    }
  }

  // 5. Correlation Multiplier Engine (Section 5 from PDF)
  // "Combinations of findings are weighted more heavily than any single flag alone — an unsigned process
  // by itself is common and often harmless, but an unsigned process plus a live outbound connection
  // plus an unrecognized startup entry, together, tell a very different story."
  const correlatedChains: CorrelatedChain[] = [];
  let correlationBoost = 0;

  for (const proc of activeProcesses) {
    const hasUnusualPath = proc.inTempOrDownloads;
    const procConnections = activeConnections.filter(c => c.pid === proc.pid || c.processName.toLowerCase() === proc.name.toLowerCase());
    const hasOutboundSocket = procConnections.some(c => c.isSuspicious);
    const procPersistence = activePersistence.filter(p => p.linkedProcessName?.toLowerCase() === proc.name.toLowerCase() || p.command.toLowerCase().includes(proc.name.toLowerCase()));
    const hasStartupPersistence = procPersistence.length > 0;
    const hasRatMatch = activeRats.some(r => r.processName.toLowerCase() === proc.name.toLowerCase());

    const indicatorCount = (hasUnusualPath ? 1 : 0) + (hasOutboundSocket ? 1 : 0) + (hasStartupPersistence ? 1 : 0) + (hasRatMatch ? 1 : 0);

    if (indicatorCount >= 3) {
      // Full Triad Multiplier (+30 pts)
      const bonus = 30;
      correlationBoost += bonus;
      correlatedChains.push({
        processName: proc.name,
        pid: proc.pid,
        hasUnusualPath,
        hasOutboundSocket,
        hasStartupPersistence,
        hasRatTool: hasRatMatch,
        bonusPoints: bonus,
        title: `CRITICAL THREAT TRIAD: ${proc.name}`,
        description: `Correlated Indicator Detected: Process runs from untrusted path (${proc.path}) + maintains active outbound C2 connection + has auto-run startup persistence. This combination represents an active remote compromise.`
      });
    } else if (indicatorCount === 2) {
      // Dual Correlation (+15 pts)
      const bonus = 15;
      correlationBoost += bonus;
      correlatedChains.push({
        processName: proc.name,
        pid: proc.pid,
        hasUnusualPath,
        hasOutboundSocket,
        hasStartupPersistence,
        hasRatTool: hasRatMatch,
        bonusPoints: bonus,
        title: `Correlated Indicators: ${proc.name}`,
        description: `Multiple linked anomalies detected on the same process (${proc.name}). Independent flags combine to signify elevated risk.`
      });
    }
  }

  const finalRiskScore = Math.min(100, Math.max(0, rawScore + correlationBoost));
  const trustScore = Math.max(0, 100 - finalRiskScore);

  // Map to Tier (as per PDF Section 5)
  // Low: 0 - 20
  // Medium: 21 - 50
  // High: 51 - 80
  // Critical: 81+
  let tier: RiskTier = 'Low';
  let summaryMessage = 'No significant indicators found. Your system state appears healthy.';

  if (finalRiskScore >= 81) {
    tier = 'Critical';
    summaryMessage = 'Strong indication of active compromise! Immediate remote control indicators and persistence detected. Do NOT conduct online banking or mobile money transfers until cleaned.';
  } else if (finalRiskScore >= 51) {
    tier = 'High';
    summaryMessage = 'Multiple correlated indicators detected. Potential unauthorized remote tool or covert script beaconing out. Immediate investigation recommended.';
  } else if (finalRiskScore >= 21) {
    tier = 'Medium';
    summaryMessage = 'Some indicators worth reviewing. Unverified tools or unusual folder executions present.';
  }

  const moduleFindingsCount = {
    network: findings.filter(f => f.moduleId === 'network').length,
    integrity: findings.filter(f => f.moduleId === 'integrity').length,
    persistence: findings.filter(f => f.moduleId === 'persistence').length,
    rats: findings.filter(f => f.moduleId === 'rats').length,
  };

  return {
    rawScore,
    correlationBoost,
    finalRiskScore,
    trustScore,
    tier,
    findings,
    correlatedChains,
    summaryMessage,
    moduleFindingsCount
  };
}
