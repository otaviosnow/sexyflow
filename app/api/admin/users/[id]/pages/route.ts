import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Page from '@/models/Page';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 GET /api/admin/users/[id]/pages - Buscando páginas do usuário:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();
    console.log('✅ Conectado ao MongoDB');

    // Verificar se usuário é admin
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      console.log('❌ Acesso negado - usuário não é admin');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se usuário alvo existe
    const targetUser = await User.findById(params.id);
    if (!targetUser) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar páginas do usuário (através dos projetos)
    const pages: any = await Page.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $match: {
          'project.userId': targetUser._id
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          type: 1,
          createdAt: 1,
          isActive: 1,
          projectId: 1,
          projectName: { $arrayElemAt: ['$project.name', 0] }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    console.log(`✅ ${pages.length} páginas encontradas para o usuário`);

    return NextResponse.json(pages);
  } catch (error) {
    console.error('❌ Erro ao buscar páginas do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

