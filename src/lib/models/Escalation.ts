import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── TypeScript Interface ────────────────────────────────────────────────────

export type EscalationStatus = 'Open' | 'Acknowledged' | 'Resolved';
export type EscalationPriority = 'Normal' | 'Urgent' | 'Critical';

export interface IEscalation extends Document {
  /** References Ticket.ticketId (human-readable, e.g. KF-2025-1234) */
  ticketId: string;
  reason: string;
  /** Name / ID of the officer who raised the escalation */
  escalatedBy: string;
  /** Name / department the escalation is directed to */
  escalatedTo: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  /** Optional notes added when the escalation is acknowledged or resolved */
  resolutionNote?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const EscalationSchema = new Schema<IEscalation>(
  {
    ticketId: {
      type: String,
      required: [true, 'Ticket ID is required'],
      trim: true,
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Escalation reason is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    escalatedBy: {
      type: String,
      required: [true, 'escalatedBy is required'],
      trim: true,
    },
    escalatedTo: {
      type: String,
      required: [true, 'escalatedTo is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Normal', 'Urgent', 'Critical'] as EscalationPriority[],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Normal',
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'Acknowledged', 'Resolved'] as EscalationStatus[],
        message: '{VALUE} is not a valid escalation status',
      },
      default: 'Open',
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [2000, 'Resolution note cannot exceed 2000 characters'],
    },
    acknowledgedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Middleware ───────────────────────────────────────────────────────────────

EscalationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Acknowledged' && !this.acknowledgedAt) {
      this.acknowledgedAt = new Date();
    }
    if (this.status === 'Resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
  }
  next();
});

// ─── Indexes ─────────────────────────────────────────────────────────────────

EscalationSchema.index({ ticketId: 1 });
EscalationSchema.index({ status: 1 });
EscalationSchema.index({ priority: 1 });
EscalationSchema.index({ escalatedBy: 1 });
EscalationSchema.index({ escalatedTo: 1 });
EscalationSchema.index({ createdAt: -1 });
// Compound: find all open/urgent escalations quickly
EscalationSchema.index({ status: 1, priority: 1, createdAt: -1 });

// ─── Model ───────────────────────────────────────────────────────────────────

const EscalationModel: Model<IEscalation> =
  (mongoose.models.Escalation as Model<IEscalation>) ||
  mongoose.model<IEscalation>('Escalation', EscalationSchema);

export default EscalationModel;
