import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  key: string;
  value: any;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: { createdAt: false, updatedAt: true },
});

// Indexes
SystemSettingsSchema.index({ key: 1 });

export default mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
