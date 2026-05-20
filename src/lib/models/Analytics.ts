import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly';

/** One bucket of pre-aggregated analytics data for a given period + date. */
export interface IAnalytics extends Document {
  /** Granularity of this snapshot */
  period: AnalyticsPeriod;
  /**
   * The start of the period this snapshot covers.
   * daily   → midnight of that day
   * weekly  → Monday midnight
   * monthly → 1st of the month midnight
   */
  date: Date;
  /** Optional scope — omit for nation-wide, set for district/state roll-ups */
  district?: string;
  state?: string;

  // ── Ticket counters ──────────────────────────────────────────────────────
  totalTickets: number;
  pendingTickets: number;
  inReviewTickets: number;
  escalatedTickets: number;
  resolvedTickets: number;

  // ── Resolution metrics ───────────────────────────────────────────────────
  /** Average resolution time in minutes for tickets resolved in this period */
  avgResolutionTimeMinutes: number;
  /** Fastest resolution in this period (minutes) */
  minResolutionTimeMinutes: number;
  /** Slowest resolution in this period (minutes) */
  maxResolutionTimeMinutes: number;

  // ── Breakdowns ───────────────────────────────────────────────────────────
  /** { "Crop Disease": 12, "Pest Attack": 5, … } */
  categoryBreakdown: Map<string, number>;
  /** { "Low": 3, "Medium": 10, "High": 4, "Critical": 1 } */
  severityBreakdown: Map<string, number>;
  /** { "Maharashtra": 18, "Punjab": 6, … } */
  stateBreakdown: Map<string, number>;

  // ── AI metrics ───────────────────────────────────────────────────────────
  totalAICalls: number;
  mockAICalls: number;
  avgAIProcessingTimeMs: number;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    period: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly'] as AnalyticsPeriod[],
        message: '{VALUE} is not a valid period',
      },
      required: [true, 'Period is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    district: { type: String, trim: true },
    state: { type: String, trim: true },

    // Ticket counters
    totalTickets: { type: Number, default: 0, min: 0 },
    pendingTickets: { type: Number, default: 0, min: 0 },
    inReviewTickets: { type: Number, default: 0, min: 0 },
    escalatedTickets: { type: Number, default: 0, min: 0 },
    resolvedTickets: { type: Number, default: 0, min: 0 },

    // Resolution metrics
    avgResolutionTimeMinutes: { type: Number, default: 0, min: 0 },
    minResolutionTimeMinutes: { type: Number, default: 0, min: 0 },
    maxResolutionTimeMinutes: { type: Number, default: 0, min: 0 },

    // Breakdowns stored as flexible key→count maps
    categoryBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    severityBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    stateBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },

    // AI metrics
    totalAICalls: { type: Number, default: 0, min: 0 },
    mockAICalls: { type: Number, default: 0, min: 0 },
    avgAIProcessingTimeMs: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary lookup: "give me the daily snapshot for 2025-05-20"
AnalyticsSchema.index({ period: 1, date: -1 });
// Scoped lookup: "give me monthly snapshots for Maharashtra"
AnalyticsSchema.index({ period: 1, state: 1, date: -1 });
AnalyticsSchema.index({ period: 1, district: 1, date: -1 });
// Unique constraint: one snapshot per period + date + optional scope
AnalyticsSchema.index(
  { period: 1, date: 1, district: 1, state: 1 },
  {
    unique: true,
    // district/state can be null — use sparse to allow multiple nulls
    sparse: true,
    name: 'analytics_unique_snapshot',
  }
);

// ─── Model ───────────────────────────────────────────────────────────────────

const AnalyticsModel: Model<IAnalytics> =
  (mongoose.models.Analytics as Model<IAnalytics>) ||
  mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default AnalyticsModel;
