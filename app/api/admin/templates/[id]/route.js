import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import Template from '@/models/Template'
import { authOptions } from '@/lib/auth'

// GET - Buscar template específico (admin)
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    await connectDB()

    const template = await Template.findById(params.id)
      .populate('createdBy', 'name email')
      .lean()

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        id: template._id.toString(),
        _id: template._id.toString()
      }
    })
  } catch (error) {
    console.error('Erro ao buscar template:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar template' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar template (admin)
export async function PUT(request, { params }) {
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

    await connectDB()

    const template = await Template.findById(params.id)

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar campos
    if (name !== undefined) template.name = name
    if (description !== undefined) template.description = description
    if (thumbnail !== undefined) template.thumbnail = thumbnail
    if (html !== undefined) template.html = html
    if (css !== undefined) template.css = css
    if (gjsData !== undefined) template.gjsData = gjsData
    if (category !== undefined) template.category = category
    if (isActive !== undefined) template.isActive = isActive

    await template.save()

    return NextResponse.json({
      success: true,
      template: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        thumbnail: template.thumbnail,
        category: template.category,
        isActive: template.isActive,
        usageCount: template.usageCount
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar template:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar template' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar template (admin)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    await connectDB()

    const template = await Template.findById(params.id)

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    await Template.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Template deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar template:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar template' },
      { status: 500 }
    )
  }
}

