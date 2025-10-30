import mongoose, { Document, Schema } from 'mongoose';

export interface IPageViewDaily extends Document {
  pageId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  subdomain: string;
  slug: string;
  date: string; // YYYY-MM-DD
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const PageViewDailySchema = new Schema<IPageViewDaily>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', index: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  subdomain: { type: String, required: true, index: true },
  slug: { type: String, required: true },
  date: { type: String, required: true, index: true },
  count: { type: Number, default: 0 },
}, { timestamps: true });

PageViewDailySchema.index({ pageId: 1, date: 1 }, { unique: true, partialFilterExpression: { pageId: { $exists: true } } });
PageViewDailySchema.index({ subdomain: 1, slug: 1, date: 1 });

export default mongoose.models.PageViewDaily || mongoose.model<IPageViewDaily>('PageViewDaily', PageViewDailySchema);


