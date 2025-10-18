'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Eye, 
  Plus, 
  Star, 
  Users, 
  Heart,
  Monitor
} from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  type: string;
  previewImage: string;
  content: {
    elements: any[];
    background: any;
  };
  usageCount: number;
}

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadTemplates();
  }, [session, status, router]);

  const loadTemplates = async () => {
    try {
      // Mock templates para desenvolvimento local
      const mockTemplates: Template[] = [
        {
          _id: 'template-1',
          name: 'Presell Clássico',
          type: 'presell',
          previewImage: '/api/placeholder/400/300',
          content: {
            elements: [
              {
                id: 'heading-1',
                type: 'heading',
                content: { text: 'Descubra o Segredo das Mulheres Mais Desejadas', fontSize: 32, color: '#1f2937' },
                position: { x: 50, y: 50 },
                size: { width: 500, height: 80 },
                style: {},
                spacing: { top: 0, bottom: 20 }
              },
              {
                id: 'button-1',
                type: 'button',
                content: { text: 'QUERO ME TORNAR IRRESISTÍVEL', backgroundColor: '#ef4444', color: '#ffffff' },
                position: { x: 50, y: 200 },
                size: { width: 300, height: 60 },
                style: {},
                spacing: { top: 0, bottom: 20 }
              }
            ],
            background: { type: 'color', value: '#ffffff' }
          },
          usageCount: 127
        },
        {
          _id: 'template-2',
          name: 'Preview Moderno',
          type: 'preview',
          previewImage: '/api/placeholder/400/300',
          content: {
            elements: [
              {
                id: 'heading-1',
                type: 'heading',
                content: { text: 'Assista ao Vídeo Exclusivo', fontSize: 28, color: '#1f2937' },
                position: { x: 50, y: 50 },
                size: { width: 500, height: 80 },
                style: {},
                spacing: { top: 0, bottom: 20 }
              },
              {
                id: 'video-1',
                type: 'video',
                content: { url: 'https://example.com/video.mp4', autoplay: false },
                position: { x: 50, y: 150 },
                size: { width: 400, height: 225 },
                style: {},
                spacing: { top: 0, bottom: 20 }
              }
            ],
            background: { type: 'color', value: '#f8fafc' }
          },
          usageCount: 89
        },
        {
          _id: 'template-3',
          name: 'Pós-Venda Elegante',
          type: 'post-sale',
          previewImage: '/api/placeholder/400/300',
          content: {
            elements: [
              {
                id: 'heading-1',
                type: 'heading',
                content: { text: 'Obrigada pela Sua Compra!', fontSize: 30, color: '#059669' },
                position: { x: 50, y: 50 },
                size: { width: 500, height: 80 },
                style: {},
                spacing: { top: 0, bottom: 20 }
              },
              {
                id: 'text-1',
                type: 'text',
                content: { text: 'Seu produto será entregue em até 24 horas.', fontSize: 16, color: '#6b7280' },
                position: { x: 50, y: 150 },
                size: { width: 400, height: 40 },
                style: {},
                spacing: { top: 0, bottom: 20 }
              }
            ],
            background: { type: 'color', value: '#f0fdf4' }
          },
          usageCount: 156
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (templateId: string) => {
    try {
      const template = templates.find(t => t._id === templateId);
      if (!template) return;

      // Criar página baseada no template
      const pageData = {
        title: `Página baseada em ${template.name}`,
        type: template.type,
        templateId: template._id,
        content: {
          elements: template.content.elements,
          background: template.content.background
        }
      };

      // Simular criação da página
      const newPageId = `page-${Date.now()}`;
      
      // Redirecionar para o editor da página
      router.push(`/pages/${newPageId}/editor`);
    } catch (error) {
      console.error('Erro ao criar página:', error);
    }
  };

  const handlePreview = (templateId: string) => {
    setSelectedTemplate(selectedTemplate === templateId ? null : templateId);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Criar Nova Página
                  </h1>
                  <p className="text-sm text-gray-400">Escolha um template para começar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Escolha um Template
          </h2>
          <p className="text-gray-300 text-lg">
            Selecione um template para criar sua página. Você poderá personalizar todos os elementos depois.
          </p>
        </div>

        {/* Grid de Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              {/* Preview Image ou Preview Inline */}
              {selectedTemplate === template._id ? (
                <div className="bg-white p-4 min-h-[200px]">
                  <div className="space-y-3">
                    {template.content.elements.map((element) => (
                      <div
                        key={element.id}
                        className="border border-gray-200 rounded-lg p-3"
                        style={{
                          width: Math.min(element.size.width, 300),
                          height: Math.min(element.size.height, 80),
                          backgroundColor: element.content.backgroundColor || 'transparent',
                          color: element.content.color || '#000000',
                          fontSize: Math.min(element.content.fontSize || 16, 14)
                        }}
                      >
                        {element.type === 'heading' && (
                          <h3 className="font-bold text-sm">{element.content.text}</h3>
                        )}
                        {element.type === 'button' && (
                          <button className="px-4 py-2 rounded text-xs font-medium bg-red-500 text-white">
                            {element.content.text}
                          </button>
                        )}
                        {element.type === 'text' && (
                          <p className="text-xs">{element.content.text}</p>
                        )}
                        {element.type === 'video' && (
                          <div className="bg-gray-100 rounded flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                              <Monitor className="w-4 h-4 mx-auto mb-1" />
                              <p className="text-xs">Vídeo</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative h-48 bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Clique em Preview</p>
                    </div>
                  </div>
                  
                  {/* Badge de Popularidade */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs border border-green-500/30">
                      <Users className="w-3 h-3" />
                      <span>{template.usageCount} usos</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conteúdo do Card */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {template.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    template.type === 'presell' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    template.type === 'preview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    template.type === 'post-sale' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {template.type}
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{template.usageCount} pessoas usaram</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePreview(template._id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 border ${
                      selectedTemplate === template._id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border-gray-600'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{selectedTemplate === template._id ? 'Ocultar' : 'Preview'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleCreatePage(template._id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Usar Template</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}