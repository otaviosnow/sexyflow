/**
 * 🌱 SEED DATABASE - Configuração Inicial
 * 
 * ⚠️ IMPORTANTE: Este script deve ser executado APENAS UMA VEZ na configuração inicial!
 * 
 * O que este seed faz:
 * - ✅ Cria usuário admin (usa upsert - sempre atualiza)
 * - ✅ Verifica templates existentes (NÃO sobrescreve)
 * - ✅ Cria template inicial APENAS se banco estiver vazio
 * - ✅ Configura sistema (usa upsert - sempre atualiza)
 * 
 * 🚫 O que este seed NÃO faz mais:
 * - ❌ NÃO recria templates deletados
 * - ❌ NÃO sobrescreve templates existentes
 * - ❌ NÃO deve ser executado automaticamente no deploy
 * 
 * 💡 Para criar novos templates: Use o painel admin em /admin/templates/create
 */

import connectDB from './db';
import { User, Template, SystemSettings } from '@/models';

async function seedDatabase() {
  try {
    console.log('🌱 Conectando ao banco de dados...');
    await connectDB();

    console.log('👤 Criando usuário admin...');
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@sexyflow.com' },
      {
        name: 'Admin SexyFlow',
        email: 'admin@sexyflow.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeV5oI7Q7Q7Q7Q7Q7', // password: admin123
        role: 'ADMIN',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log('📄 Verificando templates padrão...');
    
    // Verificar se já existem templates
    const existingTemplatesCount = await Template.countDocuments();
    
    if (existingTemplatesCount > 0) {
      console.log(`ℹ️ Já existem ${existingTemplatesCount} templates no banco. Pulando criação automática.`);
      console.log('💡 Nota: Templates existentes não serão sobrescritos.');
    } else {
      console.log('🆕 Nenhum template encontrado. Criando templates padrão...');
      
      // Template Presell - Criar apenas se NÃO existir
      const presellExists = await Template.findOne({ type: 'PRESELL' });
      if (!presellExists) {
        await Template.create({
          type: 'PRESELL',
          name: 'Template Presell',
          description: 'Template para página de presell com foto de fundo e botão para WhatsApp',
          createdBy: adminUser._id,
          content: {
            headline: 'Descubra o Segredo das Mulheres Mais Desejadas',
            subheadline: 'Como se vestir para chamar atenção e aumentar sua autoestima',
            backgroundImage: '/images/presell-bg.jpg',
            buttonText: 'QUERO ME TORNAR IRRESISTÍVEL',
            buttonUrl: 'https://wa.me/5511999999999',
            facebookPixel: '',
            colors: {
              primary: '#dc2626',
              secondary: '#ec4899',
              text: '#ffffff',
              background: '#000000'
            },
            fonts: {
              heading: 'Playfair Display',
              body: 'Inter'
            },
            styles: {
              fontSize: {
                heading: '48px',
                body: '18px',
                button: '20px'
              },
              spacing: {
                padding: '40px',
                margin: '20px'
              }
            }
          },
          isActive: true,
        });
        console.log('✅ Template Presell criado');
      }
    }

    // Nota: Outros templates podem ser criados manualmente pelo admin no painel
    // Não criamos mais templates automaticamente para evitar sobrescrever templates customizados

    console.log('⚙️ Configurando sistema...');
    
    // Configurações do sistema
    await SystemSettings.findOneAndUpdate(
      { key: 'app_name' },
      { key: 'app_name', value: 'SexyFlow' },
      { upsert: true }
    );

    await SystemSettings.findOneAndUpdate(
      { key: 'app_description' },
      { key: 'app_description', value: 'Automatize suas vendas no nicho hot' },
      { upsert: true }
    );

    await SystemSettings.findOneAndUpdate(
      { key: 'plan_limits' },
      { 
        key: 'plan_limits', 
        value: {
          monthly: { pages: 5, price: 97 },
          yearly: { pages: 10, price: 970 }
        }
      },
      { upsert: true }
    );

    await SystemSettings.findOneAndUpdate(
      { key: 'upload_limits' },
      { 
        key: 'upload_limits', 
        value: {
          maxSize: 2147483648, // 2GB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
        }
      },
      { upsert: true }
    );

    console.log('✅ Seed concluído com sucesso!');
    console.log(`👤 Admin criado: admin@sexyflow.com (senha: admin123)`);
    console.log(`📄 Templates: Verificados (não sobrescrevemos templates existentes)`);
    console.log(`⚙️ Configurações: Sistema configurado`);
    console.log(`💡 Nota: Crie templates manualmente pelo painel admin`);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
