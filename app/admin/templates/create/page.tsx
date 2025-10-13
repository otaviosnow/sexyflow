'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

export default function CreateTemplate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [templateData, setTemplateData] = useState({
    name: '',
    type: 'presell',
    description: '',
    previewImage: '',
    content: {
      desktop: {
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="hero">
            <h1 class="headline">{{headline}}</h1>
            <p class="subheadline">{{subheadline}}</p>
        </header>
        
        <main class="content">
            <div class="cta-section">
                <a href="{{buttonUrl}}" class="cta-button">
                    {{buttonText}}
                </a>
            </div>
        </main>
    </div>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    padding: 4rem 0;
}

.headline {
    font-size: 3.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subheadline {
    font-size: 1.5rem;
    color: rgba(255,255,255,0.9);
    margin-bottom: 3rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.content {
    text-align: center;
}

.cta-section {
    margin: 3rem 0;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 1.5rem 3rem;
    font-size: 1.2rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 50px;
    box-shadow: 0 8px 25px rgba(238, 90, 36, 0.4);
    transition: all 0.3s ease;
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(238, 90, 36, 0.6);
}

@media (max-width: 768px) {
    .headline {
        font-size: 2.5rem;
    }
    
    .subheadline {
        font-size: 1.2rem;
    }
    
    .cta-button {
        padding: 1.2rem 2.5rem;
        font-size: 1.1rem;
    }
}`,
        js: `// Facebook Pixel
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{pixelId}}');
fbq('track', 'PageView');`
      },
      tablet: {
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="hero">
            <h1 class="headline">{{headline}}</h1>
            <p class="subheadline">{{subheadline}}</p>
        </header>
        
        <main class="content">
            <div class="cta-section">
                <a href="{{buttonUrl}}" class="cta-button">
                    {{buttonText}}
                </a>
            </div>
        </main>
    </div>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 768px;
    margin: 0 auto;
    padding: 1.5rem;
}

.hero {
    text-align: center;
    padding: 3rem 0;
}

.headline {
    font-size: 3rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1.2rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subheadline {
    font-size: 1.3rem;
    color: rgba(255,255,255,0.9);
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.content {
    text-align: center;
}

.cta-section {
    margin: 2.5rem 0;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 1.3rem 2.8rem;
    font-size: 1.15rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 50px;
    box-shadow: 0 8px 25px rgba(238, 90, 36, 0.4);
    transition: all 0.3s ease;
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(238, 90, 36, 0.6);
}`
      },
      mobile: {
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="hero">
            <h1 class="headline">{{headline}}</h1>
            <p class="subheadline">{{subheadline}}</p>
        </header>
        
        <main class="content">
            <div class="cta-section">
                <a href="{{buttonUrl}}" class="cta-button">
                    {{buttonText}}
                </a>
            </div>
        </main>
    </div>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 100%;
    margin: 0 auto;
    padding: 1rem;
}

.hero {
    text-align: center;
    padding: 2rem 0;
}

.headline {
    font-size: 2.2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    line-height: 1.2;
}

.subheadline {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.9);
    margin-bottom: 2rem;
    padding: 0 1rem;
}

.content {
    text-align: center;
}

.cta-section {
    margin: 2rem 0;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 1rem 2.5rem;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 50px;
    box-shadow: 0 8px 25px rgba(238, 90, 36, 0.4);
    transition: all 0.3s ease;
    width: 90%;
    max-width: 300px;
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(238, 90, 36, 0.6);
}`
      },
      settings: {
        colors: {
          primary: '#ff6b6b',
          secondary: '#ee5a24',
          text: '#333333',
          background: '#667eea'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        },
        breakpoints: {
          mobile: '768px',
          tablet: '1024px',
          desktop: '1200px'
        }
      }
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        console.error('Erro ao criar template');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
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

  if (status === 'loading') {
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
                Criar Novo Template
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
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
                    value={templateData.description}
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
                    value={templateData.previewImage}
                    onChange={(e) => setTemplateData({ ...templateData, previewImage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://..."
                  />
                </div>

                {/* Botões */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    {loading ? 'Criando...' : 'Criar Template'}
                  </button>
                </div>
              </form>
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
                    value={templateData.content[activeView].html}
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
                    value={templateData.content[activeView].css}
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
