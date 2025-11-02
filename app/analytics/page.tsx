'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, BarChart3, TrendingUp, Eye, Globe, Calendar, FileText, Users, Zap, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(220, 38, 38, 0.2)' }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(236, 72, 153, 0.2)', animationDelay: '1s' }}></div>
        </div>
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-red-200 text-lg font-medium">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Projetos',
      value: data?.totals?.projects ?? 0,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      label: 'Páginas',
      value: data?.totals?.pages ?? 0,
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)'
    },
    {
      label: 'Visualizações (Hoje)',
      value: data?.totals?.viewsToday ?? 0,
      icon: Eye,
      color: 'from-red-500 to-pink-500',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      borderColor: 'rgba(236, 72, 153, 0.3)'
    },
    {
      label: 'Total de Visualizações',
      value: data?.totals?.totalViews ?? 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      borderColor: 'rgba(168, 85, 247, 0.3)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(220, 38, 38, 0.2)' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(236, 72, 153, 0.2)', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(168, 85, 247, 0.1)', animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <div 
        className="relative sticky top-0 z-10"
        style={{ 
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(236, 72, 153, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center space-x-2 text-pink-300 hover:text-white transition-all p-2.5 rounded-xl hover:bg-pink-500/20 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">Voltar</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/50">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-red-500 bg-clip-text text-transparent">
                    Analytics
                  </h1>
                  <p className="text-pink-300/70 text-sm">Acompanhe o desempenho das suas páginas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  border: `1px solid ${stat.borderColor}`,
                  padding: '1.5rem',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${stat.borderColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: stat.bgColor }}
                  >
                    <Icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                  <Activity className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent opacity-50`} style={{ WebkitTextFillColor: 'transparent' }} />
                </div>
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value.toLocaleString('pt-BR')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pages Performance Section */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '2rem',
            marginBottom: '2rem'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-pink-400" />
                <span>Desempenho das Páginas (Últimos 7 dias)</span>
              </h2>
              <p className="text-pink-300/70 text-sm mt-1">Acompanhe as visualizações de cada página</p>
            </div>
          </div>

          {(!data?.pages || data.pages.length === 0) ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full mb-6">
                <FileText className="h-10 w-10 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-gray-400 mb-6">
                Crie e publique páginas para ver estatísticas aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.pages.map((page: any, index: number) => (
                <div
                  key={page.id || index}
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20">
                          <Globe className="h-4 w-4 text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-100 truncate">
                            {page.title || 'Sem título'}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">/{page.slug || 'sem-slug'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 ml-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            {page.views7d?.toLocaleString('pt-BR') || 0}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">visualizações 7d</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <Zap className="h-12 w-12 text-pink-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            Analytics em Tempo Real
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Monitore o desempenho das suas páginas e otimize suas campanhas com dados precisos e atualizados.
          </p>
          <button
            onClick={load}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold shadow-lg shadow-red-500/50"
          >
            <Activity className="h-5 w-5" />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
}