'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  Line,
} from 'recharts';
import { MOCK_ANALYTICS } from '@/lib/mock-data';
import { AnalyticsData } from '@/lib/types';
import StatCard from '@/components/dashboard/StatCard';
import {
  Ticket,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Loader2,
  Database,
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-sm font-medium text-white">{payload[0].name}</p>
        <p className="text-sm text-slate-400">{payload[0].value} tickets</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'db' | 'mock'>('mock');

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((data) => {
        if (data.analytics) {
          setAnalytics(data.analytics);
          setSource(data.source ?? 'mock');
        }
      })
      .catch(() => {
        // keep MOCK_ANALYTICS as fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const { totalTickets, resolvedTickets, escalatedCases, pendingTickets, avgResolutionTime } = analytics;
  // "In Review" = everything that isn't Pending, Escalated, or Resolved
  const inReviewTickets = Math.max(0, totalTickets - pendingTickets - escalatedCases - resolvedTickets);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-green-400 animate-spin mr-3" />
        <span className="text-slate-400">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data source badge */}
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-500">
          {source === 'db' ? 'Live data from MongoDB' : 'Demo data — submit tickets to see real analytics'}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
          source === 'db'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }`}>
          {source === 'db' ? 'Live' : 'Demo'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value={totalTickets}
          icon={Ticket}
          trend={{ value: 12, label: 'this month' }}
          color="blue"
        />
        <StatCard
          title="Resolved"
          value={resolvedTickets}
          subtitle={`${totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0}% rate`}
          icon={CheckCircle}
          trend={{ value: 8, label: 'vs last month' }}
          color="green"
        />
        <StatCard
          title="Escalated"
          value={escalatedCases}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Avg Resolution"
          value={`${avgResolutionTime}d`}
          icon={Clock}
          trend={{ value: -15, label: 'improvement' }}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-white mb-1">Monthly Ticket Trend</h3>
          <p className="text-xs text-slate-500 mb-4">Tickets submitted, resolved, and escalated per month</p>
          {analytics.monthlyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={analytics.monthlyTrend}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Area type="monotone" dataKey="tickets" stroke="#3b82f6" fill="url(#colorTickets)" strokeWidth={2} name="Tickets" />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#colorResolved)" strokeWidth={2} name="Resolved" />
                <Line type="monotone" dataKey="escalated" stroke="#ef4444" strokeWidth={2} dot={false} name="Escalated" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-white mb-1">Category Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of issues by category</p>
          {analytics.categoryBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {analytics.categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-slate-400 flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-medium text-white">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-white mb-1">Weekly Activity</h3>
          <p className="text-xs text-slate-500 mb-4">Tickets submitted vs resolved this week</p>
          {analytics.weeklyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.weeklyTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Bar dataKey="tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Submitted" />
                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Severity Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-semibold text-white mb-1">Severity Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of tickets by severity level</p>
          {analytics.severityBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">No data yet</div>
          ) : (
            <div className="space-y-4 mt-6">
              {analytics.severityBreakdown.map((sev) => (
                <div key={sev.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-300">{sev.name}</span>
                    <span className="text-sm font-medium text-white">{sev.value} tickets</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${totalTickets > 0 ? (sev.value / totalTickets) * 100 : 0}%`,
                        backgroundColor: sev.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {totalTickets > 0 ? Math.round((sev.value / totalTickets) * 100) : 0}% of total
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* District-wise Analytics */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold text-white">District-wise Analytics</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Ticket distribution and resolution across districts</p>
        {analytics.districtWise.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-slate-600 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.districtWise} layout="vertical" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="district" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Bar dataKey="tickets" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total Tickets" />
              <Bar dataKey="resolved" fill="#22c55e" radius={[0, 4, 4, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pendingTickets, color: '#eab308', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'In Review', value: inReviewTickets, color: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Escalated', value: escalatedCases, color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Resolved', value: resolvedTickets, color: '#22c55e', bg: 'bg-green-500/10 border-green-500/20' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border p-5 ${item.bg}`}>
            <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: item.color }} />
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-sm text-slate-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
