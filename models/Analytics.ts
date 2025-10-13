import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  pageId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  event: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  pageId: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: String,
    required: true,
    enum: ['page_view', 'button_click', 'form_submit', 'file_download', 'video_play', 'video_complete'],
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
AnalyticsSchema.index({ userId: 1 });
AnalyticsSchema.index({ pageId: 1 });
AnalyticsSchema.index({ event: 1 });
AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
