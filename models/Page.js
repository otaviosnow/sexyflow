import mongoose from 'mongoose'

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título da página é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres']
  },
  slug: {
    type: String,
    required: [true, 'URL da página é obrigatória'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'URL deve conter apenas letras minúsculas, números e hífens']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Projeto é obrigatório']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  // Conteúdo HTML/CSS/JS do GrapesJS
  html: {
    type: String,
    default: ''
  },
  css: {
    type: String,
    default: ''
  },
  // Dados do editor GrapesJS (para edição posterior)
  gjsData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Configurações
  isHomePage: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  favicon: {
    type: String,
    default: null
  },
  // Estatísticas
  views: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Índices
PageSchema.index({ projectId: 1, slug: 1 }, { unique: true })
PageSchema.index({ projectId: 1, isHomePage: 1 })
PageSchema.index({ userId: 1, createdAt: -1 })

// Garantir que apenas uma página seja home por projeto
PageSchema.pre('save', async function(next) {
  if (this.isHomePage && this.isModified('isHomePage')) {
    await mongoose.model('Page').updateMany(
      { projectId: this.projectId, _id: { $ne: this._id } },
      { $set: { isHomePage: false } }
    )
  }
  next()
})

export default mongoose.models.Page || mongoose.model('Page', PageSchema)

