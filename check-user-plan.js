const mongoose = require('mongoose');

// Schema do User
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  planType: { type: String, enum: ['MONTHLY', 'YEARLY'] },
  planStartDate: Date,
  planEndDate: Date,
  customDomain: String,
  subdomain: String,
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function checkUserPlan() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    const user = await User.findOne({ email: 'teste3@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Ativo: ${user.isActive}`);
    console.log(`   Plano: ${user.planType || 'Nenhum plano'}`);
    
    if (user.planType) {
      console.log(`   Data de Início: ${user.planStartDate ? user.planStartDate.toLocaleDateString('pt-BR') : 'Não definida'}`);
      console.log(`   Data de Fim: ${user.planEndDate ? user.planEndDate.toLocaleDateString('pt-BR') : 'Não definida'}`);
      
      // Verificar se o plano está ativo
      const now = new Date();
      const isActive = user.planEndDate && user.planEndDate > now;
      console.log(`   Status do Plano: ${isActive ? '✅ Ativo' : '❌ Expirado'}`);
    }

    console.log(`   Domínio Personalizado: ${user.customDomain || 'Nenhum'}`);
    console.log(`   Subdomínio: ${user.subdomain || 'Nenhum'}`);
    console.log(`   Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

checkUserPlan();
