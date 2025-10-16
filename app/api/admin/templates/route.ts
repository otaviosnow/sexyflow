import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Em desenvolvimento local, retornar templates mock
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (isLocalDev) {
      const mockTemplates = [
        {
          _id: 'template-1',
          name: 'Template Presell',
          type: 'PRESELL',
          description: 'Template para página de presell',
          content: {
            headline: 'Descubra o Segredo das Mulheres Mais Desejadas',
            subheadline: 'Como se vestir para chamar atenção',
            buttonText: 'QUERO ME TORNAR IRRESISTÍVEL',
            buttonUrl: 'https://wa.me/5511999999999'
          },
          previewImage: '',
          createdBy: { name: 'Admin', email: 'admin@local.com' },
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'template-2',
          name: 'Template Preview',
          type: 'PREVIEW',
          description: 'Template para página de prévia',
          content: {
            headline: 'Assista ao Vídeo Exclusivo',
            subheadline: 'Veja como transformar seu guarda-roupa',
            buttonText: 'ASSISTIR AGORA',
            buttonUrl: '#video'
          },
          previewImage: '',
          createdBy: { name: 'Admin', email: 'admin@local.com' },
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json(mockTemplates);
    }

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    await connectDB();

    const templates = await Template.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Em desenvolvimento local, simular criação de template
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (isLocalDev) {
      const body = await request.json();
      const { name, type, description, content, previewImage } = body;

      if (!name || !type || !content) {
        return NextResponse.json(
          { error: 'Nome, tipo e conteúdo são obrigatórios' },
          { status: 400 }
        );
      }

      // Mock template criado
      const mockTemplate = {
        _id: `template-${Date.now()}`,
        name,
        type,
        description,
        content,
        previewImage,
        createdBy: {
          _id: session.user.id,
          name: session.user.name || 'Admin',
          email: session.user.email
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json(mockTemplate, { status: 201 });
    }

    // Verificar se é admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, description, content, previewImage } = body;

    if (!name || !type || !content) {
      return NextResponse.json(
        { error: 'Nome, tipo e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    const newTemplate = new Template({
      name,
      type,
      description,
      content,
      previewImage,
      createdBy: session.user.id,
      isActive: true,
    });

    await newTemplate.save();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
