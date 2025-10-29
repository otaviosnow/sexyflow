import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PATCH /api/admin/users/[id]/status - Alterando status do usuário:', params.id);
    
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

    const body = await request.json();
    const { isActive } = body;

    console.log('📦 Novo status:', isActive);

    // Não permitir desativar a si mesmo
    if (params.id === session.user.id) {
      console.log('❌ Não é possível alterar status do seu próprio usuário');
      return NextResponse.json(
        { error: 'Não é possível alterar status do seu próprio usuário' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await User.findById(params.id);
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Atualizar status usando findByIdAndUpdate para garantir persistência
    const oldStatus = user.isActive;
    
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: { isActive: isActive } },
      { new: true, runValidators: true }
    );

    console.log(`✅ Status do usuário ${user.email} alterado de ${oldStatus} para: ${isActive ? 'ativo' : 'inativo'}`);

    // Verificar se a atualização foi persistida
    const verificationUser: any = await User.findById(params.id).select('isActive').lean();
    console.log(`🔍 Verificação pós-atualização - Status no banco: ${verificationUser?.isActive}`);

    return NextResponse.json({ 
      message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Erro ao alterar status do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

