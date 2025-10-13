import mongoose from 'mongoose';

// Configurações específicas do MongoDB
export const mongoConfig = {
  // Configurações de conexão
  connectionOptions: {
    maxPoolSize: 10, // Manter até 10 conexões socket
    serverSelectionTimeoutMS: 5000, // Manter tentando enviar operações por 5 segundos
    socketTimeoutMS: 45000, // Fechar sockets após 45 segundos de inatividade
    bufferCommands: false, // Desabilitar buffering de comandos do mongoose
    bufferMaxEntries: 0, // Desabilitar buffering de comandos
  },

  // Configurações de índices
  indexes: {
    user: [
      { email: 1 },
      { subdomain: 1 },
      { isActive: 1 },
      { createdAt: -1 }
    ],
    template: [
      { type: 1 },
      { isActive: 1 },
      { createdAt: -1 }
    ],
    page: [
      { userId: 1, slug: 1 },
      { userId: 1 },
      { type: 1 },
      { isPublished: 1 },
      { templateId: 1 },
      { createdAt: -1 }
    ],
    fileUpload: [
      { userId: 1 },
      { mimetype: 1 },
      { createdAt: -1 }
    ],
    analytics: [
      { userId: 1 },
      { pageId: 1 },
      { event: 1 },
      { createdAt: -1 },
      { userId: 1, createdAt: -1 }
    ],
    auditLog: [
      { userId: 1 },
      { action: 1 },
      { createdAt: -1 },
      { userId: 1, createdAt: -1 }
    ]
  },

  // Configurações de validação
  validation: {
    user: {
      email: {
        type: 'string',
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },
      name: {
        type: 'string',
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100
      },
      password: {
        type: 'string',
        required: true,
        minLength: 8
      }
    },
    template: {
      type: {
        type: 'string',
        required: true,
        enum: ['PRESELL', 'PREVIEW', 'POST_SALE_X', 'DELIVERY', 'POST_SALE_Y']
      },
      name: {
        type: 'string',
        required: true,
        trim: true,
        maxLength: 100
      }
    }
  }
};

// Função para criar índices automaticamente
export async function createIndexes() {
  try {
    const { User, Template, Page, FileUpload, Analytics, AuditLog } = await import('@/models');
    
    // Criar índices para User
    for (const index of mongoConfig.indexes.user) {
      await User.collection.createIndex(index);
    }
    
    // Criar índices para Template
    for (const index of mongoConfig.indexes.template) {
      await Template.collection.createIndex(index);
    }
    
    // Criar índices para Page
    for (const index of mongoConfig.indexes.page) {
      await Page.collection.createIndex(index);
    }
    
    // Criar índices para FileUpload
    for (const index of mongoConfig.indexes.fileUpload) {
      await FileUpload.collection.createIndex(index);
    }
    
    // Criar índices para Analytics
    for (const index of mongoConfig.indexes.analytics) {
      await Analytics.collection.createIndex(index);
    }
    
    // Criar índices para AuditLog
    for (const index of mongoConfig.indexes.auditLog) {
      await AuditLog.collection.createIndex(index);
    }
    
    console.log('✅ Índices criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
  }
}

// Função para verificar conexão
export async function checkConnection() {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'Desconectado',
      1: 'Conectado',
      2: 'Conectando',
      3: 'Desconectando'
    };
    
    console.log(`📊 Status da conexão MongoDB: ${states[state as keyof typeof states]}`);
    
    if (state === 1) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Coleções encontradas: ${collections.length}`);
      
      // Estatísticas básicas
      const { User, Template, Page, Analytics } = await import('@/models');
      
      const userCount = await User.countDocuments();
      const templateCount = await Template.countDocuments();
      const pageCount = await Page.countDocuments();
      const analyticsCount = await Analytics.countDocuments();
      
      console.log(`👥 Usuários: ${userCount}`);
      console.log(`📄 Templates: ${templateCount}`);
      console.log(`📝 Páginas: ${pageCount}`);
      console.log(`📊 Analytics: ${analyticsCount}`);
    }
    
    return state === 1;
  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error);
    return false;
  }
}

// Função para limpar dados de teste (apenas desenvolvimento)
export async function clearTestData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Não é possível limpar dados em produção!');
  }
  
  try {
    const { User, Template, Page, FileUpload, Analytics, AuditLog } = await import('@/models');
    
    await Promise.all([
      User.deleteMany({ email: { $ne: 'admin@sexyflow.com' } }),
      Page.deleteMany({}),
      FileUpload.deleteMany({}),
      Analytics.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    
    console.log('🧹 Dados de teste removidos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  }
}
