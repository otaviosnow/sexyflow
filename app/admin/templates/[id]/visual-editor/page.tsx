'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Monitor, Tablet, Smartphone, Eye, Save, Undo, Redo, 
  Move, Copy, Trash2, Upload, Palette, Settings,
  Type, Image, Video, Code, Square, Minus, Star,
  ChevronDown, ChevronRight, Search, X
} from 'lucide-react';

// Tipos
interface Element {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: any;
  responsive: {
    desktop: { position: { x: number; y: number }; size: { width: number; height: number }; content: any };
    tablet: { position: { x: number; y: number }; size: { width: number; height: number }; content: any };
    mobile: { position: { x: number; y: number }; size: { width: number; height: number }; content: any };
  };
}

interface Template {
  _id: string;
  name: string;
  type: string;
  content: any;
}

// Categorias de elementos
const ELEMENT_CATEGORIES = [
  {
    id: 'basic',
    name: 'Básico',
    elements: [
      { id: 'heading', name: 'Título', icon: Type, color: 'bg-blue-500', description: 'Adicionar título' },
      { id: 'text', name: 'Texto', icon: Type, color: 'bg-green-500', description: 'Adicionar texto' },
      { id: 'button', name: 'Botão', icon: Square, color: 'bg-purple-500', description: 'Adicionar botão' },
    ]
  },
  {
    id: 'media',
    name: 'Mídia',
    elements: [
      { id: 'image', name: 'Imagem', icon: Image, color: 'bg-orange-500', description: 'Adicionar imagem' },
      { id: 'video', name: 'Vídeo', icon: Video, color: 'bg-red-500', description: 'Adicionar vídeo' },
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    elements: [
      { id: 'container', name: 'Container', icon: Square, color: 'bg-gray-500', description: 'Adicionar container' },
      { id: 'spacer', name: 'Espaçador', icon: Minus, color: 'bg-yellow-500', description: 'Adicionar espaçador' },
    ]
  },
  {
    id: 'advanced',
    name: 'Avançado',
    elements: [
      { id: 'html', name: 'HTML', icon: Code, color: 'bg-indigo-500', description: 'Adicionar HTML' },
    ]
  }
];

export default function VisualEditor({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeCategory, setActiveCategory] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  const [background, setBackground] = useState({ type: 'color', value: '#ffffff', image: '' });
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    content: {}
  });

  // Funções básicas
  const getCanvasSize = () => {
    switch (activeView) {
      case 'desktop': return { width: 1200, height: 800 };
      case 'tablet': return { width: 768, height: 600 };
      case 'mobile': return { width: 375, height: 667 };
      default: return { width: 1200, height: 800 };
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading':
        return { text: 'Título Principal', level: 'h1', fontSize: 48, color: '#1f2937' };
      case 'text':
        return { text: 'Este é um parágrafo de texto.', fontSize: 16, color: '#374151' };
      case 'button':
        return { text: 'Clique Aqui', backgroundColor: '#3b82f6', color: '#ffffff' };
      case 'image':
        return { src: '', alt: 'Imagem', width: 300, height: 200 };
      case 'video':
        return { src: '', width: 400, height: 225 };
      case 'container':
        return { backgroundColor: 'transparent', padding: 20 };
      case 'spacer':
        return { height: 50, backgroundColor: 'transparent' };
      case 'html':
        return { html: '<div>HTML personalizado</div>' };
      default:
        return {};
    }
  };

  const getDefaultSize = (type: string) => {
    const { width: canvasWidth } = getCanvasSize();
    switch (type) {
      case 'heading': return { width: Math.min(400, canvasWidth - 40), height: 60 };
      case 'text': return { width: Math.min(300, canvasWidth - 40), height: 80 };
      case 'button': return { width: 150, height: 50 };
      case 'image': return { width: Math.min(300, canvasWidth - 40), height: 200 };
      case 'video': return { width: Math.min(400, canvasWidth - 40), height: 225 };
      case 'container': return { width: Math.min(500, canvasWidth - 40), height: 200 };
      case 'spacer': return { width: Math.min(100, canvasWidth - 40), height: 50 };
      case 'html': return { width: Math.min(300, canvasWidth - 40), height: 100 };
      default: return { width: Math.min(200, canvasWidth - 40), height: 50 };
    }
  };

  const getCenteredPosition = (elementWidth: number) => {
    const { width: canvasWidth } = getCanvasSize();
    return (canvasWidth - elementWidth) / 2;
  };

  const addElement = (type: string) => {
    const defaultSize = getDefaultSize(type);
    const centeredX = getCenteredPosition(defaultSize.width);
    
    let elementY = 50;
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      elementY = lastElement.position.y + lastElement.size.height + 20;
    }

    const newElement: Element = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      content: getDefaultContent(type),
      position: { x: centeredX, y: elementY },
      size: defaultSize,
      style: {},
      responsive: {
        desktop: { position: { x: centeredX, y: elementY }, size: defaultSize, content: getDefaultContent(type) },
        tablet: { position: { x: centeredX, y: elementY }, size: defaultSize, content: getDefaultContent(type) },
        mobile: { position: { x: centeredX, y: elementY }, size: defaultSize, content: getDefaultContent(type) }
      }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Elemento adicionado!');
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(element => element.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Elemento removido!');
  };

  const renderElement = (element: Element) => {
    const viewportElement = element;
    
    switch (viewportElement.type) {
      case 'heading':
        const HeadingTag = viewportElement.content.level || 'h1';
        return (
          <HeadingTag
            style={{
              fontSize: viewportElement.content.fontSize,
              color: viewportElement.content.color,
              textAlign: 'center',
              margin: 0,
              padding: 0
            }}
          >
            {viewportElement.content.text}
          </HeadingTag>
        );
      
      case 'text':
        return (
          <p
            style={{
              fontSize: viewportElement.content.fontSize,
              color: viewportElement.content.color,
              margin: 0,
              padding: 0
            }}
          >
            {viewportElement.content.text}
          </p>
        );
      
      case 'button':
        return (
          <button
            style={{
              backgroundColor: viewportElement.content.backgroundColor,
              color: viewportElement.content.color,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {viewportElement.content.text}
          </button>
        );
      
      case 'image':
        return viewportElement.content.src ? (
          <img
            src={viewportElement.content.src}
            alt={viewportElement.content.alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <Image className="h-8 w-8" />
          </div>
        );
      
      case 'video':
        return viewportElement.content.src ? (
          <video
            src={viewportElement.content.src}
            width="100%"
            height="100%"
            controls
            style={{ borderRadius: '8px' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <Video className="h-8 w-8" />
          </div>
        );
      
      case 'container':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: viewportElement.content.backgroundColor,
              padding: viewportElement.content.padding,
              borderRadius: '8px',
              border: '1px dashed #d1d5db'
            }}
          >
            Container
          </div>
        );
      
      case 'spacer':
        return (
          <div
            style={{
              width: '100%',
              height: viewportElement.content.height,
              backgroundColor: viewportElement.content.backgroundColor || 'transparent'
            }}
          />
        );
      
      case 'html':
        return (
          <div
            dangerouslySetInnerHTML={{ __html: viewportElement.content.html }}
            style={{ width: '100%', height: '100%' }}
          />
        );
      
      default:
        return <div>Elemento não suportado</div>;
    }
  };

  // Effects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id && params.id) {
      // Mock template data for local development
      setTemplateData({
        _id: params.id,
        name: 'Template Mock',
        type: 'presell',
        content: { elements: [], background: { type: 'color', value: '#ffffff', image: '' } }
      });
      setLoading(false);
    }
  }, [session, params.id]);

  // Renderizações condicionais
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando editor visual...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-slate-200 h-16 flex items-center px-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <div className="flex bg-slate-100 rounded-xl p-1">
            {(['desktop', 'tablet', 'mobile'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === view
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view === 'desktop' && <Monitor className="w-4 h-4" />}
                {view === 'tablet' && <Tablet className="w-4 h-4" />}
                {view === 'mobile' && <Smartphone className="w-4 h-4" />}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            
            <button
              onClick={() => toast.success('Salvo!')}
              disabled={saving}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Esquerda - Elementos */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Elementos</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {ELEMENT_CATEGORIES.map((category) => (
              <div key={category.id} className="mb-6">
                <button
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{category.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {activeCategory === category.id && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {category.elements.map((element) => (
                      <button
                        key={element.id}
                        onClick={() => addElement(element.id)}
                        className="aspect-square rounded-xl text-white flex flex-col items-center justify-center space-y-2 hover:opacity-90 transition-all"
                        style={{ backgroundColor: element.color.replace('bg-', '').replace('-500', '') }}
                        title={element.description}
                      >
                        <element.icon className="h-6 w-6" />
                        <span className="text-xs font-semibold text-center">{element.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          <div
            className="relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 mx-auto"
            style={{
              width: getCanvasSize().width,
              height: getCanvasSize().height,
              backgroundColor: background.type === 'color' ? background.value : 'transparent',
              backgroundImage: background.type === 'image' && background.image ? `url(${background.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Comece adicionando elementos</h3>
                  <p className="text-slate-500">Use a barra lateral para adicionar elementos ao seu template</p>
                </div>
              </div>
            ) : (
              elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedElement === element.id ? 'ring-4 ring-blue-500 ring-opacity-60 shadow-2xl' : ''
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height
                  }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {renderElement(element)}
                  
                  {selectedElement === element.id && (
                    <div className="absolute -top-10 left-0 flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Direita - Propriedades */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Propriedades</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {selectedElement ? (
              <div>
                <h3 className="font-medium text-slate-900 mb-4">
                  {elements.find(e => e.id === selectedElement)?.type}
                </h3>
                <p className="text-sm text-slate-500">Propriedades do elemento selecionado</p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-slate-900 mb-4">Fundo da Página</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                    <select
                      value={background.type}
                      onChange={(e) => setBackground({ ...background, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="color">Cor</option>
                      <option value="image">Imagem</option>
                    </select>
                  </div>
                  
                  {background.type === 'color' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                      <input
                        type="color"
                        value={background.value}
                        onChange={(e) => setBackground({ ...background, value: e.target.value })}
                        className="w-full h-10 border border-slate-300 rounded-lg"
                      />
                    </div>
                  )}
                  
                  {background.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">URL da Imagem</label>
                      <input
                        type="url"
                        value={background.image}
                        onChange={(e) => setBackground({ ...background, image: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div
                className="bg-white shadow-lg rounded-lg mx-auto overflow-hidden border border-slate-200"
                style={{
                  width: getCanvasSize().width,
                  height: getCanvasSize().height,
                  backgroundColor: background.type === 'color' ? background.value : 'transparent',
                  backgroundImage: background.type === 'image' && background.image ? `url(${background.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    style={{
                      position: 'absolute',
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height
                    }}
                  >
                    {renderElement(element)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
