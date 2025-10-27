'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Eye, 
  CheckCircle,
  Palette,
  Type,
  Zap,
  Star
} from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  type: string;
  description?: string;
  previewImage?: string;
  content: {
    elements: any[];
    background: any;
  };
}

interface Project {
  _id: string;
  name: string;
  subdomain: string;
}

export default function CreatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      loadData();
    }
  }, [status, session, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar projeto
      const projectResponse = await fetch(`/api/projects/${params.id}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Buscar templates
      const templatesResponse = await fetch('/api/admin/templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (templateId: string) => {
    try {
      setCreating(true);
      
      const template = templates.find(t => t._id === templateId);
      if (!template) return;

      // Criar página baseada no template
      const pageData = {
        title: `Página baseada em ${template.name}`,
        slug: generateSlug(template.name),
        type: template.type.toLowerCase(),
        templateId: template._id,
        content: template.content
      };

      const response = await fetch(`/api/projects/${params.id}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Página criada com sucesso!');
        // Redirecionar para o editor da página
        router.push(`/projects/${params.id}/pages/${data.page._id}/editor`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao criar página');
      }
    } catch (error) {
      console.error('Erro ao criar página:', error);
      alert('Erro ao criar página. Verifique a conexão.');
    } finally {
      setCreating(false);
    }
  };

  const generateSlug = (templateName: string) => {
    return templateName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getTemplateIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presell':
        return <Zap className="h-6 w-6 text-pink-500" />;
      case 'preview':
        return <Eye className="h-6 w-6 text-blue-500" />;
      case 'post-sale-x':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'delivery':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'post-sale-y':
        return <Type className="h-6 w-6 text-orange-500" />;
      default:
        return <Palette className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presell':
        return 'from-pink-500 to-pink-600';
      case 'preview':
        return 'from-blue-500 to-blue-600';
      case 'post-sale-x':
        return 'from-green-500 to-green-600';
      case 'delivery':
        return 'from-purple-500 to-purple-600';
      case 'post-sale-y':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando templates...</p>
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

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${params.id}`)}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Projeto
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Criar Nova Página</h1>
                <p className="text-gray-400 text-sm">{project.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Escolha um Template
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Selecione um template para começar sua página. Você poderá personalizar tudo depois no editor.
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full mb-6">
              <Palette className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum template disponível
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Não há templates criados ainda. Um administrador precisa criar templates primeiro.
            </p>
            <button
              onClick={() => router.push(`/projects/${params.id}`)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar ao Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-500/50 transition-all hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getTemplateIcon(template.type)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-400 capitalize">
                        {template.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {template.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                {/* Preview do template */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      {getTemplateIcon(template.type)}
                    </div>
                    <p className="text-xs text-gray-500">Preview</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTemplate(template._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Preview</span>
                  </button>
                  
                  <button
                    onClick={() => handleCreatePage(template._id)}
                    disabled={creating}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                      getTemplateColor(template.type)
                    } bg-gradient-to-r text-white hover:shadow-lg`}
                  >
                    {creating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Usar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Preview do Template</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm">
                  Preview será implementado em breve. Por enquanto, você pode usar o template diretamente.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    handleCreatePage(selectedTemplate);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Usar Este Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

