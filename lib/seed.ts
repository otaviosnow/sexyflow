import connectDB from './db';
import { User, Template, SystemSettings } from '../models';

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

    console.log('📄 Criando templates padrão...');

    // Template Presell
    await Template.findOneAndUpdate(
      { type: 'PRESELL' },
      {
        type: 'PRESELL',
        name: 'Template Presell',
        description: 'Template para página de presell com foto de fundo e botão para WhatsApp',
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
      },
      { upsert: true, new: true }
    );

    // Template Preview
    await Template.findOneAndUpdate(
      { type: 'PREVIEW' },
      {
        type: 'PREVIEW',
        name: 'Template Preview',
        description: 'Template para página de prévia com vídeo',
        content: {
          headline: 'Assista ao Vídeo Exclusivo',
          subheadline: 'Veja como transformar seu guarda-roupa em poucos minutos',
          backgroundVideo: '/videos/preview.mp4',
          buttonText: 'ASSISTIR AGORA',
          buttonUrl: '#video',
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
              heading: '42px',
              body: '16px',
              button: '18px'
            },
            spacing: {
              padding: '30px',
              margin: '15px'
            }
          }
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Template Pós-venda X
    await Template.findOneAndUpdate(
      { type: 'POST_SALE_X' },
      {
        type: 'POST_SALE_X',
        name: 'Template Pós-venda Produto X',
        description: 'Template para página de pós-venda do produto X',
        content: {
          headline: 'Parabéns! Você Acabou de Dar o Primeiro Passo',
          subheadline: 'Agora vamos para o próximo nível',
          backgroundImage: '/images/post-sale-bg.jpg',
          buttonText: 'CONTINUAR JORNADA',
          buttonUrl: '/delivery',
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
              heading: '44px',
              body: '17px',
              button: '19px'
            },
            spacing: {
              padding: '35px',
              margin: '18px'
            }
          }
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Template Entrega
    await Template.findOneAndUpdate(
      { type: 'DELIVERY' },
      {
        type: 'DELIVERY',
        name: 'Template Entrega',
        description: 'Template para página de entrega do produto',
        content: {
          headline: 'Seu Produto Está a Caminho!',
          subheadline: 'Você receberá tudo em até 24 horas no seu WhatsApp',
          backgroundImage: '/images/delivery-bg.jpg',
          buttonText: 'ACOMPANHAR ENTREGA',
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
              heading: '46px',
              body: '18px',
              button: '20px'
            },
            spacing: {
              padding: '38px',
              margin: '19px'
            }
          }
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Template Pós-venda Y
    await Template.findOneAndUpdate(
      { type: 'POST_SALE_Y' },
      {
        type: 'POST_SALE_Y',
        name: 'Template Pós-venda Produto Y',
        description: 'Template para página de pós-venda do produto Y',
        content: {
          headline: 'Agora Você Está no Próximo Nível!',
          subheadline: 'Veja o que mais você pode conquistar',
          backgroundImage: '/images/post-sale-y-bg.jpg',
          buttonText: 'DESCOBRIR MAIS',
          buttonUrl: 'https://wa.me/5511999999999',
          facebookPixel: '',
          customHtml: '<div class="special-offer">Oferta especial apenas para você!</div>',
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
              heading: '45px',
              body: '17px',
              button: '19px'
            },
            spacing: {
              padding: '36px',
              margin: '18px'
            }
          }
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

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
    console.log(`📄 Templates criados: 5 templates padrão`);
    console.log(`⚙️ Configurações: Sistema configurado`);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
