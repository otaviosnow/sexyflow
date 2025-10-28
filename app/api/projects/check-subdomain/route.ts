import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain } = body;

    if (!subdomain) {
      return NextResponse.json({ 
        error: 'Subdomínio é obrigatório' 
      }, { status: 400 });
    }

    // Validar formato do subdomínio
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({ 
        available: false,
        message: 'Subdomínio deve conter apenas letras minúsculas, números e hífens'
      });
    }

    // Verificar tamanho
    if (subdomain.length < 3 || subdomain.length > 50) {
      return NextResponse.json({ 
        available: false,
        message: 'Subdomínio deve ter entre 3 e 50 caracteres'
      });
    }

    await connectDB();

    // Verificar se existe QUALQUER projeto com esse subdomínio (independente do isActive)
    const anyExistingProject = await Project.findOne({ 
      subdomain: subdomain.toLowerCase()
    });

    if (anyExistingProject) {
      // Se o projeto está ativo, retornar indisponível
      if (anyExistingProject.isActive === true) {
        return NextResponse.json({ 
          available: false,
          message: 'Este subdomínio já está em uso'
        });
      }
      
      // Se o projeto não está ativo (false, null, undefined), considerar disponível para reutilização
      return NextResponse.json({ 
        available: true,
        message: 'Subdomínio disponível (pode reutilizar)'
      });
    }

    return NextResponse.json({ 
      available: true,
      message: 'Subdomínio disponível'
    });

  } catch (error) {
    console.error('Erro ao verificar subdomínio:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao verificar disponibilidade do subdomínio',
        available: false
      },
      { status: 500 }
    );
  }
}

