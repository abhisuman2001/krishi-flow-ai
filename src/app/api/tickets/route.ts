import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TicketModel from '@/lib/models/Ticket';
import AILogModel from '@/lib/models/AILog';
import { generateTicketId } from '@/lib/utils';

// GET /api/tickets — list tickets with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build MongoDB query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status && status !== 'all') query.status = status;
    if (severity && severity !== 'all') query.severity = severity;
    if (category && category !== 'all') query.category = category;

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { farmerName: regex },
        { ticketId: regex },
        { issue: regex },
        { district: regex },
      ];
    }

    const tickets = await TicketModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Normalise _id to string for the client
    const serialised = tickets.map((t) => ({
      ...t,
      _id: String(t._id),
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
    }));

    return NextResponse.json({ tickets: serialised, total: serialised.length });
  } catch (error) {
    console.error('GET /api/tickets error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST /api/tickets — create a new ticket
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      farmerName,
      phone,
      district,
      state,
      language,
      crop,
      issue,
      severity,
      category,
      department,
      suggestedAction,
    } = body;

    if (!farmerName || !district || !state || !crop || !issue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticket = await TicketModel.create({
      ticketId: generateTicketId(),
      farmerName,
      phone: phone || undefined,
      district,
      state,
      language: language || 'Hindi',
      crop,
      issue,
      severity: severity || 'Medium',
      category: category || 'Crop Disease',
      status: 'Pending',
      department: department || undefined,
      suggestedAction: suggestedAction || undefined,
    });

    // Back-fill the ticketId on any pending AILog created during classification
    AILogModel.updateMany(
      { ticketId: 'pending' },
      { $set: { ticketId: ticket.ticketId } }
    ).catch((err) => console.error('AILog ticketId update error:', err));

    return NextResponse.json(
      {
        ticket: {
          ...ticket.toObject(),
          _id: String(ticket._id),
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/tickets error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
