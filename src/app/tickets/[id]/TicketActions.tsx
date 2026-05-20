'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/lib/types';

interface TicketActionsProps {
  ticket: Ticket;
}

export default function TicketActions({ ticket }: TicketActionsProps) {
  const [status, setStatus] = useState(ticket.status);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus as typeof status);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'In Review' && status !== 'Resolved' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus('In Review')}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
          Take Review
        </Button>
      )}
      {status !== 'Escalated' && status !== 'Resolved' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus('Escalated')}
          disabled={loading}
          className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Escalate
        </Button>
      )}
      {status !== 'Resolved' && (
        <Button
          size="sm"
          variant="gradient"
          onClick={() => updateStatus('Resolved')}
          disabled={loading}
          className="gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Mark Resolved
        </Button>
      )}
      {status === 'Resolved' && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Resolved
        </div>
      )}
    </div>
  );
}
