import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Project from '@/models/Project';
import PageViewDaily from '@/models/PageViewDaily';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    await connectDB();

    const userId = session.user.id as any;
    const projects = await Project.find({ userId }).select('_id name');
    const projectIds = projects.map(p => p._id);
    const pages = await Page.find({ userId }).select('_id title projectId slug');
    const pageIds = pages.map(p => p._id);

    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const agg = await PageViewDaily.aggregate([
      { $match: { pageId: { $in: pageIds }, date: { $gte: since7d, $lte: today } } },
      { $group: { _id: '$pageId', views7d: { $sum: '$count' } } },
    ]);

    const map7d = new Map<string, number>(agg.map((a: any) => [a._id.toString(), a.views7d]));

    const todayAgg = await PageViewDaily.aggregate([
      { $match: { pageId: { $in: pageIds }, date: today } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    const totalToday = todayAgg[0]?.total || 0;

    return NextResponse.json({
      totals: {
        projects: projects.length,
        pages: pages.length,
        viewsToday: totalToday,
      },
      pages: pages.map((p: any) => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        projectId: p.projectId,
        views7d: map7d.get(p._id.toString()) || 0,
      })),
    });
  } catch (error) {
    console.error('Erro no summary:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}


