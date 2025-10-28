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

async function assignTestPlan() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário teste3@gmail.com
    const user = await User.findOne({ email: 'teste3@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuário teste3@gmail.com não encontrado');
      await mongoose.disconnect();
      return;
    }

    console.log('👤 Usuário encontrado:', user.email);

    // Atribuir plano de teste (1 mês)
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 mês a partir de agora

    await User.findByIdAndUpdate(user._id, {
      planType: 'MONTHLY',
      planStartDate: now,
      planEndDate: endDate
    });

    console.log('✅ Plano atribuído com sucesso!');
    console.log('📊 Detalhes do plano:');
    console.log(`   Tipo: MONTHLY`);
    console.log(`   Início: ${now.toLocaleDateString('pt-BR')}`);
    console.log(`   Fim: ${endDate.toLocaleDateString('pt-BR')}`);

    // Verificar se foi salvo corretamente
    const updatedUser = await User.findById(user._id);
    console.log('🔍 Usuário atualizado:', {
      email: updatedUser.email,
      planType: updatedUser.planType,
      planStartDate: updatedUser.planStartDate,
      planEndDate: updatedUser.planEndDate
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

assignTestPlan();
