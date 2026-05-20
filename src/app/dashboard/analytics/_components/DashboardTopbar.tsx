'use client';

import { usePathname } from 'next/navigation';
import { Bell, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileDropdown from '@/components/navbar/ProfileDropdown';
import NotificationsPanel from '@/components/navbar/NotificationsPanel';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard/analytics': { title: 'Analytics Overview', subtitle: 'Real-time agricultural support metrics' },
  '/dashboard/analytics/tickets': { title: 'Ticket Management', subtitle: 'Search, filter and manage all farmer tickets' },
  '/dashboard/analytics/charts': { title: 'Analytics Charts', subtitle: 'Visual insights and trend analysis' },
  '/dashboard/analytics/escalations': { title: 'Escalations', subtitle: 'Critical and escalated cases requiring attention' },
  '/dashboard/analytics/resolved': { title: 'Resolved Tickets', subtitle: 'Successfully closed farmer issues' },
  '/dashboard/analytics/trends': { title: 'Trends', subtitle: 'Historical patterns and forecasts' },
  '/dashboard/analytics/sla': { title: 'SLA Tracker', subtitle: 'Service level agreement compliance' },
};

export default function DashboardTopbar() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: 'Dashboard', subtitle: 'KrishiFlow AI' };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-white leading-tight">{page.title}</h1>
        <p className="text-xs text-slate-500 leading-tight mt-0.5">{page.subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-white hidden sm:flex">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-white hidden sm:flex">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
        <NotificationsPanel />
        <ProfileDropdown />
      </div>
    </header>
  );
}
