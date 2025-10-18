const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema do usuário (simplificado)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isActive: { type: Boolean, default: true },
  subdomain: { type: String, unique: true },
  planType: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  planStartDate: { type: Date },
  planEndDate: { type: Date },
  customDomain: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sexyflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    const email = 'admin@gmail.com';
    const password = '@Teste90';
    const name = 'Admin';

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log('✅ Usuário admin já existe!');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Nome:', existingUser.name);
      console.log('🔑 Role:', existingUser.role);
      console.log('🌐 Subdomain:', existingUser.subdomain);
      console.log('✅ Ativo:', existingUser.isActive);
      console.log('\n📋 Credenciais para login:');
      console.log(`   Email: ${email}`);
      console.log(`   Senha: ${password}`);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário admin
    const newUser = new User({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      subdomain: 'admin',
      planType: 'yearly',
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
    });

    await newUser.save();

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email:', newUser.email);
    console.log('👤 Nome:', newUser.name);
    console.log('🔑 Role:', newUser.role);
    console.log('🌐 Subdomain:', newUser.subdomain);
    console.log('✅ Ativo:', newUser.isActive);
    console.log('\n📋 Credenciais para login:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('\n📝 Instruções:');
    console.log('1. Faça login com as credenciais acima');
    console.log('2. O botão "Painel Admin" deve aparecer no dashboard');
    console.log('3. Você terá acesso completo ao painel administrativo');

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    if (error.code === 11000) {
      console.log('💡 O usuário já existe (erro de duplicação)');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };



