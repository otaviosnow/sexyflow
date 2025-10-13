'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
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
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  _id: string;
  name: string;
  type: string;
  description?: string;
  content: any;
  previewImage?: string;
  isActive: boolean;
}

interface DragElement {
  id: string;
  type: 'text' | 'button' | 'image' | 'video' | 'background' | 'html' | 'container' | 'form' | 'gallery' | 'card';
  content: any;
  style: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const ELEMENT_TYPES = [
  { 
    id: 'text', 
    name: 'Texto', 
    icon: Type, 
    description: 'Adicionar texto personalizado',
    defaultContent: { 
      text: 'Seu texto aqui', 
      fontSize: 24, 
      color: '#ffffff', 
      fontWeight: 'bold',
      textAlign: 'left',
      fontFamily: 'Inter'
    }
  },
  { 
    id: 'button', 
    name: 'Botão', 
    icon: MousePointer, 
    description: 'Botão de ação com link',
    defaultContent: { 
      text: 'Clique Aqui', 
      url: '#', 
      backgroundColor: '#ff6b6b', 
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600'
    }
  },
  { 
    id: 'image', 
    name: 'Imagem', 
    icon: Image, 
    description: 'Adicionar imagem',
    defaultContent: { 
      src: '', 
      alt: 'Imagem', 
      width: 300, 
      height: 200
    }
  },
  { 
    id: 'video', 
    name: 'Vídeo', 
    icon: Video, 
    description: 'Adicionar vídeo',
    defaultContent: { 
      src: '', 
      poster: '', 
      width: 400, 
      height: 225
    }
  },
  { 
    id: 'background', 
    name: 'Fundo', 
    icon: Palette, 
    description: 'Imagem ou cor de fundo',
    defaultContent: { 
      type: 'color', 
      value: '#667eea', 
      image: '' 
    }
  },
  { 
    id: 'container', 
    name: 'Container', 
    icon: Move, 
    description: 'Container para organizar elementos',
    defaultContent: { 
      backgroundColor: 'transparent',
      padding: '20px',
      borderRadius: '8px'
    }
  }
];

export default function VisualEditor({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'elements' | 'properties' | 'code'>('elements');
  
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    description: '',
    previewImage: '',
    content: {
      desktop: { elements: [], background: { type: 'color', value: '#667eea' } },
      tablet: { elements: [], background: { type: 'color', value: '#667eea' } },
      mobile: { elements: [], background: { type: 'color', value: '#667eea' } }
    },
    isActive: true
  });

