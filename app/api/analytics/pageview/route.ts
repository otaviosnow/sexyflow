import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PageViewDaily from '@/models/PageViewDaily';

export async function POST(req: NextRequest) {
  try {
    const { pageId, projectId, subdomain, slug } = await req.json();
    if (!subdomain || !pageId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    await connectDB();
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    await PageViewDaily.updateOne(
      { pageId, date },
      {
        $setOnInsert: { subdomain, slug, projectId },
        $inc: { count: 1 },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao registrar pageview:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}


