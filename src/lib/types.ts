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

export interface AIClassification {
  crop: string;
  category: TicketCategory;
  severity: TicketSeverity;
  department: string;
  suggestedAction: string;
  confidence: number;
}

export interface AILog {
  _id: string;
  ticketId: string;
  operation: AIOperation;
  prompt: string;
  response: string;
  classification?: AIClassification;
  model: string;
  processingTimeMs: number;
  isMock: boolean;
  providerStatus?: number;
  createdAt: string;
  updatedAt: string;
}

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
