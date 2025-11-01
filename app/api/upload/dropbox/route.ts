import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dropboxService } from '@/lib/dropbox-storage';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e obter userId da sessão (não confiar no formData)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (!dropboxService.isConfigured()) {
      return NextResponse.json(
        { error: 'Dropbox não configurado. Verifique USE_DROPBOX=true e chaves DROPBOX_ACCESS_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET.' },
        { status: 500 }
      );
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'sexyflow-images';
    // Usar userId da sessão (segurança) - ignorar qualquer userId do formData
    const userId = session.user.id;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/avi',
      'video/mov'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 150MB para Dropbox)
    const maxSize = 150 * 1024 * 1024; // 150MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 150MB' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

    // Upload para Dropbox
    const result = await dropboxService.uploadFile(file, fileName, folder, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro no upload' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      fileName: fileName,
      size: file.size,
      type: file.type,
      dropboxPath: result.path
    });

  } catch (error) {
    console.error('Erro no upload para Dropbox:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Caminho do arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar que o path pertence ao usuário logado
    // Path deve conter: /library/users/{userId}/...
    const expectedPathPrefix = `/library/users/${session.user.id}/`;
    if (!path.startsWith(expectedPathPrefix)) {
      return NextResponse.json(
        { error: 'Acesso negado - arquivo não pertence ao usuário' },
        { status: 403 }
      );
    }

    const success = await dropboxService.deleteFile(path);

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar arquivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'sexyflow';
    const limit = parseInt(searchParams.get('limit') || '100');

    const files = await dropboxService.listFiles(folder, limit);

    return NextResponse.json({
      success: true,
      files: files,
      count: files.length
    });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
