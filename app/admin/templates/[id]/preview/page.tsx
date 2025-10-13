'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Monitor,
  Tablet,
  Smartphone
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

export default function PreviewTemplate({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
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
        setTemplate(templateData);
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

  const getPreviewContent = () => {
    if (!template) return '';
    
    const viewContent = template.content[activeView];
    if (!viewContent) return '';

    // Substituir variáveis por valores de exemplo
    const html = viewContent.html
      .replace(/\{\{title\}\}/g, 'Título da Página')
      .replace(/\{\{headline\}\}/g, 'Transforme sua vida íntima hoje mesmo!')
      .replace(/\{\{subheadline\}\}/g, 'Descubra os segredos que as mulheres mais desejadas do mundo usam para se sentirem irresistíveis')
      .replace(/\{\{buttonText\}\}/g, 'Quero Transformar Minha Vida')
      .replace(/\{\{buttonUrl\}\}/g, '#')
      .replace(/\{\{pixelId\}\}/g, '123456789');

    const css = viewContent.css;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview - ${template.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN' || !template) {
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
                Preview: {template.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controles */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Controles</h3>
              
              {/* Viewport Selector */}
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-medium text-gray-700">Viewport</h4>
                {[
                  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '1200px' },
                  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
                  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' }
                ].map(({ id, label, icon: Icon, width }) => (
                  <button
                    key={id}
                    onClick={() => setActiveView(id as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeView === id 
                        ? 'bg-red-100 text-red-600 border border-red-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs opacity-75">{width}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Tipo</h4>
                  <p className="text-sm text-gray-600 capitalize">{template.type}</p>
                </div>
                
                {template.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Descrição</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Preview Header */}
              <div className="border-b bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Preview - {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Largura: {
                      activeView === 'desktop' ? '1200px' :
                      activeView === 'tablet' ? '768px' : '375px'
                    }</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4 bg-gray-100">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <iframe
                    srcDoc={getPreviewContent()}
                    className="w-full border-0"
                    style={{
                      height: activeView === 'desktop' ? '600px' : 
                             activeView === 'tablet' ? '500px' : '400px',
                      maxWidth: activeView === 'desktop' ? '100%' : 
                               activeView === 'tablet' ? '768px' : '375px',
                      margin: '0 auto',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
