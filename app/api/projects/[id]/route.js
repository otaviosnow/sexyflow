import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import { authOptions } from '@/lib/auth'

// GET - Buscar projeto específico
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const project = await Project.findById(params.id)
      .select('-__v')
      .lean()

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é dono do projeto
    if (project.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        id: project._id.toString(),
        _id: project._id.toString()
      }
    })
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projeto' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar projeto
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, isPublished } = body

    await connectDB()

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é dono do projeto
    if (project.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Atualizar campos permitidos
    if (name) project.name = name
    if (description !== undefined) project.description = description
    if (isPublished !== undefined) project.isPublished = isPublished

    await project.save()

    return NextResponse.json({
      success: true,
      project: {
        id: project._id.toString(),
        name: project.name,
        subdomain: project.subdomain,
        description: project.description,
        isPublished: project.isPublished,
        createdAt: project.createdAt
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar projeto
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é dono do projeto
    if (project.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    await Project.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar projeto' },
      { status: 500 }
    )
  }
}

