import mongoose, { Document, Schema } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  type: 'PRESELL' | 'PREVIEW' | 'POST_SALE_X' | 'DELIVERY' | 'POST_SALE_Y';
  content: {
    headline?: string;
    subheadline?: string;
    backgroundImage?: string;
    backgroundVideo?: string;
    buttonText?: string;
    buttonUrl?: string;
    facebookPixel?: string;
    customHtml?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      text?: string;
      background?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
    styles?: {
      fontSize?: {
        heading?: string;
        body?: string;
        button?: string;
      };
      spacing?: {
        padding?: string;
        margin?: string;
      };
    };
  };
  isPublished: boolean;
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['PRESELL', 'PREVIEW', 'POST_SALE_X', 'DELIVERY', 'POST_SALE_Y'],
    required: true,
  },
  content: {
    type: Schema.Types.Mixed,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
PageSchema.index({ userId: 1, slug: 1 }, { unique: true });
PageSchema.index({ userId: 1 });
PageSchema.index({ type: 1 });
PageSchema.index({ isPublished: 1 });
PageSchema.index({ templateId: 1 });

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
