'use client';

import { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistrictData {
  district: string;
  tickets: number;
  resolved: number;
  escalated?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface DistrictHeatmapProps {
  data?: DistrictData[];
  title?: string;
}

const DEFAULT_DATA: DistrictData[] = [
  { district: 'Nashik', tickets: 42, resolved: 35, escalated: 3, trend: 'up' },
  { district: 'Pune', tickets: 38, resolved: 30, escalated: 2, trend: 'stable' },
  { district: 'Nagpur', tickets: 35, resolved: 28, escalated: 4, trend: 'down' },
  { district: 'Aurangabad', tickets: 31, resolved: 25, escalated: 2, trend: 'up' },
  { district: 'Amravati', tickets: 28, resolved: 22, escalated: 5, trend: 'up' },
  { district: 'Solapur', tickets: 25, resolved: 20, escalated: 1, trend: 'stable' },
  { district: 'Kolhapur', tickets: 22, resolved: 18, escalated: 2, trend: 'down' },
  { district: 'Jalgaon', tickets: 26, resolved: 11, escalated: 6, trend: 'up' },
  { district: 'Latur', tickets: 18, resolved: 15, escalated: 1, trend: 'stable' },
  { district: 'Nanded', tickets: 15, resolved: 12, escalated: 2, trend: 'down' },
  { district: 'Satara', tickets: 12, resolved: 10, escalated: 0, trend: 'stable' },
  { district: 'Sangli', tickets: 10, resolved: 9, escalated: 0, trend: 'down' },
];

function getHeatColor(tickets: number, max: number): string {
  const ratio = tickets / max;
  if (ratio >= 0.8) return 'bg-red-500/80 border-red-500/60 text-white';
  if (ratio >= 0.6) return 'bg-orange-500/70 border-orange-500/50 text-white';
  if (ratio >= 0.4) return 'bg-yellow-500/60 border-yellow-500/40 text-slate-900';
  if (ratio >= 0.2) return 'bg-green-500/50 border-green-500/40 text-white';
  return 'bg-green-500/20 border-green-500/20 text-green-300';
}

function getResolutionColor(rate: number): string {
  if (rate >= 0.85) return 'text-green-400';
  if (rate >= 0.7) return 'text-yellow-400';
  if (rate >= 0.5) return 'text-orange-400';
  return 'text-red-400';
}

export default function DistrictHeatmap({ data = DEFAULT_DATA, title = 'District Analytics' }: DistrictHeatmapProps) {
  const [selected, setSelected] = useState<DistrictData | null>(null);
  const [sortBy, setSortBy] = useState<'tickets' | 'resolved' | 'escalated'>('tickets');

  const maxTickets = Math.max(...data.map((d) => d.tickets));
  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'tickets') return b.tickets - a.tickets;
    if (sortBy === 'resolved') return b.resolved - a.resolved;
    return (b.escalated ?? 0) - (a.escalated ?? 0);
  });

  const totalTickets = data.reduce((s, d) => s + d.tickets, 0);
  const totalResolved = data.reduce((s, d) => s + d.resolved, 0);
  const totalEscalated = data.reduce((s, d) => s + (d.escalated ?? 0), 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {(['tickets', 'resolved', 'escalated'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                'text-xs px-2 py-1 rounded-lg border transition-all capitalize',
                sortBy === s
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/10">
        {[
          { label: 'Total Tickets', value: totalTickets, color: 'text-blue-400' },
          { label: 'Resolved', value: totalResolved, color: 'text-green-400' },
          { label: 'Escalated', value: totalEscalated, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/60 px-4 py-2.5 text-center">
            <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {sorted.map((d) => {
            const resRate = d.tickets > 0 ? d.resolved / d.tickets : 0;
            const isSelected = selected?.district === d.district;

            return (
              <button
                key={d.district}
                onClick={() => setSelected(isSelected ? null : d)}
                className={cn(
                  'relative p-3 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  getHeatColor(d.tickets, maxTickets),
                  isSelected && 'ring-2 ring-white/40 scale-105'
                )}
              >
                <p className="text-xs font-bold truncate">{d.district}</p>
                <p className="text-lg font-bold leading-none mt-1">{d.tickets}</p>
                <p className="text-[10px] opacity-80">tickets</p>

                {/* Trend indicator */}
                {d.trend && (
                  <div className="absolute top-1.5 right-1.5">
                    {d.trend === 'up' && <TrendingUp className="w-3 h-3 opacity-80" />}
                    {d.trend === 'down' && <TrendingDown className="w-3 h-3 opacity-80" />}
                    {d.trend === 'stable' && <Minus className="w-3 h-3 opacity-60" />}
                  </div>
                )}

                {/* Escalation badge */}
                {(d.escalated ?? 0) > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-slate-900 flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">{d.escalated}</span>
                  </div>
                )}

                {/* Resolution bar */}
                <div className="mt-2 h-1 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/60 transition-all duration-500"
                    style={{ width: `${resRate * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected district detail */}
        {selected && (
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {selected.district} District
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Maharashtra, India</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-xl font-bold text-blue-400">{selected.tickets}</p>
                <p className="text-xs text-slate-600">Total</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className={cn('text-xl font-bold', getResolutionColor(selected.resolved / selected.tickets))}>
                  {selected.resolved}
                </p>
                <p className="text-xs text-slate-600">Resolved</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-xl font-bold text-red-400">{selected.escalated ?? 0}</p>
                <p className="text-xs text-slate-600">Escalated</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${(selected.resolved / selected.tickets) * 100}%` }}
                />
              </div>
              <span className={cn('text-xs font-bold', getResolutionColor(selected.resolved / selected.tickets))}>
                {Math.round((selected.resolved / selected.tickets) * 100)}% resolved
              </span>
            </div>
            {(selected.escalated ?? 0) > 3 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-400">
                <AlertTriangle className="w-3 h-3" />
                High escalation rate — needs attention
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs text-slate-600">Ticket density:</span>
          {[
            { label: 'Low', cls: 'bg-green-500/30' },
            { label: 'Medium', cls: 'bg-yellow-500/50' },
            { label: 'High', cls: 'bg-orange-500/60' },
            { label: 'Critical', cls: 'bg-red-500/70' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={cn('w-3 h-3 rounded', l.cls)} />
              <span className="text-xs text-slate-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
