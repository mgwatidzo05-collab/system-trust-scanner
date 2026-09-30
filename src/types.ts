export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical';

export type ScanModuleId = 'network' | 'integrity' | 'persistence' | 'rats';

export interface ProcessItem {
  id: string;
  pid: number;
  name: string;
  path: string;
  parentName?: string;
  isSigned: boolean;
  signer?: string;
  inTempOrDownloads: boolean;
  cpu: number;
  memoryMb: number;
  description: string;
}

export interface NetworkConnection {
  id: string;
  pid: number;
  processName: string;
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  protocol: 'TCP' | 'UDP';
  state: 'ESTABLISHED' | 'LISTEN' | 'SYN_SENT' | 'CLOSE_WAIT';
  remoteGeo?: string;
  remoteOrg?: string;
  isSuspicious: boolean;
  suspiciousReason?: string;
}

export interface PersistenceEntry {
  id: string;
  name: string;
  command: string;
  locationType: 'HKCU_RUN' | 'HKLM_RUN' | 'STARTUP_FOLDER' | 'SCHEDULED_TASK';
  locationDisplay: string;
  isUnrecognized: boolean;
  linkedProcessName?: string;
  riskWeight: number;
}

export interface RatItem {
  id: string;
  toolName: string;
  processName: string;
  pid?: number;
  isRunning: boolean;
  category: 'Commercial Support' | 'Open Source RAT' | 'Tunneling Utility' | 'Covert RAT';
  description: string;
  riskPoints: number;
  authorizedByUser?: boolean;
}

export interface Finding {
  id: string;
  moduleId: ScanModuleId;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskPoints: number;
  technicalDetails: string;
  plainLanguageExplanation: string;
  mobileMoneyImpact: string;
  recommendedAction: string;
  isCorrelated?: boolean;
  remediated?: boolean;
  entityId?: string; // id of the process, connection, or persistence entry
}

export interface CorrelatedChain {
  processName: string;
  pid: number;
  hasUnusualPath: boolean;
  hasOutboundSocket: boolean;
  hasStartupPersistence: boolean;
  hasRatTool: boolean;
  bonusPoints: number;
  title: string;
  description: string;
}

export interface ScanEvaluation {
  rawScore: number;
  correlationBoost: number;
  finalRiskScore: number;
  trustScore: number;
  tier: RiskTier;
  findings: Finding[];
  correlatedChains: CorrelatedChain[];
  summaryMessage: string;
  moduleFindingsCount: {
    network: number;
    integrity: number;
    persistence: number;
    rats: number;
  };
}

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  processes: ProcessItem[];
  connections: NetworkConnection[];
  persistenceEntries: PersistenceEntry[];
  ratTools: RatItem[];
}
