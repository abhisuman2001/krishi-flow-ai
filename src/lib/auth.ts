/**
 * Auth helpers — cookie-based session, no external auth library.
 * Uses a signed-cookie pattern: value is base64(JSON) for simplicity in demo.
 * In production, replace with a proper JWT or NextAuth.
 */

export interface Officer {
  id: string;
  name: string;
  email: string;
  role: 'officer' | 'senior_officer' | 'admin';
  department: string;
  district: string;
  state: string;
  phone: string;
  initials: string;
  joinedAt: string;
}

/** Demo officer accounts — in production these come from MongoDB */
export const DEMO_OFFICERS: (Officer & { password: string })[] = [
  {
    id: 'off-001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@krishiflow.gov.in',
    password: 'officer123',
    role: 'senior_officer',
    department: 'Plant Protection',
    district: 'Nashik',
    state: 'Maharashtra',
    phone: '+91 98100 11001',
    initials: 'PS',
    joinedAt: '2022-04-01',
  },
  {
    id: 'off-002',
    name: 'Mr. Vijay Patil',
    email: 'vijay.patil@krishiflow.gov.in',
    password: 'officer123',
    role: 'officer',
    department: 'Pest Management',
    district: 'Amravati',
    state: 'Maharashtra',
    phone: '+91 98100 22002',
    initials: 'VP',
    joinedAt: '2023-01-15',
  },
  {
    id: 'off-003',
    name: 'Er. Suresh Jadhav',
    email: 'suresh.jadhav@krishiflow.gov.in',
    password: 'officer123',
    role: 'officer',
    department: 'Irrigation Engineering',
    district: 'Aurangabad',
    state: 'Maharashtra',
    phone: '+91 98100 33003',
    initials: 'SJ',
    joinedAt: '2021-08-20',
  },
  {
    id: 'off-004',
    name: 'Admin Officer',
    email: 'admin@krishiflow.gov.in',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '+91 98100 00000',
    initials: 'AO',
    joinedAt: '2020-01-01',
  },
];

export const SESSION_COOKIE = 'kf_session';

export function encodeSession(officer: Officer): string {
  return Buffer.from(JSON.stringify(officer)).toString('base64');
}

export function decodeSession(cookie: string): Officer | null {
  try {
    return JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8')) as Officer;
  } catch {
    return null;
  }
}

export function getRoleLabel(role: Officer['role']): string {
  const map: Record<Officer['role'], string> = {
    officer: 'Agriculture Officer',
    senior_officer: 'Senior Officer',
    admin: 'Administrator',
  };
  return map[role];
}

export function getRoleBadgeColor(role: Officer['role']): string {
  const map: Record<Officer['role'], string> = {
    officer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    senior_officer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return map[role];
}
