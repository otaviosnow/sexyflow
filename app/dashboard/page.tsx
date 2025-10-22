'use client';

import { useState, useEffect } from 'react';
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
  TrendingUp,
  Hand,
  Phone,
  Mail,
  Image,
  Video,
  Folder
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
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [deletedPages, setDeletedPages] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    publishedPages: 0,
    totalViews: 0,
    totalClicks: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pages' | 'library'>('pages');

  useEffect(() => {
    // Verificar se usuário está logado via localStorage
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    // Verificar se é admin
    const isAdminUser = userData.email === 'admin@gmail.com';
    setIsAdmin(isAdminUser);
    console.log('Usuário logado:', userData.email, 'É admin:', isAdminUser);

    // Carregar projeto atual se houver
    const project = localStorage.getItem('currentProject');
    if (!project && !isAdminUser) {
      // Usuário normal sem projeto selecionado - redirecionar para projetos
      router.push('/projects');
      return;
    }
    
    if (project) {
      const projectData = JSON.parse(project);
      setCurrentProject(projectData);
      console.log('Projeto carregado:', projectData);
    }

    // Carregar plano do usuário
    const subscription = localStorage.getItem(`subscription_${userData.id}`);
    if (subscription) {
      const subData = JSON.parse(subscription);
      const planData = {
        'plan-starter': { name: 'STARTER', displayName: 'Plano Starter', features: { subdomains: 1, pagesPerSubdomain: 3, customDomain: false } },
        'plan-pro': { name: 'PRO', displayName: 'Plano Pro', features: { subdomains: 3, pagesPerSubdomain: 8, customDomain: true } },
        'plan-enterprise': { name: 'ENTERPRISE', displayName: 'Plano Enterprise', features: { subdomains: -1, pagesPerSubdomain: -1, customDomain: true } }
      };
      setUserPlan(planData[subData.planId as keyof typeof planData] || planData['plan-starter']);
    }

    fetchDashboardData();
  }, [router]);

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      console.log('Tentando excluir página:', pageId);
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      console.log('Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        console.log('Página excluída com sucesso');
        
        // Remover página do estado local imediatamente
        setPages(prevPages => prevPages.filter(page => page.id !== pageId));
        setDeletedPages(prev => new Set(Array.from(prev).concat(pageId)));
        
        // Atualizar estatísticas
        setStats(prevStats => ({
          ...prevStats,
          totalPages: prevStats.totalPages - 1,
          publishedPages: prevStats.publishedPages - 1
        }));
        
        alert('Página excluída com sucesso!');
      } else {
        const errorData = await response.json();
        console.error('Erro ao excluir página:', errorData);
        alert(`Erro ao excluir página: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão. Tente novamente.');
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

        // Filtrar páginas excluídas
        const filteredPages = formattedPages.filter(page => !deletedPages.has(page.id));
        const publishedPages = filteredPages.filter(p => p.isPublished).length;
        
        // TODO: Implementar analytics reais
        const mockStats: DashboardStats = {
          totalPages: filteredPages.length,
          publishedPages,
          totalViews: 0, // Será implementado com analytics
          totalClicks: 0  // Será implementado com analytics
        };

        setPages(filteredPages);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Verificação de usuário já feita no useEffect

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">SexyFlow</h1>
                <p className="text-sm text-gray-400">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                <p className="text-xs text-gray-400">{currentUser?.email}</p>
                <p className="text-xs text-blue-400">Role: {isAdmin ? 'ADMIN' : 'USER'}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-sm shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                >
                  <Settings className="w-4 h-4" />
                  <span>Painel Admin</span>
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  localStorage.removeItem('currentProject');
                  router.push('/');
                }}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-gray-800/50"
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
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text text-transparent mb-3 flex items-center">
            Bem-vindo(a), {currentUser?.name || 'Usuário'}! 
            <Hand className="ml-3 w-8 h-8 text-pink-400" />
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            {isAdmin 
              ? 'Painel administrativo - Gerencie todos os usuários e projetos'
              : currentProject 
                ? `Projeto: ${currentProject.name} (${currentProject.subdomain}.sexyflow.com)`
                : 'Gerencie suas páginas de vendas e acompanhe suas métricas'
            }
          </p>
          
          {/* Botões de Ação */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Lado Esquerdo - Navegação */}
            <div className="flex flex-col gap-4">
              {!isAdmin && currentProject && (
                <button
                  onClick={() => router.push('/projects')}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-fit"
                >
                  ← Voltar aos Projetos
                </button>
              )}
            </div>
            
            {/* Lado Direito - Suporte e Automação */}
            <div className="flex flex-col gap-4 items-start lg:items-end">
              {/* WhatsApp de Suporte */}
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">Suporte:</span>
                <a 
                  href="https://wa.me/5531997783097"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                >
                  +55 31 99778-3097
                </a>
              </div>
              
              {/* Botão Automatize as Chamadas */}
              <button
                onClick={() => window.open('https://google-meet-saas-v2.onrender.com', '_blank')}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-green-500/25 hover:scale-105 w-fit"
              >
                <Phone className="w-5 h-5" />
                <span>Automatize as Chamadas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-900/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50">
            <button
              onClick={() => setActiveTab('pages')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'pages'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Páginas</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'library'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Folder className="w-5 h-5" />
              <span className="font-medium">Biblioteca</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total de Páginas</p>
                <p className="text-3xl font-bold text-white">{stats.totalPages}</p>
              </div>
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 rounded-2xl border border-red-500/30">
                <FileText className="w-7 h-7 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Publicadas</p>
                <p className="text-3xl font-bold text-white">{stats.publishedPages}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-2xl border border-green-500/30">
                <Eye className="w-7 h-7 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Visualizações</p>
                <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-2xl border border-blue-500/30">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Cliques</p>
                <p className="text-3xl font-bold text-white">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-2xl border border-purple-500/30">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'pages' && (
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Suas Páginas</h3>
              <Link
                href="/pages/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Página</span>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {pages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600/50">
                  <FileText className="w-10 h-10 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Nenhuma página criada</h4>
                <p className="text-gray-400 mb-8 text-lg">
                  Comece criando sua primeira página de vendas
                </p>
                <Link
                  href="/pages/create"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  <span>Criar Primeira Página</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-6 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/70">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                          page.type === 'presell' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          page.type === 'preview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          page.type === 'post-sale-x' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          page.type === 'delivery' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          page.type === 'post-sale-y' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {getPageTypeLabel(page.type)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{page.title}</h4>
                        <p className="text-xs text-gray-400">
                          {page.isPublished ? (
                            <span className="inline-flex items-center text-green-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Publicada
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-gray-400">
                              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
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
                          className="p-3 text-gray-400 hover:text-blue-400 transition-colors rounded-xl hover:bg-gray-700/50"
                          title="Visualizar página"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      <Link
                        href={`/pages/${page.id}/editor`}
                        className="p-3 text-gray-400 hover:text-green-400 transition-colors rounded-xl hover:bg-gray-700/50"
                        title="Editar página"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDeletePage(page.id)}
                        className="p-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-gray-700/50"
                        title="Excluir página"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Library Section */}
        {activeTab === 'library' && (
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Biblioteca de Mídia</h3>
                <Link
                  href="/dashboard/library"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-green-500/25 hover:scale-105"
                >
                  <Folder className="w-5 h-5" />
                  <span>Gerenciar Biblioteca</span>
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600/50">
                  <Folder className="w-10 h-10 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Biblioteca de Mídia</h4>
                <p className="text-gray-400 mb-8 text-lg">
                  Gerencie suas imagens e vídeos para usar nas páginas
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard/library"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-green-500/25 hover:scale-105"
                  >
                    <Image className="w-6 h-6" />
                    <span>Gerenciar Biblioteca</span>
                  </Link>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Image className="w-4 h-4" />
                      <span className="text-sm">Imagens</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">Vídeos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
