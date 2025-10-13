import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import UserMedia from '@/models/UserMedia';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = { userId: session.user.id };
    if (category && ['image', 'video', 'document'].includes(category)) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      UserMedia.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserMedia.countDocuments(query)
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar mídias:', error);
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

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Verificar tamanho do arquivo (máximo 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 2GB)' }, { status: 400 });
    }

    // Verificar tipo de arquivo
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/avi', 'video/mov'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `user_${session.user.id}_${timestamp}.${extension}`;

    // Salvar arquivo (implementação básica - em produção usar AWS S3 ou similar)
    const uploadPath = `public/uploads/user-media/${filename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Simular salvamento (em produção seria diferente)
    const url = `/uploads/user-media/${filename}`;

    // Determinar categoria
    const category = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'document';

    // Salvar no banco
    const userMedia = new UserMedia({
      userId: session.user.id,
      filename,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      url,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic
    });

    await userMedia.save();

    return NextResponse.json({
      success: true,
      media: userMedia
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
