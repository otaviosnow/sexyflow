import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: string;
  planName: 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  gracePeriodEnd?: Date; // 7 dias após expiração
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  planId: {
    type: String,
    required: true,
    enum: ['monthly', 'annual']
  },
  planName: {
    type: String,
    required: true,
    enum: ['monthly', 'annual']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'expired'],
    default: 'active'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeCustomerId: {
    type: String
  },
  gracePeriodEnd: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para performance
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });
SubscriptionSchema.index({ gracePeriodEnd: 1 });

// Método para verificar se a assinatura está ativa (incluindo período de graça)
SubscriptionSchema.methods.isActive = function() {
  const now = new Date();
  
  // Se está no período ativo
  if (this.status === 'active' && this.currentPeriodEnd > now) {
    return true;
  }
  
  // Se está no período de graça (7 dias após expiração)
  if (this.gracePeriodEnd && this.gracePeriodEnd > now) {
    return true;
  }
  
  return false;
};

// Método para verificar se está no período de graça
SubscriptionSchema.methods.isInGracePeriod = function() {
  const now = new Date();
  return this.gracePeriodEnd && this.gracePeriodEnd > now && this.currentPeriodEnd < now;
};

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
