'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TicketCard from '@/components/dashboard/TicketCard';
import { Ticket, TicketCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';

const CATEGORIES: TicketCategory[] = [
  'Soil Health', 'Irrigation', 'Pest Attack', 'Fertilizer', 'Weather', 'Crop Disease', 'Seed Quality',
];

export default function TicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch {
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, categoryFilter, search]);

  // Fetch on filter change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(fetchTickets, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTickets, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tickets.length };
    tickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  return (
    <div>
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'Pending', 'In Review', 'Escalated', 'Resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === status
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            {status === 'all' ? 'All' : status}
            {!loading && (
              <span className="ml-2 text-xs opacity-70">
                {statusCounts[status] ?? 0}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={fetchTickets}
          className="ml-auto p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by farmer name, ticket ID, issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36">
              <SlidersHorizontal className="w-4 h-4 mr-1 text-slate-500" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-1 text-slate-500" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-green-400 animate-spin mr-3" />
          <span className="text-slate-400">Loading tickets...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-12 rounded-2xl border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTickets}>Try Again</Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>

          {tickets.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/10 bg-slate-900/40">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-lg font-semibold text-white mb-2">No tickets found</h3>
              <p className="text-slate-400 text-sm">Try adjusting your filters or submit a new issue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
