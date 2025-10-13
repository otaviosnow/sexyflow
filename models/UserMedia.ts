import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMedia extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnail?: string;
  category: 'image' | 'video' | 'document';
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserMediaSchema = new Schema<IUserMedia>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices
UserMediaSchema.index({ userId: 1, category: 1 });
UserMediaSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.UserMedia || mongoose.model<IUserMedia>('UserMedia', UserMediaSchema);
