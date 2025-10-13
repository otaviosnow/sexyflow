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
  Plus,
  Trash2,
  Move,
  Type,
  Image,
  Video,
  MousePointer,
  Settings,
  Palette,
  Code,
  Layout,
  Grid,
  Layers,
  Search,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalCenter,
  AlignTop,
  AlignBottom,
  RotateCcw,
  Copy,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Link,
  Maximize,
  Minimize
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  _id: string;
  name: string;
  type: string;
  content: any;
}

interface Element {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: any;
}

// Categorias de elementos inspiradas no Elementor
const ELEMENT_CATEGORIES = [
  {
    id: 'basic',
    name: 'Básicos',
    icon: Layout,
    elements: [
      { id: 'heading', name: 'Título', icon: Type, color: 'bg-blue-500', description: 'Títulos H1, H2, H3...' },
      { id: 'text', name: 'Texto', icon: Type, color: 'bg-green-500', description: 'Parágrafo de texto' },
      { id: 'button', name: 'Botão', icon: MousePointer, color: 'bg-purple-500', description: 'Botão de ação' },
      { id: 'image', name: 'Imagem', icon: Image, color: 'bg-orange-500', description: 'Imagem com otimização' },
      { id: 'video', name: 'Vídeo', icon: Video, color: 'bg-red-500', description: 'Vídeo responsivo' },
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: Grid,
    elements: [
      { id: 'container', name: 'Container', icon: Layout, color: 'bg-indigo-500', description: 'Container flexível' },
      { id: 'column', name: 'Coluna', icon: Layout, color: 'bg-cyan-500', description: 'Coluna de conteúdo' },
      { id: 'section', name: 'Seção', icon: Layout, color: 'bg-teal-500', description: 'Seção completa' },
      { id: 'spacer', name: 'Espaçador', icon: Layout, color: 'bg-gray-500', description: 'Espaço em branco' },
    ]
  },
  {
    id: 'advanced',
    name: 'Avançados',
    icon: Code,
    elements: [
      { id: 'html', name: 'HTML', icon: Code, color: 'bg-gray-700', description: 'Código HTML customizado' },
      { id: 'background', name: 'Fundo', icon: Palette, color: 'bg-pink-500', description: 'Cor ou imagem de fundo' },
      { id: 'divider', name: 'Divisor', icon: Layout, color: 'bg-slate-500', description: 'Linha divisória' },
    ]
  }
];

export default function VisualEditor({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeCategory, setActiveCategory] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    content: {}
  });

  const [elements, setElements] = useState<Element[]>([]);
  const [background, setBackground] = useState({ type: 'color', value: '#ffffff', image: '' });

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
        setTemplateData(templateData);
        if (!templateData.content.elements) {
          setElements([]);
        } else {
          setElements(templateData.content.elements);
        }
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
      const updatedTemplate = {
        ...templateData,
        content: {
          ...templateData.content,
          elements: elements,
          background: background
        }
      };

      const response = await fetch(`/api/admin/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTemplate),
      });

      if (response.ok) {
        toast.success('Template salvo com sucesso!');
        setTemplateData(updatedTemplate);
      } else {
        toast.error('Erro ao salvar template');
      }
    } catch (error) {
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const addElement = (type: string) => {
    const newElement: Element = {
      id: `element_${Date.now()}`,
      type: type,
      content: getDefaultContent(type),
      position: { x: 50, y: 50 + (elements.length * 60) },
      size: { width: getDefaultSize(type).width, height: getDefaultSize(type).height },
      style: getDefaultStyle(type)
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Elemento adicionado!');
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('elementType');
    if (!elementType) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const newElement: Element = {
      id: `element_${Date.now()}`,
      type: elementType,
      content: getDefaultContent(elementType),
      position: { x: Math.max(0, x - 100), y: Math.max(0, y - 25) },
      size: getDefaultSize(elementType),
      style: getDefaultStyle(elementType)
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Elemento adicionado ao canvas!');
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleElementDragStart = (elementType: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', elementType);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading':
        return { text: 'Título Principal', level: 'h1', fontSize: 48, color: '#1f2937', fontWeight: 'bold' };
      case 'text':
        return { text: 'Este é um parágrafo de texto. Clique para editar o conteúdo.', fontSize: 16, color: '#374151', lineHeight: 1.6 };
      case 'button':
        return { text: 'Clique Aqui', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: 8, padding: '12px 24px' };
      case 'image':
        return { src: '', alt: 'Imagem', width: 300, height: 200, borderRadius: 8 };
      case 'video':
        return { src: '', poster: '', width: 400, height: 225, borderRadius: 8 };
      case 'container':
        return { backgroundColor: 'transparent', padding: 20, borderRadius: 0, border: 'none' };
      case 'column':
        return { backgroundColor: 'transparent', padding: 15, borderRadius: 0 };
      case 'section':
        return { backgroundColor: '#f9fafb', padding: 40, borderRadius: 0, border: 'none' };
      case 'spacer':
        return { height: 50, backgroundColor: 'transparent' };
      case 'html':
        return { html: '<div style="padding: 20px; background: #f3f4f6; border-radius: 8px;">HTML personalizado</div>' };
      case 'background':
        return { type: 'color', value: '#667eea', image: '' };
      case 'divider':
        return { height: 2, backgroundColor: '#e5e7eb', style: 'solid' };
      default:
        return {};
    }
  };

  const getDefaultSize = (type: string) => {
    switch (type) {
      case 'heading':
        return { width: 400, height: 60 };
      case 'text':
        return { width: 300, height: 80 };
      case 'button':
        return { width: 150, height: 50 };
      case 'image':
        return { width: 300, height: 200 };
      case 'video':
        return { width: 400, height: 225 };
      case 'container':
        return { width: 500, height: 200 };
      case 'column':
        return { width: 250, height: 300 };
      case 'section':
        return { width: 800, height: 300 };
      case 'spacer':
        return { width: 100, height: 50 };
      case 'html':
        return { width: 300, height: 100 };
      case 'background':
        return { width: 200, height: 50 };
      case 'divider':
        return { width: 400, height: 2 };
      default:
        return { width: 200, height: 50 };
    }
  };

  const getDefaultStyle = (type: string) => {
    switch (type) {
      case 'button':
        return { cursor: 'pointer', transition: 'all 0.3s ease' };
      case 'image':
        return { objectFit: 'cover' };
      case 'video':
        return { objectFit: 'cover' };
      default:
        return {};
    }
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    setElements(elements.map(element => 
      element.id === elementId ? { ...element, ...updates } : element
    ));
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(element => element.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Elemento removido!');
  };

  const getCanvasSize = () => {
    switch (activeView) {
      case 'desktop': return { width: 1200, height: 800 };
      case 'tablet': return { width: 768, height: 600 };
      case 'mobile': return { width: 375, height: 667 };
      default: return { width: 1200, height: 800 };
    }
  };

  const renderElement = (element: Element) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = element.content.level || 'h1';
        return (
          <HeadingTag 
            style={{ 
              color: element.content.color, 
              fontSize: element.content.fontSize + 'px',
              fontWeight: element.content.fontWeight,
              margin: 0,
              lineHeight: 1.2,
              textAlign: element.content.textAlign || 'left',
              marginTop: (element.content.marginTop || 0) + 'px',
              marginBottom: (element.content.marginBottom || 0) + 'px'
            }}
          >
            {element.content.text}
          </HeadingTag>
        );
      case 'text':
        return (
          <p 
            style={{ 
              color: element.content.color, 
              fontSize: element.content.fontSize + 'px',
              fontWeight: element.content.fontWeight || 'normal',
              lineHeight: element.content.lineHeight,
              margin: 0,
              textAlign: element.content.textAlign || 'left',
              marginTop: (element.content.marginTop || 0) + 'px',
              marginBottom: (element.content.marginBottom || 0) + 'px'
            }}
          >
            {element.content.text}
          </p>
        );
      case 'button':
        return (
          <button
            style={{
              backgroundColor: element.content.backgroundColor,
              color: element.content.color,
              padding: element.content.padding,
              borderRadius: element.content.borderRadius + 'px',
              border: 'none',
              cursor: 'pointer',
              ...element.style
            }}
          >
            {element.content.text}
          </button>
        );
      case 'image':
        return element.content.src ? (
          <img
            src={element.content.src}
            alt={element.content.alt}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: element.style?.objectFit || 'cover',
              borderRadius: element.content.borderRadius + 'px'
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
            border: '2px dashed #d1d5db',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <Image className="h-8 w-8 mx-auto mb-2" style={{ display: 'block' }} />
              <span>Adicionar Imagem</span>
            </div>
          </div>
        );
      case 'video':
        return element.content.src ? (
          <video
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: element.style?.objectFit || 'cover',
              borderRadius: element.content.borderRadius + 'px'
            }}
            controls
            poster={element.content.poster}
          >
            <source src={element.content.src} type="video/mp4" />
          </video>
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#f3f4f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed #d1d5db',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <Video className="h-8 w-8 mx-auto mb-2" style={{ display: 'block' }} />
              <span>Adicionar Vídeo</span>
            </div>
          </div>
        );
      case 'container':
        return (
          <div 
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.content.backgroundColor,
              padding: element.content.padding + 'px',
              borderRadius: element.content.borderRadius + 'px',
              border: element.content.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ color: '#6b7280', textAlign: 'center' }}>
              <Layout className="h-8 w-8 mx-auto mb-2" style={{ display: 'block' }} />
              <span>Container</span>
            </div>
          </div>
        );
      case 'section':
        return (
          <div 
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.content.backgroundColor,
              padding: element.content.padding + 'px',
              borderRadius: element.content.borderRadius + 'px',
              border: element.content.border
            }}
          >
            <div style={{ color: '#6b7280', textAlign: 'center', marginTop: '20px' }}>
              <Grid className="h-8 w-8 mx-auto mb-2" style={{ display: 'block' }} />
              <span>Seção</span>
            </div>
          </div>
        );
      case 'spacer':
        return (
          <div 
            style={{
              width: '100%',
              height: element.content.height + 'px',
              backgroundColor: element.content.backgroundColor
            }}
          />
        );
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: element.content.html }} />;
      case 'divider':
        return (
          <div 
            style={{
              width: '100%',
              height: element.content.height + 'px',
              backgroundColor: element.content.backgroundColor,
              borderTop: `2px ${element.content.style} ${element.content.backgroundColor}`
            }}
          />
        );
      default:
        return <div style={{ color: '#6b7280' }}>Elemento não suportado</div>;
    }
  };

  const selectedElementData = elements.find(e => e.id === selectedElement);
  const filteredElements = ELEMENT_CATEGORIES
    .find(cat => cat.id === activeCategory)
    ?.elements.filter(element => 
      element.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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

  const { width, height } = getCanvasSize();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Toolbar */}
      <div className="bg-white shadow-sm border-b h-16 flex items-center px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {templateData.name}
          </h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center space-x-2">
          {/* Viewport Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'desktop', label: 'Desktop', icon: Monitor },
              { id: 'tablet', label: 'Tablet', icon: Tablet },
              { id: 'mobile', label: 'Mobile', icon: Smartphone }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  activeView === id 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Elements */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex border-b">
            {ELEMENT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-red-50 text-red-600 border-b-2 border-red-600' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Elements Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {filteredElements.map((element) => (
                <button
                  key={element.id}
                  onClick={() => addElement(element.id)}
                  draggable
                  onDragStart={handleElementDragStart(element.id)}
                  className={`aspect-square rounded-lg text-white flex flex-col items-center justify-center space-y-2 hover:opacity-90 transition-all cursor-grab active:cursor-grabbing ${element.color} hover:scale-105`}
                  title={element.description}
                >
                  <element.icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center leading-tight">{element.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div className="flex-1 p-8 overflow-auto bg-gray-100">
            <div className="flex justify-center">
              <div 
                className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{ 
                  width, 
                  height, 
                  minHeight: height,
                  backgroundColor: background.type === 'color' ? background.value : '#ffffff',
                  backgroundImage: background.type === 'image' ? `url('${background.image}')` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onDrop={handleCanvasDrop}
                onDragOver={handleCanvasDragOver}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-pointer transition-all ${
                      selectedElement === element.id ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                    }`}
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
                      zIndex: selectedElement === element.id ? 10 : 1
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {renderElement(element)}
                  </div>
                ))}

                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">Comece criando sua página</p>
                      <p className="text-sm">Arraste elementos do painel lateral para o canvas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedElementData && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Propriedades</h3>
                <button
                  onClick={() => deleteElement(selectedElementData.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {/* Toolbar de ações rápidas */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newElement = { ...selectedElementData, id: `element_${Date.now()}` };
                    setElements([...elements, newElement]);
                    toast.success('Elemento duplicado!');
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    updateElement(selectedElementData.id, {
                      position: { x: (width - selectedElementData.size.width) / 2, y: selectedElementData.position.y }
                    });
                    toast.success('Elemento centralizado!');
                  }}
                  className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  title="Centralizar"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setElements(elements.map(el => 
                      el.id === selectedElementData.id 
                        ? { ...el, position: { x: width - el.size.width, y: el.position.y } }
                        : el
                    ));
                    toast.success('Elemento alinhado à direita!');
                  }}
                  className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                  title="Alinhar à direita"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setElements(elements.map(el => 
                      el.id === selectedElementData.id 
                        ? { ...el, position: { x: 0, y: el.position.y } }
                        : el
                    ));
                    toast.success('Elemento alinhado à esquerda!');
                  }}
                  className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                  title="Alinhar à esquerda"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {selectedElementData.type === 'heading' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto</label>
                    <input
                      type="text"
                      value={selectedElementData.content.text}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nível</label>
                    <select
                      value={selectedElementData.content.level}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, level: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="h1">H1 - Principal</option>
                      <option value="h2">H2 - Secundário</option>
                      <option value="h3">H3 - Terciário</option>
                      <option value="h4">H4</option>
                      <option value="h5">H5</option>
                      <option value="h6">H6</option>
                    </select>
                  </div>

                  {/* Alinhamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <div className="flex space-x-2">
                      {[
                        { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                        { value: 'center', icon: AlignCenter, label: 'Centro' },
                        { value: 'right', icon: AlignRight, label: 'Direita' },
                        { value: 'justify', icon: AlignJustify, label: 'Justificado' }
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, textAlign: value }
                          })}
                          className={`p-2 border rounded-lg transition-colors ${
                            selectedElementData.content.textAlign === value 
                              ? 'bg-red-100 border-red-500 text-red-600' 
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={selectedElementData.content.fontSize}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">{selectedElementData.content.fontSize}px</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso da Fonte</label>
                    <select
                      value={selectedElementData.content.fontWeight}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, fontWeight: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Negrito</option>
                      <option value="lighter">Mais Leve</option>
                      <option value="bolder">Mais Pesado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                    <input
                      type="color"
                      value={selectedElementData.content.color}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Espaçamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Espaçamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Margem Superior</label>
                        <input
                          type="number"
                          value={selectedElementData.content.marginTop || 0}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, marginTop: parseInt(e.target.value) }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Margem Inferior</label>
                        <input
                          type="number"
                          value={selectedElementData.content.marginBottom || 0}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, marginBottom: parseInt(e.target.value) }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto</label>
                    <textarea
                      value={selectedElementData.content.text}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={4}
                    />
                  </div>

                  {/* Alinhamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <div className="flex space-x-2">
                      {[
                        { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                        { value: 'center', icon: AlignCenter, label: 'Centro' },
                        { value: 'right', icon: AlignRight, label: 'Direita' },
                        { value: 'justify', icon: AlignJustify, label: 'Justificado' }
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, textAlign: value }
                          })}
                          className={`p-2 border rounded-lg transition-colors ${
                            selectedElementData.content.textAlign === value 
                              ? 'bg-red-100 border-red-500 text-red-600' 
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <input
                      type="range"
                      min="10"
                      max="32"
                      value={selectedElementData.content.fontSize}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">{selectedElementData.content.fontSize}px</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso da Fonte</label>
                    <select
                      value={selectedElementData.content.fontWeight || 'normal'}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, fontWeight: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Negrito</option>
                      <option value="lighter">Mais Leve</option>
                      <option value="bolder">Mais Pesado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                    <input
                      type="color"
                      value={selectedElementData.content.color}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Espaçamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Espaçamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Margem Superior</label>
                        <input
                          type="number"
                          value={selectedElementData.content.marginTop || 0}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, marginTop: parseInt(e.target.value) }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Margem Inferior</label>
                        <input
                          type="number"
                          value={selectedElementData.content.marginBottom || 0}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, marginBottom: parseInt(e.target.value) }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === 'button' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão</label>
                    <input
                      type="text"
                      value={selectedElementData.content.text}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                    <input
                      type="color"
                      value={selectedElementData.content.backgroundColor}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Texto</label>
                    <input
                      type="color"
                      value={selectedElementData.content.color}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bordas Arredondadas</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={selectedElementData.content.borderRadius}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, borderRadius: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">{selectedElementData.content.borderRadius}px</div>
                  </div>
                </div>
              )}

              {selectedElementData.type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                    <input
                      type="url"
                      value={selectedElementData.content.src}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, src: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto Alternativo</label>
                    <input
                      type="text"
                      value={selectedElementData.content.alt}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, alt: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Descrição da imagem"
                    />
                  </div>
                  {selectedElementData.content.src && (
                    <div className="mt-2">
                      <img 
                        src={selectedElementData.content.src} 
                        alt="Preview" 
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedElementData.type === 'background' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Fundo</label>
                    <select
                      value={background.type}
                      onChange={(e) => setBackground({ ...background, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="color">Cor Sólida</option>
                      <option value="image">Imagem</option>
                    </select>
                  </div>
                  
                  {background.type === 'color' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                      <input
                        type="color"
                        value={background.value}
                        onChange={(e) => setBackground({ ...background, value: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        Cor atual: {background.value}
                      </div>
                    </div>
                  )}
                  
                  {background.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem de Fundo</label>
                      <input
                        type="url"
                        value={background.image}
                        onChange={(e) => setBackground({ ...background, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="https://..."
                      />
                      {background.image && (
                        <div className="mt-2">
                          <img 
                            src={background.image} 
                            alt="Preview do fundo" 
                            className="w-full h-24 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      toast.success('Fundo aplicado ao canvas!');
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Aplicar ao Canvas
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}