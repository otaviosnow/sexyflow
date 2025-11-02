const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Subscription = require('../models/Subscription').default;

async function migrateSubscriptions() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todas as subscriptions sem realPlanName
    const subscriptions = await Subscription.find({ realPlanName: { $exists: false } });
    console.log(`📊 Encontradas ${subscriptions.length} subscriptions sem realPlanName`);

    let updated = 0;
    for (const sub of subscriptions) {
      let realPlanName = null;
      
      // Mapear baseado no planName
      if (sub.planName === 'monthly') {
        realPlanName = 'STARTER';
      } else if (sub.planName === 'annual') {
        // Para subscriptions antigas com annual, assumir PRO por padrão
        // Você pode ajustar isso manualmente depois se necessário
        realPlanName = 'PRO';
      }

      if (realPlanName) {
        sub.realPlanName = realPlanName;
        await sub.save();
        updated++;
        console.log(`✅ Atualizada subscription ${sub._id}: ${realPlanName}`);
      } else {
        console.log(`⚠️ Subscription ${sub._id} não pôde ser mapeada (planName: ${sub.planName})`);
      }
    }

    console.log(`\n✅ Migração concluída: ${updated} subscriptions atualizadas`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrateSubscriptions();

