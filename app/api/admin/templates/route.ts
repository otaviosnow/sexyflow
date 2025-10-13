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
