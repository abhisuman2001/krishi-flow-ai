import mongoose, { Schema, Document, Model } from 'mongoose';
import { TicketStatus, TicketSeverity, TicketCategory } from '@/lib/types';

// ─── TypeScript Interface ────────────────────────────────────────────────────

export interface ITicket extends Document {
  ticketId: string;
  farmerName: string;
  phone?: string;
  district: string;
  state: string;
  language: string;
  crop: string;
  issue: string;
  severity: TicketSeverity;
  category: TicketCategory;
  status: TicketStatus;
  /** Ref → User._id (string form of ObjectId) */
  assignedOfficer?: string;
  department?: string;
  suggestedAction?: string;
  aiSummary?: string;
  /** ISO-8601 resolution timestamp, set when status → Resolved */
  resolvedAt?: Date;
  /** Minutes from creation to resolution */
  resolutionTimeMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: [true, 'Ticket ID is required'],
      unique: true,
      trim: true,
      match: [/^KF-\d{4}-\d{4}$/, 'Ticket ID must follow the KF-YYYY-NNNN format'],
    },
    farmerName: {
      type: String,
      required: [true, 'Farmer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      default: 'Hindi',
    },
    crop: {
      type: String,
      required: [true, 'Crop is required'],
      trim: true,
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      minlength: [10, 'Issue description must be at least 10 characters'],
      maxlength: [2000, 'Issue description cannot exceed 2000 characters'],
    },
    severity: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'] as TicketSeverity[],
        message: '{VALUE} is not a valid severity level',
      },
      required: [true, 'Severity is required'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: {
        values: [
          'Soil Health',
          'Irrigation',
          'Pest Attack',
          'Fertilizer',
          'Weather',
          'Crop Disease',
          'Seed Quality',
        ] as TicketCategory[],
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
      default: 'Crop Disease',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Review', 'Escalated', 'Resolved'] as TicketStatus[],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    assignedOfficer: { type: String, trim: true },
    department: { type: String, trim: true },
    suggestedAction: {
      type: String,
      trim: true,
      maxlength: [1000, 'Suggested action cannot exceed 1000 characters'],
    },
    aiSummary: {
      type: String,
      trim: true,
      maxlength: [2000, 'AI summary cannot exceed 2000 characters'],
    },
    resolvedAt: { type: Date },
    resolutionTimeMinutes: { type: Number, min: 0 },
  },
  { timestamps: true }
);

// ─── Middleware ───────────────────────────────────────────────────────────────

/** Auto-set resolvedAt and resolutionTimeMinutes when status changes to Resolved */
TicketSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    this.resolutionTimeMinutes = Math.round(
      (this.resolvedAt.getTime() - this.createdAt.getTime()) / 60000
    );
  }
  next();
});

// ─── Indexes ─────────────────────────────────────────────────────────────────

TicketSchema.index({ ticketId: 1 }, { unique: true });
TicketSchema.index({ status: 1 });
TicketSchema.index({ severity: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ district: 1, state: 1 });
TicketSchema.index({ assignedOfficer: 1 });
TicketSchema.index({ createdAt: -1 }); // default sort order
// Compound index for the most common dashboard query
TicketSchema.index({ status: 1, severity: 1, createdAt: -1 });
// Text index for full-text search across key fields
TicketSchema.index(
  { farmerName: 'text', ticketId: 'text', issue: 'text', district: 'text' },
  { name: 'ticket_text_search' }
);

// ─── Model ───────────────────────────────────────────────────────────────────

const TicketModel: Model<ITicket> =
  (mongoose.models.Ticket as Model<ITicket>) ||
  mongoose.model<ITicket>('Ticket', TicketSchema);

export default TicketModel;
