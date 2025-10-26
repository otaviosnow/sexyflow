import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Project from '@/models/Project'
import Page from '@/models/Page'
import Template from '@/models/Template'
import { authOptions } from '@/lib/auth'

// GET - Estatísticas do sistema (apenas admin)
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

    // Buscar estatísticas
    const [totalUsers, totalProjects, totalPages, totalTemplates, activeTemplates] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Page.countDocuments(),
      Template.countDocuments(),
      Template.countDocuments({ isActive: true })
    ])

    // Estatísticas por plano
    const usersByPlan = await User.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ])

    const planStats = {
      starter: 0,
      pro: 0,
      enterprise: 0
    }

    usersByPlan.forEach(item => {
      if (item._id) {
        planStats[item._id] = item.count
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        totalPages,
        totalTemplates: activeTemplates,
        allTemplates: totalTemplates,
        planStats
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}

