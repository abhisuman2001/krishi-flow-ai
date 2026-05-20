import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TicketModel from '@/lib/models/Ticket';
import { MOCK_ANALYTICS } from '@/lib/mock-data';

export async function GET() {
  try {
    await connectDB();

    const total = await TicketModel.countDocuments();

    // If the collection is empty, return mock data so the UI always has something to show
    if (total === 0) {
      return NextResponse.json({ analytics: MOCK_ANALYTICS, source: 'mock' });
    }

    // Run all aggregations in parallel
    const [
      resolvedCount,
      escalatedCount,
      categoryAgg,
      severityAgg,
      districtAgg,
      weeklyAgg,
      monthlyAgg,
      resolutionAgg,
    ] = await Promise.all([
      TicketModel.countDocuments({ status: 'Resolved' }),
      TicketModel.countDocuments({ status: 'Escalated' }),

      // Category breakdown
      TicketModel.aggregate([
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),

      // Severity breakdown
      TicketModel.aggregate([
        { $group: { _id: '$severity', value: { $sum: 1 } } },
      ]),

      // District-wise
      TicketModel.aggregate([
        {
          $group: {
            _id: '$district',
            tickets: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { tickets: -1 } },
        { $limit: 10 },
      ]),

      // Weekly trend — last 7 days
      TicketModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            tickets: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id': 1 } },
      ]),

      // Monthly trend — last 6 months
      TicketModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            tickets: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
            escalated: {
              $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Average resolution time (days) for resolved tickets
      TicketModel.aggregate([
        { $match: { status: 'Resolved' } },
        {
          $project: {
            diffMs: { $subtract: ['$updatedAt', '$createdAt'] },
          },
        },
        {
          $group: {
            _id: null,
            avgMs: { $avg: '$diffMs' },
          },
        },
      ]),
    ]);

    // Category colours (consistent mapping)
    const CATEGORY_COLORS: Record<string, string> = {
      'Crop Disease': '#ef4444',
      'Pest Attack': '#f97316',
      'Irrigation': '#3b82f6',
      'Soil Health': '#8b5cf6',
      'Fertilizer': '#22c55e',
      'Weather': '#eab308',
      'Seed Quality': '#ec4899',
    };

    const SEVERITY_COLORS: Record<string, string> = {
      Low: '#22c55e',
      Medium: '#eab308',
      High: '#f97316',
      Critical: '#ef4444',
    };

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const avgMs = resolutionAgg[0]?.avgMs ?? 0;
    const avgResolutionTime = parseFloat((avgMs / (1000 * 60 * 60 * 24)).toFixed(1));

    const analytics = {
      totalTickets: total,
      resolvedTickets: resolvedCount,
      escalatedCases: escalatedCount,
      pendingTickets: total - resolvedCount - escalatedCount,
      avgResolutionTime: avgResolutionTime || 0,

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

      districtWise: districtAgg.map((d) => ({
        district: d._id as string,
        tickets: d.tickets as number,
        resolved: d.resolved as number,
      })),

      weeklyTrend: weeklyAgg.map((w) => ({
        day: DAY_NAMES[(w._id as number) - 1] ?? 'Day',
        tickets: w.tickets as number,
        resolved: w.resolved as number,
      })),

      monthlyTrend: monthlyAgg.map((m) => ({
        month: MONTH_NAMES[((m._id as { month: number }).month) - 1] ?? 'Month',
        tickets: m.tickets as number,
        resolved: m.resolved as number,
        escalated: m.escalated as number,
      })),
    };

    return NextResponse.json({ analytics, source: 'db' });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    // Graceful fallback — never break the dashboard
    return NextResponse.json({ analytics: MOCK_ANALYTICS, source: 'mock' });
  }
}
