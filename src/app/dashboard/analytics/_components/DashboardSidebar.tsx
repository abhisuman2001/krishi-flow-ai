'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  TicketIcon,
  BarChart3,
  GitBranch,
  MessageSquare,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard/analytics', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/analytics/tickets', label: 'Tickets', icon: TicketIcon },
      { href: '/dashboard/analytics/charts', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/analytics/escalations', label: 'Escalations', icon: AlertTriangle },
      { href: '/dashboard/analytics/resolved', label: 'Resolved', icon: CheckCircle },
      { href: '/dashboard/analytics/trends', label: 'Trends', icon: TrendingUp },
      { href: '/dashboard/analytics/sla', label: 'SLA Tracker', icon: Clock },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/submit', label: 'Submit Issue', icon: MessageSquare },
      { href: '/workflow', label: 'AI Workflow', icon: GitBranch },
      { href: '/whatsapp', label: 'WhatsApp Demo', icon: Smartphone },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-white/10 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/10 px-4 shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-base leading-tight">
            Krishi<span className="text-green-400">Flow</span>
            <span className="text-xs ml-1 text-green-500 font-normal">AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                      active
                        ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-green-400' : 'text-slate-500 group-hover:text-white')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings link */}
      <div className="border-t border-white/10 p-2">
        <Link
          href="/login"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-2'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
