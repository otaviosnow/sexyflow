import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Page from '@/models/Page';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, slug, description, userId } = body;

    if (!title || !type || !slug) {
      return NextResponse.json(
        { error: 'Título, tipo e slug são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar se já existe uma página com o mesmo slug para o usuário
    const existingPage = await Page.findOne({ userId, slug });
    if (existingPage) {
      return NextResponse.json(
        { error: 'Já existe uma página com este slug' },
        { status: 400 }
      );
    }

    // Criar nova página
    const newPage = new Page({
      title,
      type,
      slug,
      description,
      userId,
      content: getDefaultContent(type),
      isPublished: true, // Páginas ficam no ar automaticamente
    });

    await newPage.save();

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar página:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const pages = await Page.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Erro ao buscar páginas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getDefaultContent(type: string) {
  const defaultContents = {
    presell: {
      headline: 'Transforme sua vida íntima hoje mesmo!',
      subheadline: 'Descubra os segredos que as mulheres mais desejadas do mundo usam para se sentirem irresistíveis',
      backgroundImage: '/images/presell-bg.jpg',
      whatsappButton: {
        text: 'Quero Transformar Minha Vida',
        phone: '+5511999999999',
        message: 'Olá! Vim da página SexyFlow e quero saber mais sobre a mentoria!'
      },
      facebookPixel: ''
    },
    preview: {
      headline: 'Assista ao vídeo exclusivo',
      subheadline: 'Descubra o segredo que mudou a vida de milhares de mulheres',
      videoUrl: '',
      videoHtml: '',
      facebookPixel: ''
    },
    'post-sale-x': {
      headline: 'Parabéns pela sua compra!',
      subheadline: 'Agora você tem acesso ao próximo nível',
      image: '/images/post-sale-x.jpg',
      redirectButton: {
        text: 'Acessar Próxima Etapa',
        url: '/delivery'
      },
      facebookPixel: ''
    },
    delivery: {
      headline: 'Seu produto está sendo preparado!',
      subheadline: 'Em breve você receberá tudo por email',
      content: 'Obrigada por confiar em nós! Seu acesso será enviado em até 24 horas.'
    },
    'post-sale-y': {
      headline: 'Última oportunidade!',
      subheadline: 'Complete sua transformação agora',
      html: '',
      facebookPixel: ''
    }
  };

  return defaultContents[type as keyof typeof defaultContents] || defaultContents.presell;
}
