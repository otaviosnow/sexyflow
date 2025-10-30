import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Page from '@/models/Page';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('email name avatarUrl');
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const projectsCount = await Project.countDocuments({ userId: user._id });
    const pagesCount = await Page.countDocuments({ userId: user._id });

    return NextResponse.json({
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || '',
      projectsCount,
      pagesCount,
    });
  } catch (error) {
    console.error('Erro no GET /api/profile:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { avatarUrl } = body || {};

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, { $set: { avatarUrl } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro no PUT /api/profile:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}


