import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

// POST - Tornar usuário admin (apenas para desenvolvimento)
export async function POST(request) {
  try {
    const { email, secretKey } = await request.json()

    // Chave secreta para segurança (em produção, use variável de ambiente)
    if (secretKey !== 'sexyflow-admin-2024') {
      return NextResponse.json(
        { error: 'Chave secreta inválida' },
        { status: 403 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Tornar admin
    user.role = 'admin'
    await user.save()

    return NextResponse.json({
      success: true,
      message: `Usuário ${email} agora é admin!`,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan
      }
    })
  } catch (error) {
    console.error('Erro ao tornar usuário admin:', error)
    return NextResponse.json(
      { error: 'Erro ao tornar usuário admin' },
      { status: 500 }
    )
  }
}

