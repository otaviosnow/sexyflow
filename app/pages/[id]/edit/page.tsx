'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Settings, Upload } from 'lucide-react';

interface PageData {
  _id: string;
  title: string;
  type: string;
  slug: string;
  description: string;
  content: any;
  isPublished: boolean;
}

export default function EditPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && params.id) {
      fetchPage();
    }
  }, [session, params.id]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/pages/${params.id}`);
      if (response.ok) {
        const pageData = await response.json();
        setPage(pageData);
      } else {
        console.error('Erro ao carregar página');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/pages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
      });

      if (response.ok) {
        // Mostrar sucesso
        console.log('Página salva com sucesso!');
      } else {
        console.error('Erro ao salvar página');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (field: string, value: any) => {
    if (!page) return;
    
    setPage({
      ...page,
      content: {
        ...page.content,
        [field]: value
      }
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session || !page) {
    return null;
  }

  const renderEditor = () => {
    switch (page.type) {
      case 'presell':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={page.content.headline || ''}
                onChange={(e) => updateContent('headline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Transforme sua vida íntima hoje mesmo!"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <textarea
                value={page.content.subheadline || ''}
                onChange={(e) => updateContent('subheadline', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Descubra os segredos que as mulheres mais desejadas do mundo usam..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Botão WhatsApp - Texto
              </label>
              <input
                type="text"
                value={page.content.whatsappButton?.text || ''}
                onChange={(e) => updateContent('whatsappButton', {
                  ...page.content.whatsappButton,
                  text: e.target.value
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Quero Transformar Minha Vida"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número WhatsApp
              </label>
              <input
                type="text"
                value={page.content.whatsappButton?.phone || ''}
                onChange={(e) => updateContent('whatsappButton', {
                  ...page.content.whatsappButton,
                  phone: e.target.value
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="+5511999999999"
              />
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={page.content.headline || ''}
                onChange={(e) => updateContent('headline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Assista ao vídeo exclusivo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código HTML do Vídeo
              </label>
              <textarea
                value={page.content.videoHtml || ''}
                onChange={(e) => updateContent('videoHtml', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                placeholder="Cole aqui o código HTML do vídeo..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Editor para tipo "{page.type}" será implementado em breve.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Editando: {page.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPage({ ...page, isPublished: !page.isPublished })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page.isPublished
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {page.isPublished ? 'Publicada' : 'Rascunho'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Configurações Básicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Página
                </label>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => setPage({ ...page, slug: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conteúdo da Página
            </h2>
            {renderEditor()}
          </div>
        </div>
      </div>
    </div>
  );
}
