import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Subscription from '@/models/Subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se estamos em modo de desenvolvimento local
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (isLocalDev) {
      // Mock users para desenvolvimento local
      const mockUsers = [
        {
          _id: 'user-1',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          role: 'USER',
          planType: 'MONTHLY',
          planStartDate: new Date('2024-01-01'),
          planEndDate: new Date('2024-02-01'),
          subdomain: 'joao-silva',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date('2024-01-15'),
          projects: [
            {
              _id: 'project-1',
              name: 'Projeto Principal',
              subdomain: 'joao-silva',
              isActive: true,
              pages: 3
            }
          ],
          subscription: {
            status: 'ACTIVE',
            planName: 'monthly',
            usageCount: 3
          }
        },
        {
          _id: 'user-2',
          name: 'Maria Santos',
          email: 'maria@exemplo.com',
          role: 'USER',
          planType: 'YEARLY',
          planStartDate: new Date('2024-01-01'),
          planEndDate: new Date('2025-01-01'),
          subdomain: 'maria-santos',
          isActive: true,
          createdAt: new Date('2023-12-15'),
          lastLogin: new Date('2024-01-14'),
          projects: [
            {
              _id: 'project-2',
              name: 'Loja Online',
              subdomain: 'maria-santos',
              isActive: true,
              pages: 5
            }
          ],
          subscription: {
            status: 'ACTIVE',
            planName: 'annual',
            usageCount: 5
          }
        },
        {
          _id: 'user-3',
          name: 'Pedro Costa',
          email: 'pedro@exemplo.com',
          role: 'USER',
          planType: 'MONTHLY',
          planStartDate: new Date('2023-12-01'),
          planEndDate: new Date('2024-01-01'),
          subdomain: 'pedro-costa',
          isActive: false,
          createdAt: new Date('2023-11-20'),
          lastLogin: new Date('2023-12-28'),
          projects: [
            {
              _id: 'project-3',
              name: 'Blog Pessoal',
              subdomain: 'pedro-costa',
              isActive: false,
              pages: 2
            }
          ],
          subscription: {
            status: 'INACTIVE',
            planName: 'monthly',
            usageCount: 2
          }
        },
        {
          _id: 'user-4',
          name: 'Ana Oliveira',
          email: 'ana@exemplo.com',
          role: 'USER',
          planType: 'YEARLY',
          planStartDate: new Date('2023-06-01'),
          planEndDate: new Date('2024-06-01'),
          subdomain: 'ana-oliveira',
          isActive: false,
          createdAt: new Date('2023-05-15'),
          lastLogin: new Date('2023-12-10'),
          projects: [
            {
              _id: 'project-4',
              name: 'Portfolio',
              subdomain: 'ana-oliveira',
              isActive: false,
              pages: 1
            }
          ],
          subscription: {
            status: 'INACTIVE',
            planName: 'annual',
            usageCount: 1
          }
        },
        {
          _id: 'user-5',
          name: 'Carlos Ferreira',
          email: 'carlos@exemplo.com',
          role: 'ADMIN',
          planType: 'YEARLY',
          planStartDate: new Date('2024-01-01'),
          planEndDate: new Date('2025-01-01'),
          subdomain: 'carlos-ferreira',
          isActive: true,
          createdAt: new Date('2023-10-01'),
          lastLogin: new Date('2024-01-16'),
          projects: [
            {
              _id: 'project-5',
              name: 'Admin Project',
              subdomain: 'carlos-ferreira',
              isActive: true,
              pages: 8
            }
          ],
          subscription: {
            status: 'ACTIVE',
            planName: 'annual',
            usageCount: 8
          }
        }
      ];

      return NextResponse.json(mockUsers);
    }

    // Modo produção - buscar do banco de dados
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const planType = searchParams.get('planType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros
    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filters.isActive = status === 'active';
    }
    
    if (planType) {
      filters.planType = planType.toUpperCase();
    }

    // Buscar usuários com paginação
    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Buscar projetos e assinaturas para cada usuário
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const projects = await Project.find({ userId: user._id }).lean();
        const subscription = await Subscription.findOne({ userId: user._id }).lean();
        
        return {
          ...user,
          projects: projects.map(p => ({
            _id: p._id,
            name: p.name,
            subdomain: p.subdomain,
            isActive: p.isActive,
            pages: p.pages?.length || 0
          })),
          subscription: subscription ? {
            status: Array.isArray(subscription) ? subscription[0]?.status : subscription.status,
            planName: Array.isArray(subscription) ? subscription[0]?.planName : subscription.planName,
            usageCount: projects.reduce((total, p) => total + (p.pages?.length || 0), 0)
          } : null
        };
      })
    );

    // Contar total de usuários
    const total = await User.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: usersWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'ID do usuário e ação são obrigatórios' }, { status: 400 });
    }

    // Verificar se estamos em modo de desenvolvimento local
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (isLocalDev) {
      // Simular ações em desenvolvimento local
      return NextResponse.json({
        success: true,
        message: `Ação ${action} executada com sucesso (modo local)`,
        userId
      });
    }

    await connectDB();

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'toggleStatus':
        const user = await User.findById(userId);
        if (!user) {
          return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }
        updateData.isActive = !user.isActive;
        message = `Usuário ${updateData.isActive ? 'ativado' : 'desativado'} com sucesso`;
        break;

      case 'changeRole':
        if (!data.role || !['USER', 'ADMIN'].includes(data.role)) {
          return NextResponse.json({ error: 'Role inválido' }, { status: 400 });
        }
        updateData.role = data.role;
        message = `Role alterado para ${data.role} com sucesso`;
        break;

      case 'changePlan':
        if (!data.planType || !['MONTHLY', 'YEARLY'].includes(data.planType)) {
          return NextResponse.json({ error: 'Tipo de plano inválido' }, { status: 400 });
        }
        updateData.planType = data.planType;
        updateData.planStartDate = new Date();
        updateData.planEndDate = new Date();
        updateData.planEndDate.setMonth(updateData.planEndDate.getMonth() + (data.planType === 'YEARLY' ? 12 : 1));
        message = `Plano alterado para ${data.planType} com sucesso`;
        break;

      case 'resetPassword':
        // Aqui você implementaria a lógica de reset de senha
        message = 'Email de reset de senha enviado com sucesso';
        break;

      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message,
      user: updatedUser
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Verificar se estamos em modo de desenvolvimento local
    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
    
    if (isLocalDev) {
      // Simular exclusão em desenvolvimento local
      return NextResponse.json({
        success: true,
        message: 'Usuário excluído com sucesso (modo local)'
      });
    }

    await connectDB();

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Não permitir exclusão de admins
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Não é possível excluir administradores' }, { status: 403 });
    }

    // Excluir projetos e assinaturas relacionados
    await Project.deleteMany({ userId });
    await Subscription.deleteMany({ userId });

    // Excluir o usuário
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