  const canvasRef = useRef<HTMLDivElement>(null);

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
        toast.success('Template salvo com sucesso!');
        router.push('/admin');
      } else {
        toast.error('Erro ao salvar template');
      }
    } catch (error) {
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const addElement = (elementType: string, position?: { x: number; y: number }) => {
    const elementConfig = ELEMENT_TYPES.find(e => e.id === elementType);
    if (!elementConfig) return;

    const newElement: DragElement = {
      id: `element_${Date.now()}`,
      type: elementType as any,
      content: { ...elementConfig.defaultContent },
      style: {
        position: 'absolute',
        zIndex: 1
      },
      position: position || { x: 50, y: 50 },
      size: { width: 200, height: 50 }
    };

    setTemplateData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [activeView]: {
          ...prev.content[activeView],
          elements: [...(prev.content[activeView]?.elements || []), newElement]
        }
      }
    }));

    setSelectedElement(newElement.id);
    toast.success(`${elementConfig.name} adicionado!`);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('elementType');
    if (!elementType) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    addElement(elementType, { x, y });
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleElementDragStart = (elementType: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', elementType);
  };

  const updateElement = (elementId: string, updates: Partial<DragElement>) => {
    setTemplateData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [activeView]: {
          ...prev.content[activeView],
          elements: prev.content[activeView]?.elements?.map((element: DragElement) =>
            element.id === elementId ? { ...element, ...updates } : element
          ) || []
        }
      }
    }));
  };

  const deleteElement = (elementId: string) => {
    setTemplateData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [activeView]: {
          ...prev.content[activeView],
          elements: prev.content[activeView]?.elements?.filter((element: DragElement) => 
            element.id !== elementId
          ) || []
        }
      }
    }));
    
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Elemento removido!');
  };

  const selectedElementData = templateData.content[activeView]?.elements?.find((e: DragElement) => e.id === selectedElement);

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
                Editor Visual: {templateData.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('code')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Code className="h-4 w-4 mr-2" />
                Ver Código
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

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'elements', label: 'Elementos', icon: Plus },
                { id: 'properties', label: 'Propriedades', icon: Settings },
                { id: 'code', label: 'Código', icon: Code }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 transition-colors ${
                    activeTab === id 
                      ? 'bg-red-100 text-red-600 border-b-2 border-red-600' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'elements' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Elementos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {ELEMENT_TYPES.map((element) => (
                      <div
                        key={element.id}
                        draggable
                        onDragStart={handleElementDragStart(element.id)}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center group cursor-grab active:cursor-grabbing"
                      >
                        <element.icon className="h-6 w-6 mx-auto mb-2 text-gray-400 group-hover:text-red-500" />
                        <div className="text-sm font-medium text-gray-700 group-hover:text-red-700">
                          {element.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Arraste para o canvas
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Viewport</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'desktop', label: 'Desktop', icon: Monitor },
                      { id: 'tablet', label: 'Tablet', icon: Tablet },
                      { id: 'mobile', label: 'Mobile', icon: Smartphone }
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveView(id as any)}
                        className={`p-3 rounded-lg transition-colors ${
                          activeView === id 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-xs">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Elementos na Página</h3>
                  <div className="space-y-2">
                    {templateData.content[activeView]?.elements?.map((element: DragElement, index: number) => (
                      <div
                        key={element.id}
                        className={`p-3 border rounded-lg cursor-move transition-colors ${
                          selectedElement === element.id 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Move className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {ELEMENT_TYPES.find(e => e.id === element.type)?.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && selectedElementData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Propriedades: {ELEMENT_TYPES.find(e => e.id === selectedElementData.type)?.name}
                  </h3>
                  
                  {selectedElementData.type === 'text' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Texto</label>
                        <textarea
                          value={selectedElementData.content.text}
                          onChange={(e) => selectedElement && updateElement(selectedElement, { 
                            content: { ...selectedElementData.content, text: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                        <input
                          type="number"
                          value={selectedElementData.content.fontSize}
                          onChange={(e) => selectedElement && updateElement(selectedElement, { 
                            content: { ...selectedElementData.content, fontSize: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                        <input
                          type="color"
                          value={selectedElementData.content.color}
                          onChange={(e) => selectedElement && updateElement(selectedElement, { 
                            content: { ...selectedElementData.content, color: e.target.value }
                          })}
                          className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElementData.type === 'background' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Fundo</label>
                        <select
                          value={selectedElementData.content.type}
                          onChange={(e) => selectedElement && updateElement(selectedElement, { 
                            content: { ...selectedElementData.content, type: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="color">Cor Sólida</option>
                          <option value="image">Imagem</option>
                        </select>
                      </div>
                      
                      {selectedElementData.content.type === 'color' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                          <input
                            type="color"
                            value={selectedElementData.content.value}
                            onChange={(e) => selectedElement && updateElement(selectedElement, { 
                              content: { ...selectedElementData.content, value: e.target.value }
                            })}
                            className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      )}
                      
                      {selectedElementData.content.type === 'image' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                          <input
                            type="url"
                            value={selectedElementData.content.image}
                            onChange={(e) => selectedElement && updateElement(selectedElement, { 
                              content: { ...selectedElementData.content, image: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="https://..."
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Código HTML Gerado</h3>
                <textarea
                  value="<div>Preview em desenvolvimento</div>"
                  readOnly
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Canvas - {activeView}</h3>
              <div className="text-sm text-gray-500">
                {templateData.content[activeView]?.elements?.length || 0} elementos
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-8 overflow-auto bg-gray-100">
            <div className="flex justify-center">
              <div 
                ref={canvasRef}
                className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{
                  width: activeView === 'desktop' ? '1200px' : activeView === 'tablet' ? '768px' : '375px',
                  height: activeView === 'desktop' ? '800px' : activeView === 'tablet' ? '600px' : '667px',
                  minHeight: activeView === 'desktop' ? '800px' : activeView === 'tablet' ? '600px' : '667px',
                  backgroundColor: templateData.content[activeView]?.background?.type === 'color' 
                    ? templateData.content[activeView]?.background?.value 
                    : '#ffffff',
                  backgroundImage: templateData.content[activeView]?.background?.type === 'image' 
                    ? `url('${templateData.content[activeView]?.background?.image}')` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onDrop={handleCanvasDrop}
                onDragOver={handleCanvasDragOver}
              >
              {templateData.content[activeView]?.elements?.map((element: DragElement, index: number) => (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer transition-all ${
                    selectedElement === element.id ? 'ring-2 ring-red-500' : ''
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height,
                    zIndex: index + 1
                  }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.type === 'text' && (
                    <div 
                      style={{
                        color: element.content.color,
                        fontSize: element.content.fontSize + 'px',
                        fontWeight: element.content.fontWeight
                      }}
                    >
                      {element.content.text}
                    </div>
                  )}
                  
                  {element.type === 'button' && (
                    <button
                      className="px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: element.content.backgroundColor,
                        color: element.content.color
                      }}
                    >
                      {element.content.text}
                    </button>
                  )}
                  
                  {element.type === 'image' && element.content.src && (
                    <img
                      src={element.content.src}
                      alt={element.content.alt}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  
                  {element.type === 'video' && element.content.src && (
                    <video
                      className="w-full h-full object-cover rounded"
                      controls
                      poster={element.content.poster}
                    >
                      <source src={element.content.src} type="video/mp4" />
                    </video>
                  )}

                  {element.type === 'container' && (
                    <div 
                      className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
                      style={{
                        backgroundColor: element.content.backgroundColor,
                        padding: element.content.padding,
                        borderRadius: element.content.borderRadius
                      }}
                    >
                      <div className="text-center text-gray-500">
                        <Move className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Container</p>
                      </div>
                    </div>
                  )}

                  {!element.content.src && (element.type === 'image' || element.type === 'video') && (
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-500">
                        {element.type === 'image' ? (
                          <>
                            <Image className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Clique para adicionar imagem</p>
                          </>
                        ) : (
                          <>
                            <Video className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Clique para adicionar vídeo</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!templateData.content[activeView]?.elements || templateData.content[activeView]?.elements.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg">Adicione elementos arrastando do painel lateral</p>
                    <p className="text-sm">Clique em um elemento para adicioná-lo ao canvas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}