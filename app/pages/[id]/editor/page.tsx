'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  Image, 
  Video, 
  Code, 
  Palette,
  Type,
  Settings,
  Download,
  Trash2,
  Minus
} from 'lucide-react';

interface PageData {
  _id: string;
  title: string;
  type: string;
  slug: string;
  content: any;
  isPublished: boolean;
}

interface DragItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'spacer' | 'pixel';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
}

export default function PageEditor({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'elements' | 'design' | 'settings'>('elements');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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
        
        // Converter content para dragItems se existir
        if (pageData.content && pageData.content.elements) {
          setDragItems(pageData.content.elements);
        }
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
        body: JSON.stringify({
          ...page,
          content: {
            ...page.content,
            elements: dragItems
          }
        }),
      });

      if (response.ok) {
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

  const addElement = (type: DragItem['type']) => {
    const newItem: DragItem = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50 + dragItems.length * 60,
      width: type === 'image' ? 300 : type === 'video' ? 400 : type === 'spacer' ? 400 : 250,
      height: type === 'image' ? 200 : type === 'video' ? 225 : type === 'spacer' ? 50 : 50,
      content: getDefaultContent(type)
    };
    
    setDragItems([...dragItems, newItem]);
  };

  const getDefaultContent = (type: DragItem['type']) => {
    switch (type) {
      case 'text':
        return { text: 'Clique para editar', fontSize: 24, color: '#000000' };
      case 'button':
        return { text: 'Clique Aqui', backgroundColor: '#dc2626', color: '#ffffff' };
      case 'spacer':
        return { height: 50, backgroundColor: '#f3f4f6', borderColor: '#d1d5db' };
      case 'pixel':
        return { pixelId: '', event: 'PageView' };
      default:
        return {};
    }
  };

  const updateItem = (id: string, updates: Partial<DragItem>) => {
    setDragItems(items => 
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setDragItems(items => items.filter(item => item.id !== id));
    if (selectedItem === id) {
      setSelectedItem(null);
    }
  };

  const handleFileUpload = async (file: File, itemId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', itemId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        updateItem(itemId, {
          content: {
            ...dragItems.find(item => item.id === itemId)?.content,
            url: result.url
          }
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
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

  const selectedItemData = dragItems.find(item => item.id === selectedItem);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </button>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {page.title}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'elements', label: 'Elementos', icon: Type },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'settings', label: 'Config', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
                activeTab === id 
                  ? 'bg-red-50 text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Adicionar Elementos</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addElement('text')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Type className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Texto</span>
                </button>
                
                <button
                  onClick={() => addElement('image')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Image className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Imagem</span>
                </button>
                
                <button
                  onClick={() => addElement('video')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Video className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Vídeo</span>
                </button>
                
                <button
                  onClick={() => addElement('button')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Settings className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Botão</span>
                </button>
                
                <button
                  onClick={() => addElement('spacer')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Minus className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Espaçador</span>
                </button>
                
                <button
                  onClick={() => addElement('pixel')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Code className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Pixel Facebook</span>
                </button>
              </div>

              {/* Elements List */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Elementos na Página</h3>
                <div className="space-y-2">
                  {dragItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedItem === item.id 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {item.type === 'text' && <Type className="h-4 w-4 text-gray-600" />}
                          {item.type === 'image' && <Image className="h-4 w-4 text-gray-600" />}
                          {item.type === 'video' && <Video className="h-4 w-4 text-gray-600" />}
                          {item.type === 'button' && <Settings className="h-4 w-4 text-gray-600" />}
                          {item.type === 'spacer' && <Minus className="h-4 w-4 text-gray-600" />}
                          {item.type === 'pixel' && <Code className="h-4 w-4 text-gray-600" />}
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.type}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

          {activeTab === 'design' && selectedItemData && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Propriedades - {selectedItemData.type}
              </h3>
              
              {selectedItemData.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Texto
                    </label>
                    <textarea
                      value={selectedItemData.content.text || ''}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tamanho da Fonte
                    </label>
                    <input
                      type="number"
                      value={selectedItemData.content.fontSize || 16}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cor
                    </label>
                    <input
                      type="color"
                      value={selectedItemData.content.color || '#000000'}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {selectedItemData.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Upload de Imagem
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, selectedItem!);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  {selectedItemData.content.url && (
                    <div className="mt-2">
                      <img 
                        src={selectedItemData.content.url} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedItemData.type === 'video' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Upload de Vídeo
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, selectedItem!);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL do Vídeo (YouTube, Vimeo, etc.)
                    </label>
                    <input
                      type="url"
                      value={selectedItemData.content.url || ''}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, url: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              )}

              {selectedItemData.type === 'button' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={selectedItemData.content.text || ''}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL do Botão
                    </label>
                    <input
                      type="url"
                      value={selectedItemData.content.url || ''}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, url: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cor de Fundo
                    </label>
                    <input
                      type="color"
                      value={selectedItemData.content.backgroundColor || '#dc2626'}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cor do Texto
                    </label>
                    <input
                      type="color"
                      value={selectedItemData.content.color || '#ffffff'}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {selectedItemData.type === 'spacer' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Altura (px)
                    </label>
                    <input
                      type="number"
                      value={selectedItemData.content.height || 50}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, height: parseInt(e.target.value) },
                        height: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min="10"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cor de Fundo
                    </label>
                    <input
                      type="color"
                      value={selectedItemData.content.backgroundColor || '#f3f4f6'}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cor da Borda
                    </label>
                    <input
                      type="color"
                      value={selectedItemData.content.borderColor || '#d1d5db'}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, borderColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {selectedItemData.type === 'pixel' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ID do Pixel
                    </label>
                    <input
                      type="text"
                      value={selectedItemData.content.pixelId || ''}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, pixelId: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="123456789012345"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Evento
                    </label>
                    <select
                      value={selectedItemData.content.event || 'PageView'}
                      onChange={(e) => updateItem(selectedItem!, {
                        content: { ...selectedItemData.content, event: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="PageView">PageView</option>
                      <option value="Lead">Lead</option>
                      <option value="Purchase">Purchase</option>
                      <option value="ViewContent">ViewContent</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Configurações da Página</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Título da Página
                  </label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={page.isPublished ? 'published' : 'draft'}
                    onChange={(e) => setPage({ ...page, isPublished: e.target.value === 'published' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            
            <button
              onClick={() => window.open(`/${page.slug}`, '_blank')}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Editor Visual - {page.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {page.isPublished ? 'Publicada' : 'Rascunho'}
              </span>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div 
            ref={canvasRef}
            className="bg-white mx-auto shadow-lg rounded-lg overflow-hidden"
            style={{ width: '800px', height: '600px', position: 'relative' }}
          >
            {dragItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item.id)}
                className={`absolute border-2 cursor-move ${
                  selectedItem === item.id 
                    ? 'border-red-500' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                }}
              >
                {item.type === 'text' && (
                  <div
                    style={{
                      fontSize: item.content.fontSize || 16,
                      color: item.content.color || '#000000',
                      padding: '8px',
                    }}
                  >
                    {item.content.text || 'Clique para editar'}
                  </div>
                )}
                
                {item.type === 'image' && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    {item.content.url ? (
                      <img 
                        src={item.content.url} 
                        alt="Uploaded" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Image className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">Clique para upload</span>
                      </div>
                    )}
                  </div>
                )}
                
                {item.type === 'video' && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    {item.content.url ? (
                      <div className="w-full h-full">
                        {item.content.url.includes('youtube.com') || item.content.url.includes('youtu.be') ? (
                          <iframe
                            src={item.content.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                          />
                        ) : (
                          <video controls className="w-full h-full">
                            <source src={item.content.url} />
                          </video>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Video className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">Adicione um vídeo</span>
                      </div>
                    )}
                  </div>
                )}
                
                {item.type === 'button' && (
                  <button
                    className="w-full h-full rounded"
                    style={{
                      backgroundColor: item.content.backgroundColor || '#dc2626',
                      color: item.content.color || '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {item.content.text || 'Clique Aqui'}
                  </button>
                )}
                
                {item.type === 'spacer' && (
                  <div 
                    className="w-full h-full flex items-center justify-center border-2 border-dashed rounded"
                    style={{
                      backgroundColor: item.content.backgroundColor || '#f3f4f6',
                      borderColor: item.content.borderColor || '#d1d5db',
                      minHeight: item.content.height || 50
                    }}
                  >
                    <div className="text-center text-gray-500">
                      <Minus className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Espaçador</span>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.content.height || 50}px
                      </div>
                    </div>
                  </div>
                )}
                
                {item.type === 'pixel' && (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 border border-blue-200 rounded">
                    <div className="text-center text-blue-600">
                      <Code className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-xs">Facebook Pixel</span>
                      <div className="text-xs text-blue-500 mt-1">
                        {item.content.pixelId || 'Sem ID'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {dragItems.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Type className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Página Vazia</p>
                  <p className="text-sm">Adicione elementos na barra lateral para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
