'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Settings, 
  LogOut, 
  Heart,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  totalViews: number;
  totalClicks: number;
}

export default function DashboardPage() {
  const sessionResult = useSession();
  const { data: session, status } = sessionResult || {};
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    publishedPages: 0,
    totalViews: 0,
    totalClicks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recarregar dados do dashboard
        fetchDashboardData();
      } else {
        console.error('Erro ao excluir página');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/pages');
      if (response.ok) {
        const userPages = await response.json();
        
        // Converter dados da API para o formato esperado
        const formattedPages: Page[] = userPages.map((page: any) => ({
          id: page._id,
          title: page.title,
          slug: page.slug,
          type: page.type,
          isPublished: page.isPublished,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        }));

        const publishedPages = formattedPages.filter(p => p.isPublished).length;
        
        // TODO: Implementar analytics reais
        const mockStats: DashboardStats = {
          totalPages: formattedPages.length,
          publishedPages,
          totalViews: 0, // Será implementado com analytics
          totalClicks: 0  // Será implementado com analytics
        };

        setPages(formattedPages);
        setStats(mockStats);
      } else {
        console.error('Erro ao carregar páginas');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPageTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      presell: 'Presell',
      preview: 'Prévia',
      'post-sale-x': 'Pós-venda X',
      delivery: 'Entrega',
      'post-sale-y': 'Pós-venda Y'
    };
    return types[type] || type;
  };

  const getPageTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      presell: 'bg-red-100 text-red-800',
      preview: 'bg-blue-100 text-blue-800',
      'post-sale-x': 'bg-green-100 text-green-800',
      delivery: 'bg-yellow-100 text-yellow-800',
      'post-sale-y': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SexyFlow</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
              {session.user?.role === 'ADMIN' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span>Painel Admin</span>
                </button>
              )}
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo(a), {session.user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Gerencie suas páginas de vendas e acompanhe suas métricas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Páginas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPages}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedPages}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cliques</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pages Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Suas Páginas</h3>
              <Link
                href="/pages/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Página</span>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {pages.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma página criada</h4>
                <p className="text-gray-600 mb-6">
                  Comece criando sua primeira página de vendas
                </p>
                <Link
                  href="/pages/create"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Criar Primeira Página</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPageTypeColor(page.type)}`}>
                          {getPageTypeLabel(page.type)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{page.title}</h4>
                        <p className="text-xs text-gray-500">
                          {page.isPublished ? (
                            <span className="inline-flex items-center text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Publicada
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-gray-500">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                              Rascunho
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {page.isPublished && (
                        <button 
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Visualizar página"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        href={`/pages/${page.id}/editor`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar página"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir página"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
