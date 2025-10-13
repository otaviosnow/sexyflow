import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import UserMedia from '@/models/UserMedia';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const media = await UserMedia.findOne({
      _id: params.id,
      userId: session.user.id
    });

    if (!media) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { tags, isPublic, originalName } = body;

    const media = await UserMedia.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id
      },
      {
        ...(tags !== undefined && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        ...(originalName !== undefined && { originalName })
      },
      { new: true }
    );

    if (!media) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      media
    });
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const media = await UserMedia.findOneAndDelete({
      _id: params.id,
      userId: session.user.id
    });

    if (!media) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    // Aqui você também deletaria o arquivo físico do servidor
    // TODO: Implementar deletar arquivo físico

    return NextResponse.json({
      success: true,
      message: 'Mídia excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
