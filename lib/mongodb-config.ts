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
  }
};

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