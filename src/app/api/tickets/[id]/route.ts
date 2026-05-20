import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TicketModel from '@/lib/models/Ticket';
import mongoose from 'mongoose';

type RouteContext = { params: Promise<{ id: string }> };

function serialise(doc: Record<string, unknown>) {
  return {
    ...doc,
    _id: String(doc._id),
    createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? (doc.updatedAt as Date).toISOString() : doc.updatedAt,
  };
}

// GET /api/tickets/[id]
export async function GET(
  _req: NextRequest,
  ctx: RouteContext
) {
  try {
    await connectDB();
    const { id } = await ctx.params;

    // Support both MongoDB ObjectId and ticketId string (e.g. KF-2024-001)
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const ticket = isObjectId
      ? await TicketModel.findById(id).lean()
      : await TicketModel.findOne({ ticketId: id }).lean();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket: serialise(ticket as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error('GET /api/tickets/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// PATCH /api/tickets/[id]
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext
) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    const body = await request.json();

    // Whitelist updatable fields
    const allowed = ['status', 'assignedOfficer', 'department', 'suggestedAction', 'aiSummary', 'severity'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Auto-set resolvedAt when status is patched to Resolved
    // (findByIdAndUpdate bypasses pre-save middleware)
    if (update.status === 'Resolved') {
      update.resolvedAt = new Date();
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const ticket = isObjectId
      ? await TicketModel.findByIdAndUpdate(id, update, { new: true }).lean()
      : await TicketModel.findOneAndUpdate({ ticketId: id }, update, { new: true }).lean();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket: serialise(ticket as unknown as Record<string, unknown>), success: true });
  } catch (error) {
    console.error('PATCH /api/tickets/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
