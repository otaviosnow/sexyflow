import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  subdomain: string; // Nome do subdomínio (único)
  description?: string;
  isActive: boolean;
  pages: mongoose.Types.ObjectId[]; // Referências para páginas
  settings: {
    customDomain?: string;
    favicon?: string;
    analytics?: {
      googleAnalytics?: string;
      facebookPixel?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras, números e hífens'],
    minlength: 3,
    maxlength: 50,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pages: [{
    type: Schema.Types.ObjectId,
    ref: 'Page'
  }],
  settings: {
    customDomain: {
      type: String,
      trim: true
    },
    favicon: {
      type: String
    },
    analytics: {
      googleAnalytics: {
        type: String
      },
      facebookPixel: {
        type: String
      }
    }
  }
}, {
  timestamps: true
});

// Índices
ProjectSchema.index({ userId: 1, isActive: 1 });
ProjectSchema.index({ subdomain: 1 });

// Método para obter a URL completa do projeto
ProjectSchema.methods.getFullUrl = function() {
  const baseDomain = process.env.BASE_DOMAIN || 'sexyflow.onrender.com';
  return `https://${this.subdomain}.${baseDomain}`;
};

// Método para verificar se o usuário pode criar mais páginas
ProjectSchema.methods.canCreatePage = function(userSubscription: any) {
  if (!userSubscription || !userSubscription.isActive()) {
    return false;
  }
  
  const pageLimit = userSubscription.planName === 'annual' ? 10 : 5;
  return this.pages.length < pageLimit;
};

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
