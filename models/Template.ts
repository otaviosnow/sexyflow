import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  type: 'presell' | 'preview' | 'post-sale-x' | 'delivery' | 'post-sale-y';
  name: string;
  description?: string;
  content: {
    // Desktop
    desktop: {
      html: string;
      css: string;
      js?: string;
    };
    // Tablet
    tablet: {
      html: string;
      css: string;
      js?: string;
    };
    // Mobile
    mobile: {
      html: string;
      css: string;
      js?: string;
    };
    // Configurações gerais
    settings: {
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
      breakpoints?: {
        mobile?: string;
        tablet?: string;
        desktop?: string;
      };
    };
  };
  previewImage?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  type: {
    type: String,
    enum: ['presell', 'preview', 'post-sale-x', 'delivery', 'post-sale-y'],
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
  previewImage: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
TemplateSchema.index({ type: 1 });
TemplateSchema.index({ isActive: 1 });
TemplateSchema.index({ createdBy: 1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
