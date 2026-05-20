'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Brain, TrendingUp, Zap } from 'lucide-react';
import AIActivityFeed from '@/components/ai/AIActivityFeed';
import DistrictHeatmap from '@/components/analytics/DistrictHeatmap';
import EscalationTimer from '@/components/ai/EscalationTimer';
import { cn } from '@/lib/utils';

interface LiveStats {
  totalTickets: number;
  resolvedTickets: number;
  escalatedCases: number;
  pendingTickets: number;
}

interface DashboardEnhancementsProps {
  initialStats?: LiveStats;
}

export default function DashboardEnhancements({ initialStats }: DashboardEnhancementsProps) {
  const [stats, setStats] = useState<LiveStats>(
    initialStats ?? { totalTickets: 0, resolvedTickets: 0, escalatedCases: 0, pendingTickets: 0 }
  );
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalTickets: data.totalTickets ?? stats.totalTickets,
          resolvedTickets: data.resolvedTickets ?? stats.resolvedTickets,
          escalatedCases: data.escalatedCases ?? stats.escalatedCases,
          pendingTickets: data.pendingTickets ?? stats.pendingTickets,
        });
        setLastUpdate(new Date());
      }
    } catch {
      // silent
    } finally {
      setIsRefreshing(false);
    }
  }, [stats]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="space-y-6 mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">AI Intelligence Center</h2>
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <Activity className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Refreshing...' : `Updated ${lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
        </button>
      </div>

      {/* Live stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Live Tickets', value: stats.totalTickets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🎫' },
          { label: 'Resolved Today', value: stats.resolvedTickets, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '✅' },
          { label: 'Escalated', value: stats.escalatedCases, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🚨' },
          { label: 'Pending', value: stats.pendingTickets, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '⏳' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-all',
              stat.bg,
              stat.border
            )}
          >
            <span className="text-xl">{stat.icon}</span>
            <div>
              <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-slate-600">{stat.label}</p>
            </div>
            <TrendingUp className={cn('w-4 h-4 ml-auto', stat.color, 'opacity-50')} />
          </div>
        ))}
      </div>

      {/* Two-column: Activity Feed + District Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Live AI Activity</h3>
          </div>
          <AIActivityFeed autoPlay compact={false} />
        </div>

        <div className="space-y-3">
          <DistrictHeatmap title="District Issue Heatmap" />
        </div>
      </div>

      {/* Escalation timer for most critical ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EscalationTimer severity="Critical" />
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">AI System Status</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Groq AI Engine', status: 'Operational', color: 'text-green-400', dot: 'bg-green-400' },
              { label: 'Classification Agent', status: 'Active', color: 'text-green-400', dot: 'bg-green-400' },
              { label: 'Routing Agent', status: 'Active', color: 'text-green-400', dot: 'bg-green-400' },
              { label: 'Escalation Engine', status: 'Monitoring', color: 'text-yellow-400', dot: 'bg-yellow-400' },
              { label: 'Analytics Agent', status: 'Processing', color: 'text-blue-400', dot: 'bg-blue-400' },
              { label: 'Summary Agent', status: 'Standby', color: 'text-slate-400', dot: 'bg-slate-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full animate-pulse', item.dot)} />
                  <span className="text-sm text-slate-400">{item.label}</span>
                </div>
                <span className={cn('text-xs font-medium', item.color)}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
