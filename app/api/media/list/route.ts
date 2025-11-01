import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dropboxService } from '@/lib/dropbox-storage';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!dropboxService.isConfigured()) {
      return NextResponse.json({ items: [], warning: 'Dropbox inativo' });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type'); // image | video | all

    const folder = `library/users/${session.user.id}`;
    const entries: any[] = await dropboxService.listFiles(folder, 500);

    // Filtrar e preparar arquivos
    const filesToProcess = entries
      .filter(entry => entry['.tag'] === 'file')
      .map(entry => {
        const name: string = entry.name || '';
        const lower = name.toLowerCase();
        const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower);
        const isVideo = /\.(mp4|webm|ogg|mov|mkv)$/.test(lower);
        return { entry, name, isImage, isVideo };
      })
      .filter(({ isImage, isVideo }) => {
        if (type === 'image' && !isImage) return false;
        if (type === 'video' && !isVideo) return false;
        return true;
      });

    // Gerar URLs públicas em paralelo (muito mais rápido!)
    const itemsPromises = filesToProcess.map(async ({ entry, name, isImage, isVideo }) => {
      const url = await dropboxService.getPublicUrl(entry.path_lower || entry.path_display);
      if (!url) return null;
      return {
        name,
        path: entry.path_lower,
        url,
        kind: isImage ? 'image' : isVideo ? 'video' : 'file'
      };
    });

    const itemsResults = await Promise.all(itemsPromises);
    const items = itemsResults.filter(item => item !== null) as any[];

    return NextResponse.json({ items });
  } catch (e) {
    console.error('Erro ao listar mídia:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}


