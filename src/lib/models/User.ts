import mongoose, { Schema, Document, Model } from 'mongoose';
import { TicketCategory } from '@/lib/types';

// ─── TypeScript Interface ────────────────────────────────────────────────────

export type UserRole = 'officer' | 'senior_officer' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  /** bcrypt-hashed password — never returned to the client */
  passwordHash: string;
  role: UserRole;
  department: string;
  /** Primary district this officer is responsible for */
  district: string;
  state: string;
  phone?: string;
  /** Two-letter initials shown in the avatar */
  initials: string;
  /** Categories this officer specialises in */
  specialisations: TicketCategory[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // never included in query results by default
    },
    role: {
      type: String,
      enum: {
        values: ['officer', 'senior_officer', 'admin'] as UserRole[],
        message: '{VALUE} is not a valid role',
      },
      default: 'officer',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
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
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    initials: {
      type: String,
      required: [true, 'Initials are required'],
      trim: true,
      uppercase: true,
      maxlength: [3, 'Initials cannot exceed 3 characters'],
    },
    specialisations: {
      type: [String],
      enum: [
        'Soil Health',
        'Irrigation',
        'Pest Attack',
        'Fertilizer',
        'Weather',
        'Crop Disease',
        'Seed Quality',
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    // Strip passwordHash from toJSON / toObject by default
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ district: 1, state: 1 });
UserSchema.index({ isActive: 1 });

// ─── Model ───────────────────────────────────────────────────────────────────

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default UserModel;
