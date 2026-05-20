import mongoose, { Schema, Document, Model } from 'mongoose';
import { TicketCategory, TicketSeverity } from '@/lib/types';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export type AIOperation = 'classify' | 'chat' | 'summarise' | 'suggest';

export interface IAIClassification {
  crop: string;
  category: TicketCategory | string;
  severity: TicketSeverity | string;
  department: string;
  suggestedAction: string;
  /** 0–1 confidence score returned by the model */
  confidence: number;
}

export interface IAILog extends Omit<Document, 'model'> {
  /** References Ticket.ticketId — 'pending' until the ticket is saved */
  ticketId: string;
  operation: AIOperation;
  /** The full prompt sent to the model */
  prompt: string;
  /** Raw text response from the model */
  response: string;
  /** Structured classification output (present for classify operations) */
  classification?: IAIClassification;
  /** Groq model identifier used for this call */
  model: string;
  /** Wall-clock time in milliseconds for the API round-trip */
  processingTimeMs: number;
  /** Whether the response was served from a mock / fallback */
  isMock: boolean;
  /** HTTP status returned by the upstream AI provider */
  providerStatus?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schema ───────────────────────────────────────────────────────────────

const ClassificationSchema = new Schema<IAIClassification>(
  {
    crop: { type: String, trim: true },
    category: { type: String, trim: true },
    severity: { type: String, trim: true },
    department: { type: String, trim: true },
    suggestedAction: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const AILogSchema = new Schema<IAILog>(
  {
    ticketId: {
      type: String,
      required: [true, 'Ticket ID is required'],
      trim: true,
    },
    operation: {
      type: String,
      enum: {
        values: ['classify', 'chat', 'summarise', 'suggest'] as AIOperation[],
        message: '{VALUE} is not a valid AI operation',
      },
      required: [true, 'Operation type is required'],
      default: 'classify',
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      maxlength: [10000, 'Prompt cannot exceed 10 000 characters'],
    },
    response: {
      type: String,
      required: [true, 'Response is required'],
      maxlength: [10000, 'Response cannot exceed 10 000 characters'],
    },
    classification: { type: ClassificationSchema },
    model: {
      type: String,
      required: [true, 'Model identifier is required'],
      trim: true,
      default: 'llama-3.3-70b-versatile',
    },
    processingTimeMs: {
      type: Number,
      required: true,
      min: [0, 'Processing time cannot be negative'],
      default: 0,
    },
    isMock: { type: Boolean, default: false },
    providerStatus: { type: Number },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

AILogSchema.index({ ticketId: 1 });
AILogSchema.index({ operation: 1 });
AILogSchema.index({ isMock: 1 });
AILogSchema.index({ createdAt: -1 });
// Compound: audit trail per ticket ordered by time
AILogSchema.index({ ticketId: 1, createdAt: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const AILogModel: Model<IAILog> =
  (mongoose.models.AILog as Model<IAILog>) ||
  mongoose.model<IAILog>('AILog', AILogSchema);

export default AILogModel;
