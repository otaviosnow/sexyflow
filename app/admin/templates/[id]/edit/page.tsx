'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Palette
} from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  type: string;
  description?: string;
  content: any;
  previewImage?: string;
  isActive: boolean;
}

export default function EditTemplate({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    description: '',
    previewImage: '',
    content: {
      desktop: { html: '', css: '', js: '' },
      tablet: { html: '', css: '', js: '' },
      mobile: { html: '', css: '', js: '' },
      settings: {
        colors: { primary: '#ff6b6b', secondary: '#ee5a24', text: '#333333', background: '#667eea' },
        fonts: { heading: 'Inter', body: 'Inter' },
        breakpoints: { mobile: '768px', tablet: '1024px', desktop: '1200px' }
      }
    },
    isActive: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id && params.id) {
      fetchTemplate();
    }
  }, [session, params.id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/templates/${params.id}`);
      if (response.ok) {
        const templateData = await response.json();
        setTemplateData(templateData);
      } else {
        console.error('Erro ao carregar template');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Erro:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        console.log('Template salvo com sucesso!');
        router.push('/admin');
      } else {
        console.error('Erro ao salvar template');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (view: string, field: string, value: string) => {
    setTemplateData({
      ...templateData,
      content: {
        ...templateData.content,
        [view]: {
          ...templateData.content[view as keyof typeof templateData.content],
          [field]: value
        }
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

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Painel Admin
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Editando: {templateData.name}
              </h1>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Template *
                  </label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: Template Presell Premium"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Template *
                  </label>
                  <select
                    value={templateData.type}
                    onChange={(e) => setTemplateData({ ...templateData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="presell">Presell (Pré-venda)</option>
                    <option value="preview">Preview (Prévia)</option>
                    <option value="post-sale-x">Pós-venda Produto X</option>
                    <option value="delivery">Entrega</option>
                    <option value="post-sale-y">Pós-venda Produto Y</option>
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={templateData.description || ''}
                    onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Descreva o template..."
                  />
                </div>

                {/* Preview Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem de Preview
                  </label>
                  <input
                    type="url"
                    value={templateData.previewImage || ''}
                    onChange={(e) => setTemplateData({ ...templateData, previewImage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={templateData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setTemplateData({ ...templateData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Tabs de Viewport */}
              <div className="border-b bg-gray-50">
                <div className="flex">
                  {[
                    { id: 'desktop', label: 'Desktop', icon: Monitor },
                    { id: 'tablet', label: 'Tablet', icon: Tablet },
                    { id: 'mobile', label: 'Mobile', icon: Smartphone }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveView(id as any)}
                      className={`flex items-center space-x-2 px-6 py-3 transition-colors ${
                        activeView === id 
                          ? 'bg-white text-red-600 border-b-2 border-red-600' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor de Código */}
              <div className="grid grid-cols-1 md:grid-cols-2 h-96">
                {/* HTML */}
                <div className="border-r">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border-b">
                    <Code className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">HTML</span>
                  </div>
                  <textarea
                    value={templateData.content[activeView]?.html || ''}
                    onChange={(e) => updateContent(activeView, 'html', e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:ring-0 focus:outline-none"
                    placeholder="HTML do template..."
                  />
                </div>

                {/* CSS */}
                <div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border-b">
                    <Palette className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">CSS</span>
                  </div>
                  <textarea
                    value={templateData.content[activeView]?.css || ''}
                    onChange={(e) => updateContent(activeView, 'css', e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:ring-0 focus:outline-none"
                    placeholder="CSS do template..."
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border-t">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Preview</span>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="text-center text-gray-500 py-8">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Preview será implementado em breve</p>
                    <p className="text-sm">Use as variáveis: {`{{title}} {{headline}} {{subheadline}} {{buttonText}} {{buttonUrl}} {{pixelId}}`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
