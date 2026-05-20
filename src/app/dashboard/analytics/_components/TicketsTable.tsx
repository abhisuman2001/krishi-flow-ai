'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, Filter, RefreshCw,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ExternalLink,
  MapPin, User, Calendar, Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ticket, TicketCategory, TicketSeverity, TicketStatus } from '@/lib/types';
import { cn, getStatusClass, getSeverityClass, getCategoryIcon, timeAgo, formatDate } from '@/lib/utils';
import { MAHARASHTRA_DISTRICTS } from '@/lib/mock-data';
import { TableRowSkeleton } from './Skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = 'createdAt' | 'severity' | 'status' | 'farmerName' | 'district';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<TicketSeverity, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const STATUS_ORDER: Record<TicketStatus, number> = { Pending: 1, 'In Review': 2, Escalated: 3, Resolved: 4 };

const CATEGORIES: TicketCategory[] = [
  'Soil Health', 'Irrigation', 'Pest Attack',
  'Fertilizer', 'Weather', 'Crop Disease', 'Seed Quality',
];

const PAGE_SIZES = [10, 20, 50];

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: TicketSeverity }) {
  const variantMap: Record<TicketSeverity, 'default' | 'warning' | 'destructive' | 'critical'> = {
    Low: 'default',
    Medium: 'warning',
    High: 'destructive',
    Critical: 'critical',
  };
  return (
    <Badge variant={variantMap[severity]} className="font-semibold text-xs">
      {severity === 'Critical' && <span className="mr-1 animate-pulse">●</span>}
      {severity}
    </Badge>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium border', getStatusClass(status))}>
      {status}
    </span>
  );
}

// ─── Sort header ──────────────────────────────────────────────────────────────

function SortHeader({
  label, field, current, dir, onSort,
}: {
  label: string; field: SortField;
  current: SortField; dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors group"
    >
      {label}
      <span className="text-slate-600 group-hover:text-slate-400">
        {active
          ? dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <ChevronsUpDown className="w-3 h-3" />}
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Sort
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTickets(data.tickets ?? []);
      setPage(1);
    } catch {
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, categoryFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchTickets, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchTickets, search]);

  // Client-side sort + district filter
  const processed = useMemo(() => {
    let rows = [...tickets];

    if (districtFilter !== 'all') {
      rows = rows.filter(t => t.district === districtFilter);
    }

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'severity') {
        cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      } else if (sortField === 'status') {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else if (sortField === 'farmerName') {
        cmp = a.farmerName.localeCompare(b.farmerName);
      } else if (sortField === 'district') {
        cmp = a.district.localeCompare(b.district);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [tickets, districtFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length };
    tickets.forEach(t => { c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, [tickets]);

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'Pending', 'In Review', 'Escalated', 'Resolved'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              statusFilter === s
                ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            )}
          >
            {s === 'all' ? 'All Tickets' : s}
            {!loading && (
              <span className="ml-1.5 opacity-60">{statusCounts[s] ?? 0}</span>
            )}
          </button>
        ))}
        <button
          onClick={fetchTickets}
          className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
          title="Refresh"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            placeholder="Search farmer, ticket ID, issue, district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={severityFilter} onValueChange={v => { setSeverityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SlidersHorizontal className="w-3 h-3 mr-1 text-slate-500" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {(['Low', 'Medium', 'High', 'Critical'] as TicketSeverity[]).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <Filter className="w-3 h-3 mr-1 text-slate-500" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={districtFilter} onValueChange={v => { setDistrictFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <MapPin className="w-3 h-3 mr-1 text-slate-500" />
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {MAHARASHTRA_DISTRICTS.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Ticket" field="createdAt" current={sortField} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Farmer" field="farmerName" current={sortField} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Severity" field="severity" current={sortField} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Status" field="status" current={sortField} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <SortHeader label="District" field="district" current={sortField} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left hidden xl:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Officer</span>
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <SortHeader label="Date" field="createdAt" current={sortField} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: pageSize }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}

              {!loading && error && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchTickets}>Retry</Button>
                  </td>
                </tr>
              )}

              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="text-3xl mb-3">🌾</div>
                    <p className="text-slate-400 text-sm">No tickets match your filters.</p>
                  </td>
                </tr>
              )}

              {!loading && !error && paginated.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Ticket ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Severity left-bar */}
                      <div className={cn(
                        'w-1 h-8 rounded-full shrink-0',
                        ticket.severity === 'Critical' && 'bg-red-500',
                        ticket.severity === 'High' && 'bg-orange-500',
                        ticket.severity === 'Medium' && 'bg-yellow-500',
                        ticket.severity === 'Low' && 'bg-green-500',
                      )} />
                      <div>
                        <p className="font-mono text-xs text-green-400 font-semibold">{ticket.ticketId}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[120px]">{ticket.crop}</p>
                      </div>
                    </div>
                  </td>

                  {/* Farmer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/20 flex items-center justify-center text-xs font-bold text-green-400 shrink-0">
                        {ticket.farmerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate max-w-[100px]">{ticket.farmerName}</p>
                        {ticket.phone && (
                          <p className="text-xs text-slate-600 truncate">{ticket.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span>{getCategoryIcon(ticket.category)}</span>
                      <span className="truncate max-w-[90px]">{ticket.category}</span>
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="px-4 py-3">
                    <SeverityBadge severity={ticket.severity} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>

                  {/* District */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {ticket.district}
                    </span>
                  </td>

                  {/* Officer */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {ticket.assignedOfficer ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[100px]">{ticket.assignedOfficer}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Unassigned</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {timeAgo(ticket.createdAt)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/tickets/${ticket._id}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-600 hover:text-green-400 hover:bg-green-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="View ticket"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && !error && processed.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}
              </span>
              <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map(s => (
                    <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 p-0 text-slate-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = totalPages <= 5
                  ? i + 1
                  : page <= 3 ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'h-7 w-7 rounded-lg text-xs font-medium transition-all',
                      page === p
                        ? 'bg-green-600 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {p}
                  </button>
                );
              })}

              <Button
                variant="ghost" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 w-7 p-0 text-slate-400"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Summary line */}
      {!loading && !error && (
        <p className="text-xs text-slate-600">
          {processed.length} ticket{processed.length !== 1 ? 's' : ''} found
          {districtFilter !== 'all' && ` in ${districtFilter}`}
        </p>
      )}
    </div>
  );
}
