import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TicketStatus, TicketSeverity } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `KF-${year}-${random}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getStatusClass(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    Pending: 'status-pending',
    'In Review': 'status-in-review',
    Escalated: 'status-escalated',
    Resolved: 'status-resolved',
  };
  return map[status] ?? '';
}

export function getSeverityClass(severity: TicketSeverity): string {
  const map: Record<TicketSeverity, string> = {
    Low: 'severity-low',
    Medium: 'severity-medium',
    High: 'severity-high',
    Critical: 'severity-critical',
  };
  return map[severity] ?? '';
}

export function getSeverityColor(severity: TicketSeverity): string {
  const map: Record<TicketSeverity, string> = {
    Low: '#22c55e',
    Medium: '#eab308',
    High: '#f97316',
    Critical: '#ef4444',
  };
  return map[severity] ?? '#64748b';
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    'Soil Health': '🌱',
    Irrigation: '💧',
    'Pest Attack': '🐛',
    Fertilizer: '🧪',
    Weather: '⛈️',
    'Crop Disease': '🍂',
    'Seed Quality': '🌾',
  };
  return map[category] ?? '📋';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
