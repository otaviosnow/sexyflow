'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Globe,
  BarChart3,
  Settings,
  ExternalLink,
  Calendar,
  Users,
  X,
  FileText,
  Palette
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  subdomain: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  pages: Page[];
}

interface Page {
  _id: string;
  title: string;
  slug: string;
  type: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  _id: string;
  name: string;
  description: string;
  content: any;
  isActive: boolean;
  createdAt: string;
}

export default function ProjectDashboard({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [quickEditPage, setQuickEditPage] = useState<Page | null>(null);
  const [quickEditTitle, setQuickEditTitle] = useState('');
  const [quickEditSlug, setQuickEditSlug] = useState('');
  const [quickEditLoading, setQuickEditLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Só carregar dados se ainda não foram carregados
    if (status === 'authenticated' && session && !dataLoaded) {
      loadProject();
    }
  }, [status, session, router, dataLoaded]);

  // Preencher campos quando abrir edição rápida
  useEffect(() => {
    if (quickEditPage) {
      setQuickEditTitle(quickEditPage.title);
      setQuickEditSlug(quickEditPage.slug);
    }
  }, [quickEditPage]);

  const loadProject = async () => {
    try {
      setLoading(true);
      
      // Buscar projeto
      const projectResponse = await fetch(`/api/projects/${params.id}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Buscar páginas do projeto
      const pagesResponse = await fetch(`/api/projects/${params.id}/pages`);
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        setPages(pagesData);
      }
      
      // Marcar dados como carregados
      setDataLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.filter((template: Template) => template.isActive));
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const refreshData = async () => {
    setDataLoaded(false);
    await loadProject();
  };

  const handleTogglePublish = async (pageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      });

      if (response.ok) {
        await refreshData();
        alert(`Página ${!currentStatus ? 'publicada' : 'despublicada'} com sucesso!`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao alterar status da página');
      }
    } catch (error) {
      console.error('Erro ao alterar status da página:', error);
      alert('Erro ao alterar status da página');
    }
  };

  const handleQuickEdit = async () => {
    if (!quickEditPage || !quickEditTitle || !quickEditSlug) {
      alert('Título e URL são obrigatórios');
      return;
    }

    try {
      setQuickEditLoading(true);
      const response = await fetch(`/api/pages/${quickEditPage._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quickEditTitle,
          slug: quickEditSlug
        }),
      });

      if (response.ok) {
        await refreshData();
        setQuickEditPage(null);
        setQuickEditTitle('');
        setQuickEditSlug('');
        alert('Página atualizada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar página');
      }
    } catch (error) {
      console.error('Erro ao atualizar página:', error);
      alert('Erro ao atualizar página');
    } finally {
      setQuickEditLoading(false);
    }
  };

  const handleCreateBlankPage = async () => {
    try {
      // Gerar dados automáticos
      const timestamp = Date.now();
      const pageNumber = pages.length + 1;
      
      const response = await fetch(`/api/projects/${params.id}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Minha Página ${pageNumber}`,
          slug: `minha-pagina-${pageNumber}-${timestamp}`,
          type: 'presell',
          content: {
            background: {
              type: 'color',
              value: '#ffffff'
            },
            sections: []
          },
          isPublished: false
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        console.log('📄 Página criada:', newPage);
        console.log('📄 ID da página:', newPage.page?._id || newPage._id);
        
        const pageId = newPage.page?._id || newPage._id;
        if (!pageId) {
          console.error('❌ ID da página não encontrado na resposta:', newPage);
          alert('Erro: ID da página não encontrado');
          return;
        }
        
        router.push(`/projects/${params.id}/pages/${pageId}/editor`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar página');
      }
    } catch (error) {
      console.error('Erro ao criar página:', error);
      alert('Erro ao criar página');
    }
  };

  const handleCreateFromTemplate = async (template: Template) => {
    try {
      const timestamp = Date.now();
      const pageNumber = pages.length + 1;
      
      const response = await fetch(`/api/projects/${params.id}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: template.name,
          slug: `${template.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${pageNumber}-${timestamp}`,
          type: 'presell',
          content: template.content,
          isPublished: false
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        console.log('📄 Página criada do template:', newPage);
        console.log('📄 ID da página:', newPage.page?._id || newPage._id);
        
        const pageId = newPage.page?._id || newPage._id;
        if (!pageId) {
          console.error('❌ ID da página não encontrado na resposta:', newPage);
          alert('Erro: ID da página não encontrado');
          return;
        }
        
        setShowCreateModal(false);
        setShowTemplates(false);
        router.push(`/projects/${params.id}/pages/${pageId}/editor`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar página');
      }
    } catch (error) {
      console.error('Erro ao criar página:', error);
      alert('Erro ao criar página');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingPageId(pageId);
      
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recarregar dados para garantir consistência
        await refreshData();
        alert('Página excluída com sucesso!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao excluir página');
      }
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      alert('Erro ao excluir página. Verifique a conexão.');
    } finally {
      setDeletingPageId(null);
    }
  };


  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Projeto não encontrado</h1>
          <button
            onClick={() => router.push('/projects')}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg shadow-red-500/50"
          >
            Voltar aos Projetos
          </button>
        </div>
      </div>
    );
  }

  // Usar rota path-based em vez de subdomínio dinâmico no Render
  const projectUrl = `/site/${project.subdomain}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar aos Projetos
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600 text-sm">{projectUrl}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(projectUrl, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Visitar Site</span>
              </button>
              
              <button
                onClick={() => router.push(`/projects/${params.id}/settings`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Páginas</p>
                <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Páginas Publicadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pages.filter(p => p.isPublished).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Criado em</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Calendar className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pages Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Páginas</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors shadow-lg shadow-red-500/50"
            >
              <Plus className="h-4 w-4" />
              Nova Página
            </button>
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6">
                <Plus className="h-10 w-10 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma página criada
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Crie sua primeira página para que ela apareça no seu site.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors font-semibold shadow-lg shadow-red-500/50"
              >
                <Plus className="h-5 w-5" />
                Criar Primeira Página
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page._id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Informações da página */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {page.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          page.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {page.isPublished ? 'Publicada' : 'Rascunho'}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {page.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        /{page.slug}
                      </p>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Editar */}
                      <button
                        onClick={() => router.push(`/projects/${params.id}/pages/${page._id}/editor`)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                        title="Editar página no editor"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      
                      {/* Ver */}
                      <button
                        onClick={() => window.open(`${projectUrl}/${page.slug}`, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
                        title="Ver página no navegador"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </button>
                      
                      {/* Despublicar/Publicar */}
                      <button
                        onClick={() => handleTogglePublish(page._id, page.isPublished)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                          page.isPublished
                            ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                        title={page.isPublished ? 'Despublicar página' : 'Publicar página'}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {page.isPublished ? 'Despublicar' : 'Publicar'}
                        </span>
                      </button>
                      
                      {/* Editar Rapidamente */}
                      <button
                        onClick={() => setQuickEditPage(page)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors text-sm"
                        title="Editar título e URL rapidamente"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar Rapidamente</span>
                      </button>
                      
                      {/* Excluir */}
                      <button
                        onClick={() => handleDeletePage(page._id)}
                        disabled={deletingPageId === page._id}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm disabled:opacity-50"
                        title="Excluir página"
                      >
                        {deletingPageId === page._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação de Página */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Criar Nova Página</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  handleCreateBlankPage();
                }}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Criar do Zero</h4>
                  <p className="text-sm text-gray-400">Comece com uma página em branco</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowTemplates(true);
                  loadTemplates();
                }}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Usar Template</h4>
                  <p className="text-sm text-gray-400">Escolha um template criado por nossos especialistas</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Templates */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Escolher Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Nenhum template disponível</h4>
                <p className="text-gray-400 mb-6">Nossos especialistas ainda não criaram templates para você.</p>
                <button
                  onClick={() => {
                    setShowTemplates(false);
                    setShowCreateModal(true);
                  }}
                  className="text-pink-600 hover:text-pink-500 font-medium"
                >
                  Voltar para opções
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    onClick={() => handleCreateFromTemplate(template)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
                  >
                    <div className="w-full h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center">
                      <Palette className="h-8 w-8 text-pink-400" />
                    </div>
                    <h4 className="font-medium text-white mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Edição Rápida */}
      {quickEditPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Editar Página</h3>
              <button
                onClick={() => {
                  setQuickEditPage(null);
                  setQuickEditTitle('');
                  setQuickEditSlug('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={quickEditTitle}
                  onChange={(e) => setQuickEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Digite o título da página"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Página
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-2">{projectUrl}/</span>
                  <input
                    type="text"
                    value={quickEditSlug}
                    onChange={(e) => setQuickEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="url-da-pagina"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setQuickEditPage(null);
                    setQuickEditTitle('');
                    setQuickEditSlug('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleQuickEdit}
                  disabled={quickEditLoading || !quickEditTitle || !quickEditSlug}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {quickEditLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

