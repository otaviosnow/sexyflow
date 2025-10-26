import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import Page from '@/models/Page'
import Project from '@/models/Project'
import { authOptions } from '@/lib/auth'

// GET - Listar páginas de um projeto
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID do projeto é obrigatório' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar se o projeto existe e pertence ao usuário
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    if (project.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar páginas do projeto
    const pages = await Page.find({ projectId })
      .sort({ createdAt: 1 }) // Mais antigo primeiro
      .select('-__v -gjsData') // Não enviar gjsData na listagem
      .lean()

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        ...page,
        id: page._id.toString(),
        _id: page._id.toString()
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar páginas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar páginas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova página
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, slug, description, projectId, templateId, isHomePage } = body

    // Validações
    if (!title || !slug || !projectId) {
      return NextResponse.json(
        { error: 'Título, URL e projeto são obrigatórios' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar se o projeto existe e pertence ao usuário
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    if (project.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar limite de páginas por plano
    const userPlan = session.user.plan || 'starter'
    const planLimits = {
      starter: 3,
      pro: 9,
      enterprise: 999999
    }

    const pageCount = await Page.countDocuments({ projectId })
    const limit = planLimits[userPlan.toLowerCase()] || planLimits.starter

    if (pageCount >= limit) {
      return NextResponse.json(
        { 
          error: `Você atingiu o limite de ${limit} páginas por projeto do plano ${userPlan}. Faça upgrade para criar mais páginas.`,
          limit,
          current: pageCount
        },
        { status: 403 }
      )
    }

    // Verificar se a URL já existe no projeto
    const existingPage = await Page.findOne({ projectId, slug })
    if (existingPage) {
      return NextResponse.json(
        { error: 'Já existe uma página com esta URL neste projeto' },
        { status: 400 }
      )
    }

    // Se usar template, copiar conteúdo
    let pageData = {
      title,
      slug,
      description: description || '',
      projectId,
      userId: session.user.id,
      isHomePage: isHomePage || false
    }

    if (templateId) {
      const Template = (await import('@/models/Template')).default
      const template = await Template.findById(templateId)
      
      if (template && template.isActive) {
        pageData.html = template.html
        pageData.css = template.css
        pageData.gjsData = template.gjsData
        
        // Incrementar contador de uso
        template.usageCount += 1
        await template.save()
      }
    }

    // Criar página
    const page = await Page.create(pageData)

    return NextResponse.json({
      success: true,
      page: {
        id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        description: page.description,
        isHomePage: page.isHomePage,
        isPublished: page.isPublished,
        views: page.views,
        createdAt: page.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar página:', error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar página' },
      { status: 500 }
    )
  }
}

