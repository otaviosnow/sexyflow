import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomDomain extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  verificationCode?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomDomainSchema = new Schema<ICustomDomain>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^([a-z0-9-]+\.)+[a-z]{2,}$/, 'Domínio inválido']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending',
    index: true
  },
  verificationCode: {
    type: String,
    trim: true
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
CustomDomainSchema.index({ userId: 1, status: 1 });
CustomDomainSchema.index({ domain: 1 }, { unique: true });
CustomDomainSchema.index({ projectId: 1 });

const CustomDomain = mongoose.models.CustomDomain || mongoose.model<ICustomDomain>('CustomDomain', CustomDomainSchema);

export default CustomDomain;
