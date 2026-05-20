export type NotificationType = 'critical' | 'escalated' | 'resolved' | 'new' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string;
  ticketDbId?: string;
  time: string;
  read: boolean;
}

/** Seeded notifications derived from mock ticket data */
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'critical',
    title: 'Critical Alert',
    message: 'Banana Panama disease reported in Jalgaon — immediate action required.',
    ticketId: 'KF-2024-008',
    ticketDbId: 'KF-2024-008',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'escalated',
    title: 'Ticket Escalated',
    message: 'Cotton bollworm case (KF-2024-002) escalated to senior officer.',
    ticketId: 'KF-2024-002',
    ticketDbId: 'KF-2024-002',
    time: '18 min ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'new',
    title: 'New Ticket Assigned',
    message: 'Tomato blight issue from Nashik assigned to you.',
    ticketId: 'KF-2024-001',
    ticketDbId: 'KF-2024-001',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'escalated',
    title: 'Seed Quality Complaint',
    message: 'Rice seed germination failure in Kolhapur escalated.',
    ticketId: 'KF-2024-007',
    ticketDbId: 'KF-2024-007',
    time: '3 hr ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'resolved',
    title: 'Ticket Resolved',
    message: 'Irrigation issue (KF-2024-004) marked resolved by Er. Suresh Jadhav.',
    ticketId: 'KF-2024-004',
    ticketDbId: 'KF-2024-004',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n6',
    type: 'info',
    title: 'System Update',
    message: 'AI classification model updated to Llama 3.3 70B for improved accuracy.',
    time: '2 days ago',
    read: true,
  },
];

export function getNotificationIcon(type: NotificationType): string {
  const map: Record<NotificationType, string> = {
    critical: '🚨',
    escalated: '⚠️',
    resolved: '✅',
    new: '🎫',
    info: 'ℹ️',
  };
  return map[type];
}

export function getNotificationColor(type: NotificationType): string {
  const map: Record<NotificationType, string> = {
    critical: 'border-l-red-500 bg-red-500/5',
    escalated: 'border-l-orange-500 bg-orange-500/5',
    resolved: 'border-l-green-500 bg-green-500/5',
    new: 'border-l-blue-500 bg-blue-500/5',
    info: 'border-l-slate-500 bg-slate-500/5',
  };
  return map[type];
}
