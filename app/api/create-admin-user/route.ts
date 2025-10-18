import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Usuário já existe com este email',
          existingUser: {
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role
          }
        },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário admin
    const newUser = new User({
      name: name || 'Admin',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      subdomain: 'admin',
      planType: 'yearly',
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: '✅ Usuário admin criado com sucesso!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subdomain: newUser.subdomain,
        isActive: newUser.isActive
      },
      instructions: [
        '1. Faça login com as credenciais:',
        `   Email: ${email}`,
        `   Senha: ${password}`,
        '2. O botão "Painel Admin" deve aparecer no dashboard',
        '3. Você terá acesso completo ao painel administrativo'
      ]
    });

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Criar usuário admin com credenciais padrão
    const email = 'admin@gmail.com';
    const password = '@Teste90';
    const name = 'Admin';

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: '✅ Usuário admin já existe!',
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          subdomain: existingUser.subdomain,
          isActive: existingUser.isActive
        },
        credentials: {
          email: email,
          password: password
        },
        instructions: [
          '1. Faça login com as credenciais:',
          `   Email: ${email}`,
          `   Senha: ${password}`,
          '2. O botão "Painel Admin" deve aparecer no dashboard'
        ]
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário admin
    const newUser = new User({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      subdomain: 'admin',
      planType: 'yearly',
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: '✅ Usuário admin criado com sucesso!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subdomain: newUser.subdomain,
        isActive: newUser.isActive
      },
      credentials: {
        email: email,
        password: password
      },
      instructions: [
        '1. Faça login com as credenciais:',
        `   Email: ${email}`,
        `   Senha: ${password}`,
        '2. O botão "Painel Admin" deve aparecer no dashboard',
        '3. Você terá acesso completo ao painel administrativo'
      ]
    });

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}



