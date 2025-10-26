import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do projeto é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomínio é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífens'],
    maxlength: [50, 'Subdomínio não pode ter mais de 50 caracteres']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  userEmail: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  pages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }],
  settings: {
    customDomain: {
      type: String,
      default: null
    },
    favicon: {
      type: String,
      default: null
    },
    analytics: {
      googleAnalyticsId: String,
      facebookPixelId: String
    }
  },
  stats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Índices para melhor performance
ProjectSchema.index({ userId: 1, createdAt: -1 })
ProjectSchema.index({ subdomain: 1 })

// Método para verificar se o usuário é dono do projeto
ProjectSchema.methods.isOwner = function(userId) {
  return this.userId.toString() === userId.toString()
}

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)

