import mongoose from 'mongoose'

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do template é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  thumbnail: {
    type: String,
    default: null // URL da imagem de preview
  },
  // Criado por admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Criador é obrigatório']
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
  // Dados do editor GrapesJS
  gjsData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Status
  isActive: {
    type: Boolean,
    default: false // Admin pode ativar/desativar
  },
  // Categoria (futuro)
  category: {
    type: String,
    enum: ['landing-page', 'e-commerce', 'portfolio', 'blog', 'outros'],
    default: 'landing-page'
  },
  // Estatísticas
  usageCount: {
    type: Number,
    default: 0 // Quantas vezes foi usado
  }
}, {
  timestamps: true
})

// Índices
TemplateSchema.index({ isActive: 1, createdAt: -1 })
TemplateSchema.index({ category: 1, isActive: 1 })

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema)

