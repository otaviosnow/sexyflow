'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') load();
  }, [status]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/summary');
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 py-4">
            <button onClick={() => router.push('/projects')} className="text-gray-600 hover:text-gray-900 text-sm flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos Projetos
            </button>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5"/>Analytics</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600">Projetos</p>
            <p className="text-3xl font-bold text-gray-900">{data?.totals?.projects ?? 0}</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600">Páginas</p>
            <p className="text-3xl font-bold text-gray-900">{data?.totals?.pages ?? 0}</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600">Visualizações (Hoje)</p>
            <p className="text-3xl font-bold text-gray-900">{data?.totals?.viewsToday ?? 0}</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Páginas - últimos 7 dias</h2>
          <div className="divide-y">
            {(data?.pages || []).map((p: any) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">/{p.slug}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-900">{p.views7d}</p>
                  <p className="text-xs text-gray-500">views 7d</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


