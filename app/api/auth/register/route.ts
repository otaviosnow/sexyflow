import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { emailService } from '@/lib/email';
import { validateEmail, validatePassword, generateSubdomain } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Gerar subdomínio único
    let subdomain = generateSubdomain(name);
    let attempts = 0;
    while (attempts < 10) {
      const existing = await User.findOne({ subdomain });
      if (!existing) break;
      subdomain = generateSubdomain(name);
      attempts++;
    }

    // Criar usuário
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      subdomain,
    });

    // Enviar email de boas-vindas
    try {
      await emailService.sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        subdomain: user.subdomain,
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
