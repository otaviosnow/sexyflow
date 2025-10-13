import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  type: 'PRESELL' | 'PREVIEW' | 'POST_SALE_X' | 'DELIVERY' | 'POST_SALE_Y';
  name: string;
  description?: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  type: {
    type: String,
    enum: ['PRESELL', 'PREVIEW', 'POST_SALE_X', 'DELIVERY', 'POST_SALE_Y'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  content: {
    type: Schema.Types.Mixed,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
TemplateSchema.index({ type: 1 });
TemplateSchema.index({ isActive: 1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
