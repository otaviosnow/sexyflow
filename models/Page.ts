import mongoose, { Document, Schema } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  description?: string;
  type: 'presell' | 'preview' | 'post-sale-x' | 'delivery' | 'post-sale-y';
  content: {
    elements?: any[];
    background?: any;
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
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
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
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['presell', 'preview', 'post-sale-x', 'delivery', 'post-sale-y'],
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
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
  },
}, {
  timestamps: true,
});

// Indexes
PageSchema.index({ userId: 1, slug: 1 });
PageSchema.index({ projectId: 1, slug: 1 });
PageSchema.index({ userId: 1 });
PageSchema.index({ projectId: 1 });
PageSchema.index({ type: 1 });
PageSchema.index({ isPublished: 1 });
PageSchema.index({ isActive: 1 });
PageSchema.index({ templateId: 1 });

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
