'use client';

import { useEffect, useState } from 'react';
import {
  TicketIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCardSkeleton } from './Skeleton';

interface StatItem {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: 'green' | 'blue' | 'red' | 'purple' | 'orange' | 'cyan';
}

const COLOR_MAP = {
  green:  { bg: 'from-green-500/15 to-emerald-500/5',  border: 'border-green-500/20',  icon: 'bg-green-500/20 text-green-400',  trend: 'text-green-400',  dot: 'bg-green-400' },
  blue:   { bg: 'from-blue-500/15 to-cyan-500/5',      border: 'border-blue-500/20',   icon: 'bg-blue-500/20 text-blue-400',    trend: 'text-blue-400',   dot: 'bg-blue-400' },
  red:    { bg: 'from-red-500/15 to-rose-500/5',       border: 'border-red-500/20',    icon: 'bg-red-500/20 text-red-400',      trend: 'text-red-400',    dot: 'bg-red-400' },
  purple: { bg: 'from-purple-500/15 to-violet-500/5',  border: 'border-purple-500/20', icon: 'bg-purple-500/20 text-purple-400',trend: 'text-purple-400', dot: 'bg-purple-400' },
  orange: { bg: 'from-orange-500/15 to-amber-500/5',   border: 'border-orange-500/20', icon: 'bg-orange-500/20 text-orange-400',trend: 'text-orange-400', dot: 'bg-orange-400' },
  cyan:   { bg: 'from-cyan-500/15 to-teal-500/5',      border: 'border-cyan-500/20',   icon: 'bg-cyan-500/20 text-cyan-400',    trend: 'text-cyan-400',   dot: 'bg-cyan-400' },
};

function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatItem) {
  const c = COLOR_MAP[color];
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group',
      c.bg, c.border
    )}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2.5 rounded-xl', c.icon)}>
            <Icon className="w-4 h-4" />
          </div>
          {trend && (
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 flex items-center gap-1',
              c.trend
            )}>
              {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white mb-0.5 tabular-nums">{value}</p>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {/* Animated bottom bar */}
      <div className={cn('absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500', c.dot)} />
    </div>
  );
}

export default function StatsRow() {
  const [data, setData] = useState<{
    total: number; resolved: number; escalated: number;
    pending: number; avgDays: number; inReview: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        const a = d.analytics;
        if (!a) return;
        const inReview = Math.max(0, a.totalTickets - a.pendingTickets - a.escalatedCases - a.resolvedTickets);
        setData({
          total: a.totalTickets,
          resolved: a.resolvedTickets,
          escalated: a.escalatedCases,
          pending: a.pendingTickets,
          avgDays: a.avgResolutionTime,
          inReview,
        });
      })
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const resolutionRate = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;

  const stats: StatItem[] = [
    {
      title: 'Total Tickets',
      value: data.total.toLocaleString(),
      subtitle: 'All time submissions',
      icon: TicketIcon,
      trend: { value: 12, label: 'this month' },
      color: 'blue',
    },
    {
      title: 'Resolved',
      value: data.resolved.toLocaleString(),
      subtitle: `${resolutionRate}% resolution rate`,
      icon: CheckCircle,
      trend: { value: 8, label: 'vs last month' },
      color: 'green',
    },
    {
      title: 'In Review',
      value: data.inReview.toLocaleString(),
      subtitle: 'Being processed',
      icon: Activity,
      color: 'cyan',
    },
    {
      title: 'Pending',
      value: data.pending.toLocaleString(),
      subtitle: 'Awaiting assignment',
      icon: Clock,
      trend: { value: -5, label: 'vs last week' },
      color: 'orange',
    },
    {
      title: 'Escalated',
      value: data.escalated.toLocaleString(),
      subtitle: 'Needs urgent attention',
      icon: AlertTriangle,
      trend: { value: -3, label: 'vs last month' },
      color: 'red',
    },
    {
      title: 'Avg Resolution',
      value: `${data.avgDays}d`,
      subtitle: 'Days to close ticket',
      icon: TrendingUp,
      trend: { value: -15, label: 'improvement' },
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((s) => <StatCard key={s.title} {...s} />)}
    </div>
  );
}
