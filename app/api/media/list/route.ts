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

    const items: any[] = [];
    for (const entry of entries) {
      if (entry['.tag'] !== 'file') continue;
      const name: string = entry.name || '';
      const lower = name.toLowerCase();
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower);
      const isVideo = /\.(mp4|webm|ogg|mov|mkv)$/.test(lower);
      if (type === 'image' && !isImage) continue;
      if (type === 'video' && !isVideo) continue;
      const url = await dropboxService.getPublicUrl(entry.path_lower || entry.path_display);
      if (!url) continue;
      items.push({ name, path: entry.path_lower, url, kind: isImage ? 'image' : isVideo ? 'video' : 'file' });
    }

    return NextResponse.json({ items });
  } catch (e) {
    console.error('Erro ao listar mídia:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}


