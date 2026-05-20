import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TicketModel from '@/lib/models/Ticket';
import { MOCK_TICKETS } from '@/lib/mock-data';

/**
 * GET /api/seed
 * Seeds the MongoDB database with the 8 demo tickets from mock-data.
 * Safe to call multiple times — skips tickets that already exist by ticketId.
 * Only available in development or when SEED_SECRET matches.
 */
export async function GET() {
  // Guard: only allow in dev or with secret
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) {
    return NextResponse.json(
      { error: 'Seeding is only allowed in development' },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    const results = {
      inserted: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const mock of MOCK_TICKETS) {
      const exists = await TicketModel.findOne({ ticketId: mock.ticketId });
      if (exists) {
        results.skipped++;
        continue;
      }

      try {
        await TicketModel.create({
          ticketId: mock.ticketId,
          farmerName: mock.farmerName,
          phone: mock.phone,
          district: mock.district,
          state: mock.state,
          language: mock.language,
          crop: mock.crop,
          issue: mock.issue,
          severity: mock.severity,
          category: mock.category,
          status: mock.status,
          assignedOfficer: mock.assignedOfficer,
          department: mock.department,
          suggestedAction: mock.suggestedAction,
          aiSummary: mock.aiSummary,
          createdAt: new Date(mock.createdAt),
          updatedAt: new Date(mock.updatedAt),
        });
        results.inserted++;
      } catch (err) {
        results.errors.push(`${mock.ticketId}: ${String(err)}`);
      }
    }

    const total = await TicketModel.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.inserted} tickets, skipped ${results.skipped} existing.`,
      totalInDB: total,
      ...results,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', detail: String(error) },
      { status: 500 }
    );
  }
}
