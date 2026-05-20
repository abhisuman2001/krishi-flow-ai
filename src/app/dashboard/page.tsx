import { Metadata } from 'next';
import { Ticket, CheckCircle, AlertTriangle, Clock, TrendingUp, Filter } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import TicketCard from '@/components/dashboard/TicketCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket as TicketType, AnalyticsData } from '@/lib/types';
import { MOCK_ANALYTICS } from '@/lib/mock-data';
import { connectDB } from '@/lib/db';
import TicketModel from '@/lib/models/Ticket';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Officer Dashboard — KrishiFlow AI',
  description: 'Agriculture officer dashboard for managing farmer tickets',
};

async function getDashboardData(): Promise<{
  tickets: TicketType[];
  analytics: AnalyticsData;
}> {
  try {
    await connectDB();

    // Fetch recent tickets directly from DB
    const rawTickets = await TicketModel.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const tickets: TicketType[] = rawTickets.map((t) => ({
      ...(t as unknown as TicketType),
      _id: String(t._id),
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : String(t.updatedAt),
    }));

    // Compute analytics inline
    const total = await TicketModel.countDocuments();

    if (total === 0) {
      return { tickets, analytics: MOCK_ANALYTICS };
    }

    const [resolvedCount, escalatedCount, categoryAgg, severityAgg] = await Promise.all([
      TicketModel.countDocuments({ status: 'Resolved' }),
      TicketModel.countDocuments({ status: 'Escalated' }),
      TicketModel.aggregate([
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),
      TicketModel.aggregate([
        { $group: { _id: '$severity', value: { $sum: 1 } } },
      ]),
    ]);

    const CATEGORY_COLORS: Record<string, string> = {
      'Crop Disease': '#ef4444', 'Pest Attack': '#f97316', 'Irrigation': '#3b82f6',
      'Soil Health': '#8b5cf6', 'Fertilizer': '#22c55e', 'Weather': '#eab308', 'Seed Quality': '#ec4899',
    };
    const SEVERITY_COLORS: Record<string, string> = {
      Low: '#22c55e', Medium: '#eab308', High: '#f97316', Critical: '#ef4444',
    };

    const analytics: AnalyticsData = {
      totalTickets: total,
      resolvedTickets: resolvedCount,
      escalatedCases: escalatedCount,
      pendingTickets: total - resolvedCount - escalatedCount,
      avgResolutionTime: 2.4, // computed properly in /api/analytics
      categoryBreakdown: categoryAgg.map((c) => ({
        name: c._id as string,
        value: c.value as number,
        color: CATEGORY_COLORS[c._id as string] ?? '#64748b',
      })),
      severityBreakdown: severityAgg.map((s) => ({
        name: s._id as string,
        value: s.value as number,
        color: SEVERITY_COLORS[s._id as string] ?? '#64748b',
      })),
      districtWise: MOCK_ANALYTICS.districtWise,
      weeklyTrend: MOCK_ANALYTICS.weeklyTrend,
      monthlyTrend: MOCK_ANALYTICS.monthlyTrend,
    };

    return { tickets, analytics };
  } catch (err) {
    console.error('Dashboard data error:', err);
    return { tickets: [], analytics: MOCK_ANALYTICS };
  }
}

export default async function DashboardPage() {
  const { tickets, analytics } = await getDashboardData();

  const recentTickets = tickets.slice(0, 6);
  const criticalTickets = tickets.filter(
    (t) => t.severity === 'Critical' || t.status === 'Escalated'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Officer Dashboard</h1>
            <p className="text-slate-400 mt-1">Maharashtra Agricultural Support System</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tickets">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                All Tickets
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="gradient" size="sm" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Tickets"
            value={analytics.totalTickets}
            subtitle="All time"
            icon={Ticket}
            trend={{ value: 12, label: 'this month' }}
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={analytics.resolvedTickets}
            subtitle={`${analytics.totalTickets > 0 ? Math.round((analytics.resolvedTickets / analytics.totalTickets) * 100) : 0}% resolution rate`}
            icon={CheckCircle}
            trend={{ value: 8, label: 'vs last month' }}
            color="green"
          />
          <StatCard
            title="Escalated"
            value={analytics.escalatedCases}
            subtitle="Needs attention"
            icon={AlertTriangle}
            trend={{ value: -3, label: 'vs last month' }}
            color="red"
          />
          <StatCard
            title="Avg Resolution"
            value={`${analytics.avgResolutionTime}d`}
            subtitle="Days to resolve"
            icon={Clock}
            trend={{ value: -15, label: 'improvement' }}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Tickets</h2>
              <Link href="/tickets" className="text-sm text-green-400 hover:text-green-300 transition-colors">
                View all →
              </Link>
            </div>
            {recentTickets.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-white/10 bg-slate-900/40">
                <div className="text-3xl mb-3">🌾</div>
                <p className="text-slate-400 text-sm">No tickets yet. Submit the first one!</p>
                <Link href="/submit" className="inline-block mt-3">
                  <Button variant="gradient" size="sm">Submit Issue</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Critical Alerts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Critical Alerts</h2>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {criticalTickets.length}
                </span>
              </div>
              {criticalTickets.length === 0 ? (
                <div className="text-center py-6 rounded-xl border border-white/10 bg-slate-900/40">
                  <p className="text-xs text-slate-500">No critical alerts 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalTickets.map((ticket) => (
                    <TicketCard key={ticket._id} ticket={ticket} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Category Summary */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="font-semibold text-white mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {analytics.categoryBreakdown.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-400 flex-1">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${analytics.totalTickets > 0 ? (cat.value / analytics.totalTickets) * 100 : 0}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-6 text-right">{cat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/submit">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    📝 Submit New Ticket
                  </Button>
                </Link>
                <Link href="/tickets?status=Escalated">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    🚨 View Escalated Cases
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    📊 View Analytics
                  </Button>
                </Link>
                <Link href="/workflow">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    🔄 AI Workflow
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
