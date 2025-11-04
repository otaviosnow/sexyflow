'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  User, 
  Crown, 
  Shield, 
  Mail, 
  Calendar,
  Layout,
  FileText,
  Trash2,
  Ban,
  CheckCircle,
  Settings,
  CreditCard,
  BarChart3,
  Globe,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  isActive: boolean;
  subscription?: {
    plan: string;
    realPlanName?: string;
    billingCycle?: 'monthly' | 'yearly';
    status: string;
    expiresAt?: string;
  };
}

interface Project {
  _id: string;
  name: string;
  subdomain: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  pagesCount: number;
}

interface Page {
  _id: string;
  title: string;
  slug: string;
  type: string;
  createdAt: string;
  isActive: boolean;
  projectId: string;
  projectName: string;
}

export default function AdminUserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'pages'>('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/projects');
      return;
    }

    if (status === 'authenticated') {
      loadUserData();
    }
  }, [status, session, router, params.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário
      const userResponse = await fetch(`/api/admin/users/${params.id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      // Carregar projetos do usuário
      const projectsResponse = await fetch(`/api/admin/users/${params.id}/projects`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }

      // Carregar páginas do usuário
      const pagesResponse = await fetch(`/api/admin/users/${params.id}/pages`);
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        setPages(pagesData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user) return;

    try {
      console.log('🔄 Alterando status do usuário:', user.email, 'de', user.isActive, 'para', !user.isActive);
      
      const response = await fetch(`/api/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta da API:', result);
        
        toast.success(`Usuário ${!user.isActive ? 'ativado' : 'desativado'} com sucesso!`);
        
        // Atualizar estado local
        setUser({ ...user, isActive: !user.isActive });
        
        // Recarregar dados do servidor para garantir consistência
        setTimeout(() => {
          console.log('🔄 Recarregando dados do usuário...');
          loadUserData();
        }, 1000);
      } else {
        const error = await response.json();
        console.error('❌ Erro na API:', error);
        toast.error('Erro ao alterar status do usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Projeto excluído com sucesso!');
        setProjects(projects.filter(p => p._id !== projectId));
      } else {
        toast.error('Erro ao excluir projeto');
      }
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Página excluída com sucesso!');
        setPages(pages.filter(p => p._id !== pageId));
      } else {
        toast.error('Erro ao excluir página');
      }
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      toast.error('Erro ao excluir página');
    }
  };

  const [adminBillingCycle, setAdminBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const changeUserPlan = async (newPlan: string) => {
    try {
      // Para ENTERPRISE, sempre usar yearly
      const billingCycle = newPlan === 'ENTERPRISE' ? 'yearly' : adminBillingCycle;
      
      const response = await fetch(`/api/admin/users/${user?._id}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan: newPlan,
          billingCycle: billingCycle
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Plano alterado para ${newPlan} (${billingCycle === 'yearly' ? 'Anual' : 'Mensal'}) com sucesso!`);
        loadUserData(); // Recarregar dados
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao alterar plano');
      }
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast.error('Erro ao alterar plano');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN' || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center text-gray-300 hover:text-pink-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user.name}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleUserStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  user.isActive
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                }`}
              >
                {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                {user.isActive ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-pink-400" />
                  <span className="text-gray-300">{user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">
                    Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {user.role === 'ADMIN' ? (
                    <>
                      <Crown className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400">Administrador</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 text-blue-400" />
                      <span className="text-blue-400">Usuário</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.isActive ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400">Conta Ativa</span>
                    </>
                  ) : (
                    <>
                      <Ban className="h-5 w-5 text-red-400" />
                      <span className="text-red-400">Conta Inativa</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">{projects.length} projeto(s)</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span className="text-gray-300">{pages.length} página(s)</span>
                </div>
              </div>
            </div>

            {/* Plan Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Gerenciar Plano</h3>
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">Plano Atual:</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {user.subscription?.plan || 'Nenhum'}
                  </span>
                  {user.subscription?.status && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.subscription.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Toggle Billing Cycle para Starter e Pro */}
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <label className="block text-xs text-gray-400 mb-2">Ciclo de Cobrança (Starter/Pro)</label>
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-xs ${adminBillingCycle === 'monthly' ? 'text-white font-medium' : 'text-gray-500'}`}>
                      Mensal
                    </span>
                    <button
                      onClick={() => setAdminBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                        adminBillingCycle === 'yearly' ? 'bg-pink-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          adminBillingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-xs ${adminBillingCycle === 'yearly' ? 'text-white font-medium' : 'text-gray-500'}`}>
                      Anual
                    </span>
                  </div>
                  {adminBillingCycle === 'yearly' && (
                    <p className="text-xs text-green-400 mt-2 text-center">
                      Duração: 365 dias
                    </p>
                  )}
                  {adminBillingCycle === 'monthly' && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Duração: 30 dias
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => changeUserPlan('STARTER')}
                    className={`w-full px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      user.subscription?.plan === 'STARTER'
                        ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                        : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                    }`}
                  >
                    {user.subscription?.plan === 'STARTER' 
                      ? `✓ STARTER (Atual - ${user.subscription?.billingCycle === 'yearly' ? 'Anual' : 'Mensal'})` 
                      : `Definir como STARTER (${adminBillingCycle === 'yearly' ? 'Anual' : 'Mensal'})`}
                  </button>
                  <button
                    onClick={() => changeUserPlan('PRO')}
                    className={`w-full px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      user.subscription?.plan === 'PRO'
                        ? 'bg-purple-500 text-white ring-2 ring-purple-400'
                        : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                    }`}
                  >
                    {user.subscription?.plan === 'PRO' 
                      ? `✓ PRO (Atual - ${user.subscription?.billingCycle === 'yearly' ? 'Anual' : 'Mensal'})` 
                      : `Definir como PRO (${adminBillingCycle === 'yearly' ? 'Anual' : 'Mensal'})`}
                  </button>
                  <button
                    onClick={() => changeUserPlan('ENTERPRISE')}
                    className={`w-full px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      user.subscription?.plan === 'ENTERPRISE'
                        ? 'bg-green-500 text-white ring-2 ring-green-400'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    }`}
                  >
                    {user.subscription?.plan === 'ENTERPRISE' 
                      ? '✓ ENTERPRISE (Atual - Anual)' 
                      : 'Definir como ENTERPRISE (Anual)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl mb-8 border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'projects', label: 'Projetos', icon: Layout },
                { id: 'pages', label: 'Páginas', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total de Projetos</p>
                      <p className="text-3xl font-bold text-white mt-2">{projects.length}</p>
                    </div>
                    <Layout className="h-12 w-12 text-pink-400" />
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total de Páginas</p>
                      <p className="text-3xl font-bold text-white mt-2">{pages.length}</p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-400" />
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Projetos Ativos</p>
                      <p className="text-3xl font-bold text-green-400 mt-2">
                        {projects.filter(p => p.isActive).length}
                      </p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Páginas Ativas</p>
                      <p className="text-3xl font-bold text-purple-400 mt-2">
                        {pages.filter(p => p.isActive).length}
                      </p>
                    </div>
                    <Eye className="h-12 w-12 text-purple-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Layout className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Este usuário não possui projetos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div key={project._id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                              <Layout className="h-6 w-6 text-pink-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                              <p className="text-sm text-gray-400">
                                {project.subdomain}.sexyflow.com.br
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteProject(project._id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            title="Excluir projeto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-4">
                          {project.description || 'Sem descrição'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{project.pagesCount} página(s)</span>
                          <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="space-y-4">
                {pages.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Este usuário não possui páginas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Título</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Projeto</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tipo</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Criado</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pages.map((page) => (
                          <tr key={page._id} className="border-b border-gray-700/50 hover:bg-gray-900/30">
                            <td className="py-3 px-4">
                              <div className="text-white font-medium">{page.title}</div>
                              <div className="text-sm text-gray-400">/{page.slug}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{page.projectName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                {page.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {page.isActive ? (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                  Ativa
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                                  Inativa
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-400">
                              {new Date(page.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => deletePage(page._id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                title="Excluir página"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

