'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ExternalLink, MapPin, User, Clock } from 'lucide-react';
import { Ticket } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { StatCardSkeleton } from '../_components/Skeleton';

export default function ResolvedPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets?status=Resolved')
      .then(r => r.json())
      .then(d => setTickets(d.tickets ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-green-500/20 bg-green-500/5">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-white">{tickets.length} Resolved Tickets</p>
          <p className="text-xs text-slate-400">Successfully closed farmer issues</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-slate-900/40">
          <p className="text-slate-400 text-sm">No resolved tickets yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                {['Ticket ID', 'Farmer', 'Category', 'District', 'Officer', 'Resolved'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{t.ticketId}</td>
                  <td className="px-4 py-3 text-xs text-white font-medium">{t.farmerName}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{t.category}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.district}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {t.assignedOfficer
                      ? <span className="flex items-center gap-1"><User className="w-3 h-3" />{t.assignedOfficer}</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(t.updatedAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/tickets/${t._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-green-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
