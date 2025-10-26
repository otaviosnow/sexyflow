import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import { authOptions } from '@/lib/auth'

// GET - Listar todos os projetos do usuário
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const projects = await Project.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean()

    return NextResponse.json({ 
      success: true,
      projects: projects.map(project => ({
        ...project,
        id: project._id.toString(),
        _id: project._id.toString()
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo projeto
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
    const { name, subdomain, description } = body

    // Validações
    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'Nome e subdomínio são obrigatórios' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar limite de projetos por plano
    const userProjects = await Project.countDocuments({ userEmail: session.user.email })
    const userPlan = session.user.plan || 'starter' // Default: starter

    const planLimits = {
      starter: 1,
      pro: 3,
      enterprise: 999999 // Ilimitado (para futuro)
    }

    const limit = planLimits[userPlan.toLowerCase()] || planLimits.starter

    if (userProjects >= limit) {
      const planNames = {
        starter: 'Starter (1 projeto)',
        pro: 'Pro (3 projetos)',
        enterprise: 'Enterprise (ilimitado)'
      }
      
      return NextResponse.json(
        { 
          error: `Você atingiu o limite de projetos do plano ${planNames[userPlan.toLowerCase()] || planNames.starter}. Faça upgrade para criar mais projetos.`,
          limit: limit,
          current: userProjects
        },
        { status: 403 }
      )
    }

    // Validar formato do subdomínio
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: 'Subdomínio deve conter apenas letras minúsculas, números e hífens' },
        { status: 400 }
      )
    }

    // Subdomínios reservados
    const reservedSubdomains = [
      'www', 'api', 'admin', 'app', 'mail', 'ftp', 
      'blog', 'shop', 'store', 'dashboard', 'panel',
      'sexyflow', 'sexy-flow', 'test', 'dev', 'staging'
    ]

    if (reservedSubdomains.includes(subdomain.toLowerCase())) {
      return NextResponse.json(
        { error: 'Este subdomínio está reservado' },
        { status: 400 }
      )
    }

    // Verificar se o subdomínio já existe
    const existingProject = await Project.findOne({ subdomain: subdomain.toLowerCase() })
    if (existingProject) {
      return NextResponse.json(
        { error: 'Este subdomínio já está em uso' },
        { status: 400 }
      )
    }

    // Criar o projeto
    const project = await Project.create({
      name,
      subdomain: subdomain.toLowerCase(),
      description: description || `Projeto ${name}`,
      userId: session.user.id,
      userEmail: session.user.email
    })

    return NextResponse.json({
      success: true,
      project: {
        id: project._id.toString(),
        name: project.name,
        subdomain: project.subdomain,
        description: project.description,
        isPublished: project.isPublished,
        createdAt: project.createdAt,
        pages: []
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    
    // Tratar erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }

    // Tratar erro de duplicação
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Este subdomínio já está em uso' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    )
  }
}

