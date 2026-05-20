'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { Ticket } from '@/lib/types';
import { StatCardSkeleton } from '../_components/Skeleton';

const SLA_TARGETS: Record<string, number> = {
  Critical: 4,   // hours
  High: 24,
  Medium: 72,
  Low: 168,
};

function slaStatus(ticket: Ticket): 'met' | 'at-risk' | 'breached' {
  const target = SLA_TARGETS[ticket.severity] * 60 * 60 * 1000; // ms
  const elapsed = Date.now() - new Date(ticket.createdAt).getTime();
  if (ticket.status === 'Resolved') return 'met';
  if (elapsed > target) return 'breached';
  if (elapsed > target * 0.75) return 'at-risk';
  return 'met';
}

export default function SLAPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets')
      .then(r => r.json())
      .then(d => setTickets(d.tickets ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const met = tickets.filter(t => slaStatus(t) === 'met').length;
  const atRisk = tickets.filter(t => slaStatus(t) === 'at-risk').length;
  const breached = tickets.filter(t => slaStatus(t) === 'breached').length;
  const compliance = tickets.length > 0 ? Math.round((met / tickets.length) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'SLA Compliance', value: `${compliance}%`, icon: TrendingDown, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Met', value: met, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'At Risk', value: atRisk, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Breached', value: breached, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-2xl border p-5 ${item.bg}`}>
              <Icon className={`w-5 h-5 mb-3 ${item.color}`} />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-sm text-slate-400 mt-1">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* SLA targets reference */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="font-semibold text-white mb-4">SLA Targets by Severity</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(SLA_TARGETS).map(([sev, hours]) => (
            <div key={sev} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-slate-500 mb-1">{sev}</p>
              <p className="text-xl font-bold text-white">{hours < 24 ? `${hours}h` : `${hours / 24}d`}</p>
              <p className="text-xs text-slate-600 mt-0.5">target resolution</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket SLA table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white text-sm">Open Ticket SLA Status</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {['Ticket', 'Severity', 'Status', 'SLA Target', 'SLA Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.filter(t => t.status !== 'Resolved').slice(0, 20).map(ticket => {
              const status = slaStatus(ticket);
              return (
                <tr key={ticket._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{ticket.ticketId}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium severity-${ticket.severity.toLowerCase()}`}>
                      {ticket.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{ticket.status}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {SLA_TARGETS[ticket.severity] < 24
                      ? `${SLA_TARGETS[ticket.severity]}h`
                      : `${SLA_TARGETS[ticket.severity] / 24}d`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      status === 'met' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      status === 'at-risk' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {status === 'met' ? '✓ On Track' : status === 'at-risk' ? '⚠ At Risk' : '✗ Breached'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
