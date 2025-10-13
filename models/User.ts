import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  planType?: 'MONTHLY' | 'YEARLY';
  planStartDate?: Date;
  planEndDate?: Date;
  customDomain?: string;
  subdomain?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  planType: {
    type: String,
    enum: ['MONTHLY', 'YEARLY'],
  },
  planStartDate: {
    type: Date,
  },
  planEndDate: {
    type: Date,
  },
  customDomain: {
    type: String,
    trim: true,
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ subdomain: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
