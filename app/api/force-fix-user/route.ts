import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 POST /api/force-fix-user - Correção forçada do usuário');
    
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

    // Buscar o usuário específico
    const testUser = await User.findOne({ email: 'teste3@gmail.com' });
    if (!testUser) {
      console.log('❌ Usuário teste3@gmail.com não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('🔍 Usuário encontrado:', {
      id: testUser._id,
      email: testUser.email,
      isActive: testUser.isActive,
      isActiveType: typeof testUser.isActive
    });

    // Verificar a estrutura do documento no banco
    const rawUser = await User.collection.findOne({ email: 'teste3@gmail.com' });
    console.log('🔍 Documento bruto no banco:', {
      isActive: rawUser?.isActive,
      isActiveType: typeof rawUser?.isActive,
      hasIsActiveField: 'isActive' in (rawUser || {}),
      allFields: Object.keys(rawUser || {})
    });

    // Forçar atualização usando updateOne diretamente na collection
    const updateResult = await User.collection.updateOne(
      { _id: testUser._id },
      { $set: { isActive: true } }
    );

    console.log('🔧 Resultado da atualização forçada:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    // Verificar novamente após a atualização
    const updatedRawUser = await User.collection.findOne({ email: 'teste3@gmail.com' });
    console.log('🔍 Documento após atualização forçada:', {
      isActive: updatedRawUser?.isActive,
      isActiveType: typeof updatedRawUser?.isActive
    });

    // Buscar usando Mongoose para ver se funciona
    const mongooseUser = await User.findById(testUser._id);
    console.log('🔍 Usuário via Mongoose após atualização:', {
      isActive: mongooseUser?.isActive,
      isActiveType: typeof mongooseUser?.isActive
    });

    return NextResponse.json({
      message: 'Correção forçada executada',
      beforeUpdate: {
        isActive: testUser.isActive,
        isActiveType: typeof testUser.isActive
      },
      afterUpdate: {
        isActive: updatedRawUser?.isActive,
        isActiveType: typeof updatedRawUser?.isActive
      },
      mongooseResult: {
        isActive: mongooseUser?.isActive,
        isActiveType: typeof mongooseUser?.isActive
      },
      updateResult: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      }
    });

  } catch (error) {
    console.error('❌ Erro na correção forçada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
