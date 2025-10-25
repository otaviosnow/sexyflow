const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  role: { type: String, default: 'USER' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const email = 'wesley@gmail.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ Usuário já existe:', existingUser);
      await mongoose.disconnect();
      return;
    }

    // Criar novo usuário
    const user = new User({
      email,
      password: hashedPassword,
      name: 'Wesley',
      subdomain: 'wesley',
      role: 'ADMIN',
      isActive: true,
    });

    await user.save();
    console.log('✅ Usuário criado com sucesso:', user);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

createTestUser();

