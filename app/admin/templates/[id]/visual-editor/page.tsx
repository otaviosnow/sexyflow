'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  Code
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ChromePicker } from 'react-color';
import { useDropzone } from 'react-dropzone';
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
  responsive?: {
    desktop: { position: { x: number; y: number }; size: { width: number; height: number } };
    tablet: { position: { x: number; y: number }; size: { width: number; height: number } };
    mobile: { position: { x: number; y: number }; size: { width: number; height: number } };
  };
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
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
      hoverEffect: 'scale'
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
      height: 200,
      borderRadius: '8px',
      objectFit: 'cover'
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
      height: 225,
      borderRadius: '8px'
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
      borderRadius: '8px',
      border: '1px dashed #ccc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  { 
    id: 'form', 
    name: 'Formulário', 
    icon: Settings, 
    description: 'Formulário de contato',
    defaultContent: { 
      title: 'Entre em Contato',
      fields: [
        { type: 'text', label: 'Nome', placeholder: 'Seu nome', required: true },
        { type: 'email', label: 'Email', placeholder: 'seu@email.com', required: true },
        { type: 'textarea', label: 'Mensagem', placeholder: 'Sua mensagem...', required: true }
      ],
      submitText: 'Enviar Mensagem',
      backgroundColor: '#ffffff',
      padding: '30px'
    }
  },
  { 
    id: 'gallery', 
    name: 'Galeria', 
    icon: Image, 
    description: 'Galeria de imagens',
    defaultContent: { 
      images: [],
      columns: 3,
      spacing: '10px',
      borderRadius: '8px',
      showCaptions: false,
      lightbox: true
    }
  },
  { 
    id: 'card', 
    name: 'Card', 
    icon: Move, 
    description: 'Card com conteúdo',
    defaultContent: { 
      title: 'Título do Card',
      description: 'Descrição do card aqui...',
      image: '',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: 'none'
    }
  },
  { 
    id: 'html', 
    name: 'HTML', 
    icon: Code, 
    description: 'Código HTML personalizado',
    defaultContent: { 
      html: '<div>HTML personalizado</div>' 
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
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

  const handleElementMove = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const element = templateData.content[activeView]?.elements?.find((el: DragElement) => el.id === elementId);
    if (!element) return;

    const startElementX = element.position.x;
    const startElementY = element.position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newX = Math.max(0, Math.min(startElementX + deltaX, 1200 - element.size.width));
      const newY = Math.max(0, Math.min(startElementY + deltaY, 800 - element.size.height));

      updateElement(elementId, {
        position: { x: newX, y: newY }
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleElementResize = (e: React.MouseEvent, elementId: string, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const element = templateData.content[activeView]?.elements?.find((el: DragElement) => el.id === elementId);
    if (!element) return;

    const startWidth = element.size.width;
    const startHeight = element.size.height;
    const startElementX = element.position.x;
    const startElementY = element.position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startElementX;
      let newY = startElementY;

      switch (direction) {
        case 'se': // Southeast
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          break;
        case 'sw': // Southwest
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          newX = Math.max(0, startElementX + deltaX);
          break;
        case 'ne': // Northeast
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newY = Math.max(0, startElementY + deltaY);
          break;
        case 'nw': // Northwest
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newX = Math.max(0, startElementX + deltaX);
          newY = Math.max(0, startElementY + deltaY);
          break;
      }

      updateElement(elementId, {
        size: { width: newWidth, height: newHeight },
        position: { x: newX, y: newY }
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(templateData.content[activeView]?.elements || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTemplateData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [activeView]: {
          ...prev.content[activeView],
          elements: items
        }
      }
    }));
  };

  const onFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Arquivo enviado com sucesso!');
        
        // Se temos um elemento selecionado e é imagem/vídeo
        if (selectedElement && (templateData.content[activeView]?.elements?.find((e: DragElement) => e.id === selectedElement)?.type === 'image' || 'video')) {
          updateElement(selectedElement, {
            content: {
              ...templateData.content[activeView]?.elements?.find((e: DragElement) => e.id === selectedElement)?.content,
              src: result.url
            }
          });
        }
      } else {
        toast.error('Erro ao enviar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    }
  });

  const generateHTML = () => {
    const elements = templateData.content[activeView]?.elements || [];
    const background = templateData.content[activeView]?.background || { type: 'color', value: '#667eea' };
    
    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateData.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      ${background.type === 'color' ? `background-color: ${background.value};` : ''}
      ${background.type === 'image' ? `background-image: url('${background.image}'); background-size: cover; background-position: center;` : ''}
      min-height: 100vh;
      position: relative;
    }
    .container {
      position: relative;
      min-height: 100vh;
    }
    `;

    elements.forEach((element: DragElement, index: number) => {
      html += `
    .element-${index} {
      position: absolute;
      left: ${element.position.x}px;
      top: ${element.position.y}px;
      width: ${element.size.width}px;
      height: ${element.size.height}px;
      z-index: ${index + 1};
    }`;
    });

    html += `
  </style>
</head>
<body>
  <div class="container">`;

    elements.forEach((element: DragElement, index: number) => {
      switch (element.type) {
        case 'text':
          html += `
    <div class="element-${index}" style="color: ${element.content.color}; font-size: ${element.content.fontSize}px; font-weight: ${element.content.fontWeight};">
      ${element.content.text}
    </div>`;
          break;
        case 'button':
          html += `
    <a href="${element.content.url}" class="element-${index}" style="background-color: ${element.content.backgroundColor}; color: ${element.content.color}; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
      ${element.content.text}
    </a>`;
          break;
        case 'image':
          html += `
    <img src="${element.content.src}" alt="${element.content.alt}" class="element-${index}" style="width: 100%; height: 100%; object-fit: cover;">`;
          break;
        case 'video':
          html += `
    <video class="element-${index}" controls poster="${element.content.poster}" style="width: 100%; height: 100%; object-fit: cover;">
      <source src="${element.content.src}" type="video/mp4">
    </video>`;
          break;
        case 'container':
          html += `
    <div class="element-${index}" style="background-color: ${element.content.backgroundColor}; padding: ${element.content.padding}; border-radius: ${element.content.borderRadius}; border: ${element.content.border};">
      Container
    </div>`;
          break;
        case 'form':
          html += `
    <div class="element-${index}" style="background-color: ${element.content.backgroundColor}; padding: ${element.content.padding};">
      <h3>${element.content.title}</h3>
      ${element.content.fields.map((field: any) => `
        <div>
          <label>${field.label}</label>
          <input type="${field.type}" placeholder="${field.placeholder}" />
        </div>
      `).join('')}
      <button>${element.content.submitText}</button>
    </div>`;
          break;
        case 'gallery':
          html += `
    <div class="element-${index}">
      Galeria (${element.content.images.length} imagens)
    </div>`;
          break;
        case 'card':
          html += `
    <div class="element-${index}" style="background-color: ${element.content.backgroundColor}; padding: ${element.content.padding}; border-radius: ${element.content.borderRadius}; box-shadow: ${element.content.boxShadow};">
      ${element.content.image ? `<img src="${element.content.image}" alt="Card" />` : ''}
      <h3>${element.content.title}</h3>
      <p>${element.content.description}</p>
    </div>`;
          break;
        case 'html':
          html += `
    <div class="element-${index}">
      ${element.content.html}
    </div>`;
          break;
      }
    });

    html += `
  </div>
</body>
</html>`;

    return html;
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
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="elements">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {templateData.content[activeView]?.elements?.map((element: DragElement, index: number) => (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
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
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-left"
                          style={{ backgroundColor: selectedElementData.content.color }}
                        >
                          {selectedElementData.content.color}
                        </button>
                        {showColorPicker && (
                          <div className="mt-2">
                            <ChromePicker
                              color={selectedElementData.content.color}
                              onChange={(color) => selectedElement && updateElement(selectedElement, { 
                                content: { ...selectedElementData.content, color: color.hex }
                              })}
                            />
                          </div>
                        )}
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
                          <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center space-x-3"
                            style={{ backgroundColor: selectedElementData.content.value }}
                          >
                            <div className="w-8 h-8 border border-gray-400 rounded" style={{ backgroundColor: selectedElementData.content.value }}></div>
                            <span className="text-gray-700">{selectedElementData.content.value}</span>
                          </button>
                          {showColorPicker && (
                            <div className="mt-2">
                              <ChromePicker
                                color={selectedElementData.content.value}
                                onChange={(color) => selectedElement && updateElement(selectedElement, { 
                                  content: { ...selectedElementData.content, value: color.hex }
                                })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedElementData.content.type === 'image' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo</label>
                          <div
                            {...getRootProps()}
                            className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                              isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input {...getInputProps()} />
                            <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Arraste uma imagem aqui ou clique para selecionar
                            </p>
                          </div>
                          {selectedElementData.content.image && (
                            <div className="mt-3">
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
                              <div className="mt-2">
                                <img 
                                  src={selectedElementData.content.image} 
                                  alt="Preview" 
                                  className="w-full h-32 object-cover rounded border"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedElementData.type === 'button' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão</label>
                        <input
                          type="text"
                          value={selectedElementData.content.text}
                          onChange={(e) => selectedElement && updateElement(selectedElement, { 
                            content: { ...selectedElementData.content, text: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input
                          type="url"
                          value={selectedElementData.content.url}
                          onChange={(e) => selectedElement && updateElement(selectedElement, { 
                            content: { ...selectedElementData.content, url: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-left"
                          style={{ backgroundColor: selectedElementData.content.backgroundColor }}
                        >
                          {selectedElementData.content.backgroundColor}
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedElementData.type === 'image' || selectedElementData.type === 'video') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload de Arquivo</label>
                        <div
                          {...getRootProps()}
                          className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                            isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Arraste arquivos aqui ou clique para selecionar
                          </p>
                        </div>
                      </div>
                      {selectedElementData.content.src && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">URL Atual</label>
                          <input
                            type="url"
                            value={selectedElementData.content.src}
                            onChange={(e) => selectedElement && updateElement(selectedElement, { 
                              content: { ...selectedElementData.content, src: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  value={generateHTML()}
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
                  onMouseDown={(e) => handleElementMove(e, element.id)}
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
                        borderRadius: element.content.borderRadius,
                        border: element.content.border,
                        display: element.content.display,
                        flexDirection: element.content.flexDirection,
                        alignItems: element.content.alignItems,
                        justifyContent: element.content.justifyContent
                      }}
                    >
                      <div className="text-center text-gray-500">
                        <Move className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Container</p>
                        <p className="text-xs">Arraste elementos aqui</p>
                      </div>
                    </div>
                  )}

                  {element.type === 'form' && (
                    <div 
                      className="w-full h-full p-4 bg-white rounded-lg border"
                      style={{
                        backgroundColor: element.content.backgroundColor,
                        padding: element.content.padding
                      }}
                    >
                      <h3 className="text-lg font-semibold mb-4">{element.content.title}</h3>
                      {element.content.fields.map((field: any, index: number) => (
                        <div key={index} className="mb-3">
                          <label className="block text-sm font-medium mb-1">{field.label}</label>
                          {field.type === 'textarea' ? (
                            <textarea 
                              className="w-full p-2 border rounded"
                              placeholder={field.placeholder}
                              rows={3}
                            />
                          ) : (
                            <input 
                              type={field.type}
                              className="w-full p-2 border rounded"
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                      <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                        {element.content.submitText}
                      </button>
                    </div>
                  )}

                  {element.type === 'gallery' && (
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-500">
                        <Image className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Galeria</p>
                        <p className="text-xs">{element.content.images.length} imagens</p>
                      </div>
                    </div>
                  )}

                  {element.type === 'card' && (
                    <div 
                      className="w-full h-full p-4 rounded-lg border"
                      style={{
                        backgroundColor: element.content.backgroundColor,
                        padding: element.content.padding,
                        borderRadius: element.content.borderRadius,
                        boxShadow: element.content.boxShadow,
                        border: element.content.border
                      }}
                    >
                      {element.content.image && (
                        <img 
                          src={element.content.image} 
                          alt="Card" 
                          className="w-full h-24 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="text-lg font-semibold mb-2">{element.content.title}</h3>
                      <p className="text-sm text-gray-600">{element.content.description}</p>
                    </div>
                  )}

                  {element.type === 'html' && (
                    <div dangerouslySetInnerHTML={{ __html: element.content.html }} />
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

                  {/* Resize Handles */}
                  {selectedElement === element.id && (
                    <>
                      {/* Corner handles */}
                      <div
                        className="absolute w-3 h-3 bg-red-500 border border-white cursor-nw-resize"
                        style={{ top: -6, left: -6 }}
                        onMouseDown={(e) => handleElementResize(e, element.id, 'nw')}
                      />
                      <div
                        className="absolute w-3 h-3 bg-red-500 border border-white cursor-ne-resize"
                        style={{ top: -6, right: -6 }}
                        onMouseDown={(e) => handleElementResize(e, element.id, 'ne')}
                      />
                      <div
                        className="absolute w-3 h-3 bg-red-500 border border-white cursor-sw-resize"
                        style={{ bottom: -6, left: -6 }}
                        onMouseDown={(e) => handleElementResize(e, element.id, 'sw')}
                      />
                      <div
                        className="absolute w-3 h-3 bg-red-500 border border-white cursor-se-resize"
                        style={{ bottom: -6, right: -6 }}
                        onMouseDown={(e) => handleElementResize(e, element.id, 'se')}
                      />
                    </>
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
