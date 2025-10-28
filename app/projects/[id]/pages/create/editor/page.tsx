'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  content: any;
}

const templateData: { [key: string]: TemplateData } = {
  'blank': {
    id: 'blank',
    name: 'Página em Branco',
    content: {
      background: {
        type: 'color',
        value: '#ffffff'
      },
      sections: []
    }
  },
  'landing-sales': {
    id: 'landing-sales',
    name: 'Landing de Vendas',
    content: {
      background: {
        type: 'gradient',
        value: '135deg, #667eea 0%, #764ba2 100%'
      },
      sections: [
        {
          id: 'hero',
          type: 'hero',
          content: {
            title: 'Transforme Sua Vida Hoje',
            subtitle: 'Descubra o segredo que mudou a vida de milhares de pessoas',
            buttonText: 'Quero Começar Agora',
            buttonColor: '#ff6b6b'
          }
        },
        {
          id: 'features',
          type: 'features',
          content: {
            title: 'Por que escolher nosso produto?',
            items: [
              {
                icon: '✓',
                title: 'Resultados Garantidos',
                description: 'Veja resultados em 30 dias ou seu dinheiro de volta'
              },
              {
                icon: '⚡',
                title: 'Fácil de Usar',
                description: 'Interface intuitiva que qualquer pessoa pode usar'
              },
              {
                icon: '🎯',
                title: 'Suporte 24/7',
                description: 'Nossa equipe está sempre disponível para ajudar'
              }
            ]
          }
        }
      ]
    }
  },
  'hot-niche': {
    id: 'hot-niche',
    name: 'Nicho Hot',
    content: {
      background: {
        type: 'gradient',
        value: '135deg, #ff6b9d 0%, #c44569 100%'
      },
      sections: [
        {
          id: 'hero',
          type: 'hero',
          content: {
            title: '🔥 Conteúdo Exclusivo',
            subtitle: 'Acesso VIP ao melhor conteúdo',
            buttonText: 'Acessar Agora',
            buttonColor: '#ff4757'
          }
        }
      ]
    }
  },
  'fitness': {
    id: 'fitness',
    name: 'Fitness & Saúde',
    content: {
      background: {
        type: 'color',
        value: '#f8f9fa'
      },
      sections: [
        {
          id: 'hero',
          type: 'hero',
          content: {
            title: 'Transforme Seu Corpo',
            subtitle: 'Programa de treino personalizado para seus objetivos',
            buttonText: 'Começar Treino',
            buttonColor: '#00b894'
          }
        }
      ]
    }
  },
  'luxury': {
    id: 'luxury',
    name: 'Luxo & Premium',
    content: {
      background: {
        type: 'gradient',
        value: '135deg, #2c3e50 0%, #34495e 100%'
      },
      sections: [
        {
          id: 'hero',
          type: 'hero',
          content: {
            title: 'Exclusividade Redefinida',
            subtitle: 'Experimente o luxo em sua forma mais pura',
            buttonText: 'Descobrir',
            buttonColor: '#f39c12'
          }
        }
      ]
    }
  }
};

export default function PageEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

  const templateId = searchParams.get('template');

  useEffect(() => {
    if (templateId && templateData[templateId]) {
      setSelectedTemplate(templateData[templateId]);
      setPageTitle(templateData[templateId].name);
      setPageSlug(templateData[templateId].id);
    }
  }, [templateId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Template não encontrado</h1>
          <button
            onClick={() => router.push(`/projects/${params.id}/pages/create`)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Voltar à Seleção
          </button>
        </div>
      </div>
    );
  }

  const handleCreatePage = async () => {
    if (!pageTitle || !pageSlug) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`/api/projects/${params.id}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: pageTitle,
          slug: pageSlug,
          content: selectedTemplate.content,
          isPublished: false
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        router.push(`/projects/${params.id}/pages/${newPage._id}/editor`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar página');
      }
    } catch (error) {
      console.error('Erro ao criar página:', error);
      alert('Erro ao criar página');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${params.id}/pages/create`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Configurar Página
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreatePage}
                disabled={isCreating || !pageTitle || !pageSlug}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Save className="h-4 w-4" />
                {isCreating ? 'Criando...' : 'Criar Página'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configurações da Página
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Página *
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    placeholder="Ex: Minha Página de Vendas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Página *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      /pages/
                    </span>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm"
                      placeholder="minha-pagina"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas letras minúsculas, números e hífens
                  </p>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Template Selecionado
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600">
                    Template personalizado para suas necessidades
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview do Template
            </h3>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Preview do template "{selectedTemplate.name}"
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                💡 Você poderá personalizar completamente após a criação
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
