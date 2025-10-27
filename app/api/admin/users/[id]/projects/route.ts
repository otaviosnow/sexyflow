import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 GET /api/admin/users/[id]/projects - Buscando projetos do usuário:', params.id);
    
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

    // Buscar projetos do usuário
    const projects: any = await Project.find({ userId: params.id })
      .select('name subdomain description createdAt isActive')
      .sort({ createdAt: -1 })
      .lean();

    // Adicionar contagem de páginas para cada projeto
    const projectsWithPagesCount = await Promise.all(
      projects.map(async (project: any) => {
        const pagesCount = await Project.aggregate([
          { $match: { _id: project._id } },
          { $lookup: { from: 'pages', localField: '_id', foreignField: 'projectId', as: 'pages' } },
          { $project: { pagesCount: { $size: '$pages' } } }
        ]);
        
        return {
          ...project,
          pagesCount: pagesCount[0]?.pagesCount || 0
        };
      })
    );

    console.log(`✅ ${projectsWithPagesCount.length} projetos encontrados para o usuário`);

    return NextResponse.json(projectsWithPagesCount);
  } catch (error) {
    console.error('❌ Erro ao buscar projetos do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

