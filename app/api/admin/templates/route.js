import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import Template from '@/models/Template'
import { authOptions } from '@/lib/auth'

// GET - Listar todos os templates (admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    await connectDB()

    const templates = await Template.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean()

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        ...template,
        id: template._id.toString(),
        _id: template._id.toString()
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar templates' },
      { status: 500 }
    )
  }
}

// POST - Criar novo template (admin)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, thumbnail, html, css, gjsData, category, isActive } = body

    // Validações
    if (!name) {
      return NextResponse.json(
        { error: 'Nome do template é obrigatório' },
        { status: 400 }
      )
    }

    await connectDB()

    // Criar template
    const template = await Template.create({
      name,
      description: description || '',
      thumbnail: thumbnail || null,
      html: html || '',
      css: css || '',
      gjsData: gjsData || {},
      category: category || 'landing-page',
      isActive: isActive || false,
      createdBy: session.user.id
    })

    return NextResponse.json({
      success: true,
      template: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        thumbnail: template.thumbnail,
        category: template.category,
        isActive: template.isActive,
        createdAt: template.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar template:', error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar template' },
      { status: 500 }
    )
  }
}

