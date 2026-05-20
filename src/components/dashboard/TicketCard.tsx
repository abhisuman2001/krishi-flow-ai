'use client';

import Link from 'next/link';
import { MapPin, Clock, User, ChevronRight } from 'lucide-react';
import { Ticket } from '@/lib/types';
import { cn, getStatusClass, getSeverityClass, timeAgo, getCategoryIcon } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  compact?: boolean;
}

export default function TicketCard({ ticket, compact = false }: TicketCardProps) {
  return (
    <Link href={`/tickets/${ticket._id}`}>
      <div className={cn(
        'group relative rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/60 hover:border-green-500/30 transition-all duration-200 cursor-pointer',
        compact ? 'p-3' : 'p-4'
      )}>
        {/* Severity indicator */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
          ticket.severity === 'Critical' && 'bg-red-500',
          ticket.severity === 'High' && 'bg-orange-500',
          ticket.severity === 'Medium' && 'bg-yellow-500',
          ticket.severity === 'Low' && 'bg-green-500',
        )} />

        <div className="pl-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-mono">{ticket.ticketId}</p>
                <p className="text-sm font-semibold text-white truncate">{ticket.farmerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getSeverityClass(ticket.severity))}>
                {ticket.severity}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition-colors" />
            </div>
          </div>

          {/* Issue preview */}
          {!compact && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{ticket.issue}</p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                {ticket.district}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {timeAgo(ticket.createdAt)}
              </span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusClass(ticket.status))}>
              {ticket.status}
            </span>
          </div>

          {/* Assigned officer */}
          {ticket.assignedOfficer && !compact && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
              <User className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">{ticket.assignedOfficer}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
