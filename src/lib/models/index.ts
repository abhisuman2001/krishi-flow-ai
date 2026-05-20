/**
 * Central barrel export for all Mongoose models.
 * Import from here to avoid repeated relative paths:
 *
 *   import { TicketModel, UserModel, EscalationModel, AILogModel, AnalyticsModel } from '@/lib/models';
 */

export { default as UserModel } from './User';
export { default as TicketModel } from './Ticket';
export { default as EscalationModel } from './Escalation';
export { default as AILogModel } from './AILog';
export { default as AnalyticsModel } from './Analytics';

// Re-export interfaces for convenience
export type { IUser, UserRole } from './User';
export type { ITicket } from './Ticket';
export type { IEscalation, EscalationStatus, EscalationPriority } from './Escalation';
export type { IAILog, IAIClassification, AIOperation } from './AILog';
export type { IAnalytics, AnalyticsPeriod } from './Analytics';
