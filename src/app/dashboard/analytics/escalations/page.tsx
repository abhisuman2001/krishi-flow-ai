'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ExternalLink, MapPin, User, Clock } from 'lucide-react';
import { Ticket } from '@/lib/types';
import { cn, getSeverityClass, timeAgo } from '@/lib/utils';
import { StatCardSkeleton } from '../_components/Skeleton';
import { Badge } from '@/components/ui/badge';

export default function EscalationsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets?status=Escalated')
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
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-white">{tickets.length} Escalated Cases</p>
          <p className="text-xs text-slate-400">These tickets require immediate senior officer attention</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-white font-semibold mb-1">No escalated cases</p>
          <p className="text-slate-400 text-sm">All tickets are being handled within normal workflow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map(ticket => (
            <div key={ticket._id} className="rounded-2xl border border-red-500/20 bg-slate-900/60 p-5 hover:border-red-500/40 transition-all group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-xs text-red-400 font-semibold">{ticket.ticketId}</p>
                  <p className="font-semibold text-white mt-0.5">{ticket.farmerName}</p>
                </div>
                <Badge variant="critical" className="shrink-0">
                  <span className="mr-1 animate-pulse">●</span>
                  {ticket.severity}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{ticket.issue}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ticket.district}</span>
                {ticket.assignedOfficer && (
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.assignedOfficer}</span>
                )}
                <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{timeAgo(ticket.createdAt)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500">{ticket.category} · {ticket.crop}</span>
                <Link
                  href={`/tickets/${ticket._id}`}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  View <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
