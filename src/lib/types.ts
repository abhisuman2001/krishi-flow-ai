export type TicketStatus = 'Pending' | 'In Review' | 'Escalated' | 'Resolved';
export type TicketSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory =
  | 'Soil Health'
  | 'Irrigation'
  | 'Pest Attack'
  | 'Fertilizer'
  | 'Weather'
  | 'Crop Disease'
  | 'Seed Quality';

export type UserRole = 'officer' | 'senior_officer' | 'admin';
export type EscalationStatus = 'Open' | 'Acknowledged' | 'Resolved';
export type EscalationPriority = 'Normal' | 'Urgent' | 'Critical';
export type AIOperation = 'classify' | 'chat' | 'summarise' | 'suggest';
export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly';

// ─── AI Classification ────────────────────────────────────────────────────────

/**
 * Structured output returned by the AI classification service.
 *
 * `issueCategory` is the canonical field name exposed by POST /api/ai/classify.
 * `category` mirrors `issueCategory` so all existing code that reads `.category`
 * continues to work without changes.
 */
export interface ClassificationResult {
  crop: string;
  issueCategory: TicketCategory;
  /** Mirror of issueCategory — kept for backward compatibility */
  category: TicketCategory;
  severity: TicketSeverity;
  department: string;
  suggestedAction: string;
  /** One-sentence plain-language summary of the issue */
  summary: string;
  /** 0–1 model confidence score */
  confidence: number;
}

/**
 * Legacy alias — existing imports of AIClassification keep compiling.
 * @deprecated Use ClassificationResult instead.
 */
export type AIClassification = ClassificationResult;

// ─── Ticket ───────────────────────────────────────────────────────────────────

export interface Ticket {
  _id: string;
  ticketId: string;
  farmerName: string;
  phone?: string;
  district: string;
  state: string;
  language: string;
  crop: string;
  issue: string;
  severity: TicketSeverity;
  category: TicketCategory;
  status: TicketStatus;
  assignedOfficer?: string;
  department?: string;
  suggestedAction?: string;
  aiSummary?: string;
  resolvedAt?: string;
  resolutionTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Log ───────────────────────────────────────────────────────────────────

export interface AILog {
  _id: string;
  ticketId: string;
  operation: AIOperation;
  prompt: string;
  response: string;
  classification?: ClassificationResult;
  model: string;
  processingTimeMs: number;
  isMock: boolean;
  providerStatus?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Escalation ───────────────────────────────────────────────────────────────

export interface Escalation {
  _id: string;
  ticketId: string;
  reason: string;
  escalatedBy: string;
  escalatedTo: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  resolutionNote?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  escalatedCases: number;
  pendingTickets: number;
  avgResolutionTime: number;
  categoryBreakdown: { name: string; value: number; color: string }[];
  severityBreakdown: { name: string; value: number; color: string }[];
  districtWise: { district: string; tickets: number; resolved: number }[];
  weeklyTrend: { day: string; tickets: number; resolved: number }[];
  monthlyTrend: { month: string; tickets: number; resolved: number; escalated: number }[];
}

// ─── Chat / Workflow ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'farmer' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  icon: string;
  timestamp?: string;
}
