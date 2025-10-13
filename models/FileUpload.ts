import mongoose, { Document, Schema } from 'mongoose';

export interface IFileUpload extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FileUploadSchema = new Schema<IFileUpload>({
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
    trim: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
FileUploadSchema.index({ userId: 1 });
FileUploadSchema.index({ mimetype: 1 });
FileUploadSchema.index({ createdAt: -1 });

export default mongoose.models.FileUpload || mongoose.model<IFileUpload>('FileUpload', FileUploadSchema);
