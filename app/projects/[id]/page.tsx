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

  const handleTogglePublish = async (pageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        setPages(pages.map(p => 
          p._id === pageId 
            ? { ...p, isPublished: !currentStatus }
            : p
        ));
        alert(`Página ${!currentStatus ? 'publicada' : 'despublicada'} com sucesso!`);
      } else {
        alert('Erro ao alterar status da página');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status da página');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Projeto não encontrado</h1>
          <button
            onClick={() => router.push('/projects')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Voltar aos Projetos
          </button>
        </div>
      </div>
    );
  }

  const projectUrl = `https://${project.subdomain}.sexyflow.onrender.com`;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar aos Projetos
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-gray-400 text-sm">{projectUrl}</p>
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Páginas</p>
                <p className="text-2xl font-bold text-white">{pages.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Páginas Publicadas</p>
                <p className="text-2xl font-bold text-white">
                  {pages.filter(p => p.isPublished).length}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Globe className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Visualizações</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Criado em</p>
                <p className="text-sm font-medium text-white">
                  {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pages Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Minhas Páginas</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Nova Página
            </button>
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full mb-6">
                <Plus className="h-10 w-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma página criada
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Crie sua primeira página para que ela apareça no seu site.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                Criar Primeira Página
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <div
                  key={page._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-pink-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        /{page.slug}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          page.isPublished 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {page.isPublished ? 'Publicada' : 'Rascunho'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {page.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/projects/${params.id}/pages/${page._id}/editor`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    
                    <button
                      onClick={() => window.open(`${projectUrl}/${page.slug}`, '_blank')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleTogglePublish(page._id, page.isPublished)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        page.isPublished
                          ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                      title={page.isPublished ? 'Despublicar' : 'Publicar'}
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePage(page._id)}
                      disabled={deletingPageId === page._id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir"
                    >
                      {deletingPageId === page._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
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
    </div>
  );
}

