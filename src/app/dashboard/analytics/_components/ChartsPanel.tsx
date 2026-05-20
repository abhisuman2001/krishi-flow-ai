'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { AnalyticsData } from '@/lib/types';
import { MOCK_ANALYTICS } from '@/lib/mock-data';
import { ChartSkeleton } from './Skeleton';
import { Database } from 'lucide-react';

// ─── Shared tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      {label && <p className="text-slate-400 mb-2 font-medium">{label}</p>}
      {payload.map((e) => (
        <p key={e.name} className="font-semibold" style={{ color: e.color }}>
          {e.name}: {e.value}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="font-semibold text-white">{payload[0].name}</p>
      <p className="text-slate-400">{payload[0].value} tickets</p>
    </div>
  );
};

// ─── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <h3 className="font-semibold text-white text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-slate-500 mb-5">{subtitle}</p>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChartsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [source, setSource] = useState<'db' | 'mock'>('mock');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.analytics) {
          setAnalytics(d.analytics);
          setSource(d.source ?? 'mock');
        }
      })
      .catch(() => setAnalytics(MOCK_ANALYTICS));
  }, []);

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} height={220} />)}
      </div>
    );
  }

  // Build radar data from category breakdown
  const radarData = analytics.categoryBreakdown.map(c => ({
    category: c.name.replace(' ', '\n'),
    tickets: c.value,
    resolved: Math.round(c.value * (analytics.resolvedTickets / Math.max(analytics.totalTickets, 1))),
  }));

  return (
    <div className="space-y-6">
      {/* Source badge */}
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-500">
          {source === 'db' ? 'Live data from MongoDB' : 'Demo data — seed tickets to see real analytics'}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
          source === 'db'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }`}>
          {source === 'db' ? 'Live' : 'Demo'}
        </span>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution trend */}
        <ChartCard title="Resolution Trend" subtitle="Monthly tickets submitted, resolved & escalated">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.monthlyTrend}>
              <defs>
                <linearGradient id="gTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
              <Area type="monotone" dataKey="tickets" stroke="#3b82f6" fill="url(#gTickets)" strokeWidth={2} name="Submitted" />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#gResolved)" strokeWidth={2} name="Resolved" />
              <Area type="monotone" dataKey="escalated" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Escalated" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category donut */}
        <ChartCard title="Issues by Category" subtitle="Distribution of tickets across all categories">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={88}
                  paddingAngle={3} dataKey="value"
                  strokeWidth={0}
                >
                  {analytics.categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {analytics.categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-slate-400 flex-1 truncate">{cat.name}</span>
                  <span className="text-xs font-semibold text-white tabular-nums">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity bar */}
        <ChartCard title="Severity Distribution" subtitle="Ticket count by severity level this period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.severityBreakdown} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Tickets" radius={[6, 6, 0, 0]}>
                {analytics.severityBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* District heatmap (horizontal bar) */}
        <ChartCard title="District-wise Heatmap" subtitle="Ticket volume and resolution rate by district">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.districtWise} layout="vertical" barGap={3} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="district" type="category"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false} tickLine={false} width={72}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
              <Bar dataKey="tickets" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total" />
              <Bar dataKey="resolved" fill="#22c55e" radius={[0, 4, 4, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 — Radar + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category radar */}
        <ChartCard title="Category Radar" subtitle="Tickets vs resolved per category">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Tickets" dataKey="tickets" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Resolved" dataKey="resolved" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly activity */}
        <ChartCard title="Weekly Activity" subtitle="Tickets submitted vs resolved — last 7 days">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.weeklyTrend} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
              <Bar dataKey="tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Submitted" />
              <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
