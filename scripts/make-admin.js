const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Importar o modelo User
const User = require('../models/User').default;

async function makeAdmin() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Buscar o usuário teste90@gmail.com
    const user = await User.findOne({ email: 'teste90@gmail.com' });
    
    if (!user) {
      console.log('Usuário teste90@gmail.com não encontrado');
      return;
    }

    // Tornar administrador
    user.role = 'ADMIN';
    await user.save();

    console.log('✅ Usuário teste90@gmail.com agora é ADMINISTRADOR');
    console.log('Dados do usuário:', {
      email: user.email,
      name: user.name,
      role: user.role,
      subdomain: user.subdomain
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

makeAdmin();
