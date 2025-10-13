'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Type, MousePointer, Image, Video, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  _id: string;
  name: string;
  type: string;
  content: any;
}

interface Element {
  id: string;
  type: 'text' | 'button' | 'image' | 'video' | 'background';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const ELEMENT_TYPES = [
  { id: 'text', name: 'Texto', icon: Type, color: 'bg-blue-500' },
  { id: 'button', name: 'Botão', icon: MousePointer, color: 'bg-green-500' },
  { id: 'image', name: 'Imagem', icon: Image, color: 'bg-purple-500' },
  { id: 'video', name: 'Vídeo', icon: Video, color: 'bg-orange-500' },
  { id: 'background', name: 'Fundo', icon: Palette, color: 'bg-pink-500' },
];

export default function VisualEditor({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    content: {}
  });

  const [elements, setElements] = useState<Element[]>([]);

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
        // Inicializar elementos se não existirem
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
          elements: elements
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
      type: type as any,
      content: getDefaultContent(type),
      position: { x: 50, y: 50 + (elements.length * 60) },
      size: { width: 200, height: 50 }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Elemento adicionado!');
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Seu texto aqui', fontSize: 24, color: '#000000' };
      case 'button':
        return { text: 'Clique Aqui', backgroundColor: '#ff6b6b', color: '#ffffff' };
      case 'image':
        return { src: '', alt: 'Imagem' };
      case 'video':
        return { src: '', poster: '' };
      case 'background':
        return { type: 'color', value: '#667eea' };
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
      case 'text':
        return (
          <div 
            style={{ 
              color: element.content.color, 
              fontSize: element.content.fontSize + 'px',
              fontWeight: 'bold'
            }}
          >
            {element.content.text}
          </div>
        );
      case 'button':
        return (
          <button
            style={{
              backgroundColor: element.content.backgroundColor,
              color: element.content.color,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
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
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#f3f4f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed #d1d5db'
          }}>
            <span style={{ color: '#6b7280' }}>Imagem</span>
          </div>
        );
      case 'video':
        return element.content.src ? (
          <video
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
            border: '2px dashed #d1d5db'
          }}>
            <span style={{ color: '#6b7280' }}>Vídeo</span>
          </div>
        );
      default:
        return <div>Elemento não suportado</div>;
    }
  };

  const selectedElementData = elements.find(e => e.id === selectedElement);

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
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
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Elementos</h3>
            
            {/* Botões para adicionar elementos */}
            <div className="space-y-2 mb-6">
              {ELEMENT_TYPES.map((element) => (
                <button
                  key={element.id}
                  onClick={() => addElement(element.id)}
                  className={`w-full p-3 rounded-lg text-white flex items-center space-x-3 hover:opacity-90 transition-opacity ${element.color}`}
                >
                  <element.icon className="h-5 w-5" />
                  <span>Adicionar {element.name}</span>
                </button>
              ))}
            </div>

            {/* Viewport selector */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Viewport</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'desktop', label: 'Desktop', size: '1200x800' },
                  { id: 'tablet', label: 'Tablet', size: '768x600' },
                  { id: 'mobile', label: 'Mobile', size: '375x667' }
                ].map(({ id, label, size }) => (
                  <button
                    key={id}
                    onClick={() => setActiveView(id as any)}
                    className={`p-2 text-xs rounded border transition-colors ${
                      activeView === id 
                        ? 'bg-red-100 border-red-500 text-red-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-xs opacity-75">{size}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de elementos */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Elementos ({elements.length})
              </h4>
              <div className="space-y-2">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedElement === element.id 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          ELEMENT_TYPES.find(e => e.id === element.type)?.color || 'bg-gray-400'
                        }`}></div>
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
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Canvas - {activeView} ({width}x{height})
              </h3>
              <div className="text-sm text-gray-500">
                {elements.length} elementos
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-8 overflow-auto bg-gray-100">
            <div className="flex justify-center">
              <div 
                className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{ width, height, minHeight: height }}
              >
                {elements.map((element) => (
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
                      zIndex: 1
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
                      <p className="text-lg">Adicione elementos do painel lateral</p>
                      <p className="text-sm">Clique nos botões coloridos para começar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElementData && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Propriedades
              </h3>
              
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
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <input
                      type="number"
                      value={selectedElementData.content.fontSize}
                      onChange={(e) => updateElement(selectedElementData.id, {
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
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
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
                </div>
              )}

              {selectedElementData.type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL do Vídeo</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL do Poster</label>
                    <input
                      type="url"
                      value={selectedElementData.content.poster}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, poster: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}