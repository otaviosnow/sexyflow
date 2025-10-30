'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Globe,
  Type,
  Image,
  Video,
  Square,
  Code,
  MousePointer,
  Palette,
  Settings,
  Trash2,
  Plus,
  Move,
  RotateCcw,
  RotateCw,
  Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Element {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: any;
  spacing: { top: number; bottom: number };
}

interface Page {
  _id: string;
  title: string;
  slug: string;
  type: string;
  content: {
    elements: Element[];
    background: any;
  };
  isPublished: boolean;
  isActive: boolean;
}

interface Project {
  _id: string;
  name: string;
  subdomain: string;
}

export default function PageEditor({ params }: { params: { id: string; pageId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [background, setBackground] = useState({ 
    type: 'color', 
    value: '#ffffff', 
    opacity: 1, 
    image: '', 
    position: 'center' as string, 
    size: 'cover' as string 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'elements' | 'design' | 'settings'>('elements');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Só carregar dados se ainda não foram carregados
    if (status === 'authenticated' && session && !dataLoaded) {
      loadData();
    }
  }, [status, session, router, dataLoaded]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar projeto
      const projectResponse = await fetch(`/api/projects/${params.id}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Buscar página
      const pageResponse = await fetch(`/api/pages/${params.pageId}`);
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        setPage(pageData);
        setElements(pageData.content?.elements || []);
        setBackground(pageData.content?.background || { 
          type: 'color', 
          value: '#ffffff', 
          opacity: 1, 
          image: '', 
          position: 'center' as string, 
          size: 'cover' as string 
        });
      }
      
      // Marcar dados como carregados
      setDataLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    if (!page) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          content: {
            elements: elements,
            background: background
          }
        })
      });

      if (response.ok) {
        toast.success('Página salva com sucesso!');
        setHasUnsavedChanges(false);
      } else {
        toast.error('Erro ao salvar página');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar página');
    } finally {
      setSaving(false);
    }
  };

  const publishPage = async () => {
    if (!page) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: true,
          content: {
            elements: elements,
            background: background
          }
        })
      });

      if (response.ok) {
        toast.success('Página publicada com sucesso!');
        setPage({ ...page, isPublished: true });
        setHasUnsavedChanges(false);
      } else {
        toast.error('Erro ao publicar página');
      }
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast.error('Erro ao publicar página');
    } finally {
      setSaving(false);
    }
  };

  const unpublishPage = async () => {
    if (!page) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: false })
      });
      if (response.ok) {
        toast.success('Página despublicada com sucesso!');
        setPage({ ...page, isPublished: false });
        setHasUnsavedChanges(false);
      } else {
        toast.error('Erro ao despublicar página');
      }
    } catch (error) {
      console.error('Erro ao despublicar:', error);
      toast.error('Erro ao despublicar página');
    } finally {
      setSaving(false);
    }
  };

  const addElement = (type: string) => {
    const defaultSize = getDefaultSize(type);
    // Centralizar horizontalmente: (800px canvas - width) / 2 ≈ 300px para elementos de 300px
    const centerX = 400 - (defaultSize.width / 2);
    
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: { x: centerX, y: elements.length * 100 + 50 }, // Centralizado horizontalmente
      size: defaultSize,
      style: {},
      spacing: { top: 0, bottom: 20 }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validar tamanho (máximo 150MB para Dropbox ou 5MB para local)
    const maxSize = 150 * 1024 * 1024; // 150MB
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 150MB');
      return;
    }

    try {
      // Tentar upload para Dropbox primeiro, fallback para base64
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'sexyflow-backgrounds');
      if (session?.user?.id) {
        formData.append('userId', session.user.id);
      }

      const uploadResponse = await fetch('/api/upload/dropbox', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success && uploadResult.url) {
        // Usar URL do Dropbox
        setBackground({ ...background, image: uploadResult.url });
        setHasUnsavedChanges(true);
        toast.success('Imagem enviada para Dropbox com sucesso!');
      } else {
        // Fallback: converter para base64 se Dropbox não estiver disponível
        console.log('Dropbox não disponível, usando base64:', uploadResult.error);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setBackground({ ...background, image: result });
          setHasUnsavedChanges(true);
          toast.success('Imagem carregada localmente!');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      // Fallback para base64 em caso de erro
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setBackground({ ...background, image: result });
          setHasUnsavedChanges(true);
          toast.success('Imagem carregada localmente!');
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        toast.error('Erro ao processar a imagem');
      }
    }
  };

  // Funções de Drag & Drop
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    setDraggedElement(elementType);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', elementType);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
    setIsDragging(false);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('text/plain');
    
    if (!elementType) return;

    // Calcular posição no canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    // Adicionar elemento na posição do drop
    addElementAtPosition(elementType, x, y);
    
    setDraggedElement(null);
    setIsDragging(false);
  };

  const addElementAtPosition = (type: string, x: number, y: number) => {
    const defaultSize = getDefaultSize(type);
    // Centralizar o elemento na posição do drop
    const centerX = Math.max(0, x - (defaultSize.width / 2));
    
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: { x: centerX, y: Math.max(0, y - 25) },
      size: defaultSize,
      style: {},
      spacing: { top: 0, bottom: 20 }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setHasUnsavedChanges(true);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} adicionado!`);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'title': return { text: 'Título', fontSize: 30, fontFamily: 'Arial', fontWeight: 'bold', color: '#000000', alignment: 'center' };
      case 'text': return { text: 'Texto', fontSize: 16, fontFamily: 'Arial', fontWeight: 'normal', color: '#000000', alignment: 'center' };
      case 'button': return { text: 'Botão', fontSize: 16, fontFamily: 'Arial', fontWeight: 'normal', color: '#ffffff', backgroundColor: '#3b82f6', alignment: 'center', paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24 };
      case 'image': return { src: '', alt: 'Imagem', width: 300, height: 200 };
      case 'video': return { src: '', width: 300, height: 200 };
      case 'spacer': return { height: 50, backgroundColor: '#f3f4f6', borderColor: '#d1d5db' };
      case 'container': return { backgroundColor: '#ffffff', padding: 20 };
      case 'html': return { html: '<p>HTML personalizado</p>' };
      case 'pixelhot': return { pixelId: '', purchaseValue: 0, currency: 'BRL' };
      default: return {};
    }
  };

  const getDefaultSize = (type: string) => {
    switch (type) {
      case 'title': return { width: 300, height: 50 };
      case 'text': return { width: 300, height: 100 };
      case 'button': return { width: 150, height: 50 };
      case 'image': return { width: 300, height: 200 };
      case 'video': return { width: 300, height: 200 };
      case 'spacer': return { width: 300, height: 50 };
      case 'container': return { width: 300, height: 200 };
      case 'pixelhot': return { width: 220, height: 40 };
      default: return { width: 200, height: 100 };
    }
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        const updated = { ...el, ...updates };
        // Garantir que X sempre fica centralizado após atualização
        const centerX = 400 - (updated.size.width / 2);
        return {
          ...updated,
          position: { ...updated.position, x: centerX }
        };
      }
      return el;
    });
    
    // Reorganizar elementos respeitando espaços após atualização
    const sortedElements = [...updatedElements].sort((a, b) => a.position.y - b.position.y);
    const finalElements = sortedElements.map((el, index) => {
      if (index === 0) {
        // Primeiro elemento: manter Y, centralizar X
        const centerX = 400 - (el.size.width / 2);
        return { ...el, position: { ...el.position, x: centerX } };
      }
      
      const prevEl = sortedElements[index - 1];
      const spacing = prevEl.spacing?.bottom || 20;
      const newY = prevEl.position.y + prevEl.size.height + spacing;
      const centerX = 400 - (el.size.width / 2);
      
      return {
        ...el,
        position: { x: centerX, y: newY }
      };
    });
    
    setElements(finalElements);
    setHasUnsavedChanges(true);
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    setHasUnsavedChanges(true);
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Mudar para aba Design quando clicar em um elemento
    setActiveTab('design');
    setSelectedElement(elementId);
    
    setDraggedElementId(elementId);
    setDragOffset({
      x: e.clientX - canvasRect.left - element.position.x,
      y: e.clientY - canvasRect.top - element.position.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedElementId || !dragOffset || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    // Apenas mover no eixo Y (vertical), X sempre centralizado
    const newY = Math.max(0, e.clientY - canvasRect.top - dragOffset.y);
    
    const draggedEl = elements.find(el => el.id === draggedElementId);
    if (!draggedEl) return;
    
    // X sempre centralizado: (800px canvas - width) / 2
    const centerX = 400 - (draggedEl.size.width / 2);
    
    // Ordenar elementos por Y para reorganização correta
    const sortedElements = [...elements].sort((a, b) => a.position.y - b.position.y);
    const draggedIndex = sortedElements.findIndex(el => el.id === draggedElementId);
    
    // Reorganizar todos os elementos respeitando espaços
    const finalElements = sortedElements.map((el, index) => {
      if (el.id === draggedElementId) {
        // Elemento sendo arrastado: manter X centralizado, atualizar Y
        return {
          ...el,
          position: { x: centerX, y: newY }
        };
      }
      
      // Reorganizar outros elementos
      let newYPos = el.position.y;
      
      if (index < draggedIndex) {
        // Elementos acima do arrastado
        if (newY < el.position.y + el.size.height + (el.spacing?.bottom || 20)) {
          // Elemento arrastado está entrando no espaço deste elemento
          const spacing = el.spacing?.bottom || 20;
          newYPos = newY - el.size.height - spacing;
          newYPos = Math.max(0, newYPos);
        }
      } else {
        // Elementos abaixo do arrastado
        const draggedY = newY;
        const draggedHeight = draggedEl.size.height;
        const draggedSpacing = draggedEl.spacing?.bottom || 20;
        const requiredY = draggedY + draggedHeight + draggedSpacing;
        
        if (el.position.y < requiredY) {
          newYPos = requiredY;
        }
      }
      
      // Verificar colisão com outros elementos (exceto o arrastado)
      const hasCollision = sortedElements.some(otherEl => {
        if (otherEl.id === el.id || otherEl.id === draggedElementId) return false;
        const otherY = otherEl.id === draggedElementId ? newY : otherEl.position.y;
        const otherSpacing = otherEl.spacing?.bottom || 20;
        
        // Verificar se há sobreposição vertical
        return (
          (newYPos < otherY + otherEl.size.height + otherSpacing &&
           newYPos + el.size.height + (el.spacing?.bottom || 20) > otherY) ||
          (otherY < newYPos + el.size.height + (el.spacing?.bottom || 20) &&
           otherY + otherEl.size.height + otherSpacing > newYPos)
        );
      });
      
      if (hasCollision && el.id !== draggedElementId) {
        return el; // Manter posição original se houver colisão
      }
      
      return {
        ...el,
        position: { x: centerX, y: newYPos } // X sempre centralizado para todos
      };
    });
    
    setElements(finalElements);
    setHasUnsavedChanges(true);
  };

  const handleCanvasMouseUp = () => {
    if (draggedElementId) {
      // Ao soltar, reorganizar todos os elementos finalizando posições
      const sortedElements = [...elements].sort((a, b) => a.position.y - b.position.y);
      const finalElements = sortedElements.map((el, index) => {
        const centerX = 400 - (el.size.width / 2);
        
        if (index === 0) {
          return { ...el, position: { x: centerX, y: Math.max(0, el.position.y) } };
        }
        
        const prevEl = finalElements[index - 1] || sortedElements[index - 1];
        const spacing = prevEl.spacing?.bottom || 20;
        const newY = prevEl.position.y + prevEl.size.height + spacing;
        
        return {
          ...el,
          position: { x: centerX, y: Math.max(0, newY) }
        };
      });
      
      setElements(finalElements);
    }
    
    setDraggedElementId(null);
    setDragOffset(null);
  };

  // Calcular altura mínima do canvas baseada nos elementos
  const calculateCanvasHeight = () => {
    if (elements.length === 0) return 600; // Altura mínima padrão
    
    const bottomElement = elements.reduce((prev, current) => {
      const prevBottom = prev.position.y + prev.size.height + (prev.spacing?.bottom || 20);
      const currentBottom = current.position.y + current.size.height + (current.spacing?.bottom || 20);
      return currentBottom > prevBottom ? current : prev;
    });
    
    const bottomPosition = bottomElement.position.y + bottomElement.size.height + (bottomElement.spacing?.bottom || 20);
    // Adicionar padding de 100px no final
    return Math.max(600, bottomPosition + 100);
  };

  const renderElement = (element: Element) => {
    const isSelected = selectedElement === element.id;
    const isBeingDragged = draggedElementId === element.id;
    
    // X sempre centralizado: (800px canvas - width) / 2
    const centerX = 400 - (element.size.width / 2);
    const actualX = isBeingDragged ? centerX : element.position.x;
    
    return (
      <div
        key={element.id}
        className={`absolute ${isSelected ? 'ring-2 ring-pink-500' : ''} ${isBeingDragged ? 'cursor-grabbing opacity-75' : 'cursor-ns-resize'}`}
        style={{
          left: actualX,
          top: element.position.y,
          width: element.size.width,
          height: element.size.height,
          zIndex: isBeingDragged ? 1000 : isSelected ? 100 : 1,
        }}
        onClick={(e) => {
          if (!isBeingDragged && !draggedElementId) {
            setSelectedElement(element.id);
            setActiveTab('design'); // Mudar para aba Design ao clicar
          }
        }}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
      >
        {element.type === 'title' && (
          <h1 
            style={{
              fontSize: element.content?.fontSize || 30,
              fontFamily: element.content?.fontFamily || 'Arial',
              fontWeight: element.content?.fontWeight || 'bold',
              color: element.content?.color || '#000000',
              textAlign: element.content?.alignment || 'center'
            }}
          >
            {element.content?.text || 'Título'}
          </h1>
        )}
        
        {element.type === 'text' && (
          <p 
            style={{
              fontSize: element.content?.fontSize || 16,
              fontFamily: element.content?.fontFamily || 'Arial',
              fontWeight: element.content?.fontWeight || 'normal',
              color: element.content?.color || '#000000',
              textAlign: element.content?.alignment || 'center'
            }}
          >
            {element.content?.text || 'Texto'}
          </p>
        )}
        
        {element.type === 'button' && (
          <button
            style={{
              fontSize: element.content?.fontSize || 16,
              fontFamily: element.content?.fontFamily || 'Arial',
              fontWeight: element.content?.fontWeight || 'normal',
              color: element.content?.color || '#ffffff',
              backgroundColor: element.content?.backgroundColor || '#3b82f6',
              padding: `${element.content?.paddingTop || 12}px ${element.content?.paddingRight || 24}px ${element.content?.paddingBottom || 12}px ${element.content?.paddingLeft || 24}px`,
              borderRadius: element.content?.borderRadius || '8px',
              textAlign: element.content?.alignment || 'center'
            }}
          >
            {element.content?.text || 'Botão'}
          </button>
        )}
        
        {element.type === 'image' && (
          <img
            src={element.content?.src || '/placeholder.jpg'}
            alt={element.content?.alt || 'Imagem'}
            style={{
              width: element.content?.width || '100%',
              height: element.content?.height || 'auto',
              objectFit: 'cover'
            }}
          />
        )}
        
        {element.type === 'video' && (
          <video
            src={element.content?.src}
            controls
            style={{
              width: element.content?.width || '100%',
              height: element.content?.height || 'auto'
            }}
          />
        )}
        
        {element.type === 'spacer' && (
          <div
            style={{
              height: element.content?.height || 50,
              backgroundColor: element.content?.backgroundColor || 'transparent'
            }}
          />
        )}
        
        {element.type === 'html' && (
          <div dangerouslySetInnerHTML={{ __html: element.content?.html || '' }} />
        )}

        {element.type === 'pixelhot' && (
          <div
            className="w-full h-full flex items-center justify-center rounded border border-pink-500/40 bg-pink-500/10"
            title="Elemento oculto na página publicada"
          >
            <span className="text-xs text-pink-300">Pixel Hot (oculto)</span>
          </div>
        )}
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando editor...</p>
        </div>
      </div>
    );
  }

  if (!project || !page) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Página não encontrada</h1>
          <button
            onClick={() => router.push('/projects')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Voltar aos Projetos
          </button>
        </div>
      </div>
    );
  }

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => router.push(`/projects/${params.id}`)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </button>
          </div>
          <h1 className="text-lg font-semibold text-white truncate">
            {page.title}
          </h1>
          <p className="text-sm text-gray-400">
            {project.subdomain}.sexyflow.com/{page.slug}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
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
                  ? 'bg-pink-500/10 text-pink-400 border-b-2 border-pink-500' 
                  : 'text-gray-400 hover:text-pink-400'
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Adicionar Elementos</h3>
                {isDragging && (
                  <span className="text-xs text-pink-400 bg-pink-500 bg-opacity-10 px-2 py-1 rounded">
                    Arrastando...
                  </span>
                )}
              </div>
              
              {!isDragging && (
                <p className="text-xs text-gray-500">
                  💡 Clique ou arraste os elementos para o canvas
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'title', label: 'Título', icon: Type },
                  { type: 'text', label: 'Texto', icon: Type },
                  { type: 'button', label: 'Botão', icon: MousePointer },
                  { type: 'image', label: 'Imagem', icon: Image },
                  { type: 'video', label: 'Vídeo', icon: Video },
                  { type: 'spacer', label: 'Espaço', icon: Square },
                  { type: 'html', label: 'HTML', icon: Code },
                  { type: 'pixelhot', label: 'Pixel Hot', icon: Flame }
                ].map(({ type, label, icon: Icon }) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    onDragEnd={handleDragEnd}
                    onClick={() => addElement(type)}
                    className={`flex flex-col items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-grab active:cursor-grabbing ${
                      draggedElement === type ? 'opacity-50' : ''
                    }`}
                    title={`Clique para adicionar ou arraste para o canvas`}
                  >
                    <Icon className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-300">{label}</span>
                  </div>
                ))}
              </div>

              {elements.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Elementos na Página</h3>
                  <div className="space-y-2">
                    {elements.map((element) => (
                      <div
                        key={element.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedElement === element.id 
                            ? 'bg-pink-500/10 border border-pink-500/20' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span className="text-sm text-gray-300 capitalize">{element.type}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-4">
              {selectedElementData ? (
                <>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Editar {selectedElementData.type}
                  </h3>
              
              {selectedElementData.type === 'title' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Texto</label>
                    <input
                      type="text"
                      value={selectedElementData.content.text || ''}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tamanho da Fonte</label>
                    <input
                      type="number"
                      value={selectedElementData.content.fontSize || 30}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cor</label>
                    <input
                      type="color"
                      value={selectedElementData.content.color || '#000000'}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                    />
                  </div>
                </div>
              )}

              {selectedElementData.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Texto</label>
                    <textarea
                      value={selectedElementData.content.text || ''}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tamanho da Fonte</label>
                    <input
                      type="number"
                      value={selectedElementData.content.fontSize || 16}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cor</label>
                    <input
                      type="color"
                      value={selectedElementData.content.color || '#000000'}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                    />
                  </div>
                </div>
              )}

              {selectedElementData.type === 'button' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Texto</label>
                    <input
                      type="text"
                      value={selectedElementData.content.text || ''}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cor de Fundo</label>
                    <input
                      type="color"
                      value={selectedElementData.content.backgroundColor || '#3b82f6'}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cor do Texto</label>
                    <input
                      type="color"
                      value={selectedElementData.content.color || '#ffffff'}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, color: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                    />
                  </div>
                </div>
              )}

              {selectedElementData.type === 'pixelhot' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Pixel ID</label>
                    <input
                      type="text"
                      value={selectedElementData.content.pixelId || ''}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, pixelId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Valor do Purchase</label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedElementData.content.purchaseValue ?? 0}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, purchaseValue: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Moeda</label>
                    <input
                      type="text"
                      value={selectedElementData.content.currency || 'BRL'}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, currency: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">Será injetado oculto na página publicada com eventos Lead e Purchase.</p>
                </div>
              )}
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Fundo da Página
                  </h3>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tipo de Fundo</label>
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={() => setBackground({ ...background, type: 'color' })}
                        className={`px-3 py-1 text-xs rounded ${
                          background.type === 'color' 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Cor
                      </button>
                      <button
                        onClick={() => setBackground({ ...background, type: 'gradient' })}
                        className={`px-3 py-1 text-xs rounded ${
                          background.type === 'gradient' 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Gradiente
                      </button>
                      <button
                        onClick={() => setBackground({ ...background, type: 'image' })}
                        className={`px-3 py-1 text-xs rounded ${
                          background.type === 'image' 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Imagem
                      </button>
                    </div>

                    {background.type === 'color' && (
                      <input
                        type="color"
                        value={background.value}
                        onChange={(e) => setBackground({ ...background, value: e.target.value })}
                        className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                      />
                    )}

                    {background.type === 'gradient' && (
                      <input
                        type="text"
                        placeholder="ex: to right, #ff0000, #0000ff"
                        value={background.value}
                        onChange={(e) => setBackground({ ...background, value: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    )}

                    {background.type === 'image' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">URL da Imagem</label>
                          <input
                            type="text"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={background.image}
                            onChange={(e) => setBackground({ ...background, image: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Ou faça upload</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                        {background.image && (
                          <div className="relative">
                            <img
                              src={background.image}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded border border-gray-700"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Opacidade</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={background.opacity || 1}
                            onChange={(e) => setBackground({ ...background, opacity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{(background.opacity || 1) * 100}%</span>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Posição</label>
                          <select
                            value={background.position || 'center'}
                            onChange={(e) => setBackground({ ...background, position: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          >
                            <option value="center">Centro</option>
                            <option value="top">Topo</option>
                            <option value="bottom">Inferior</option>
                            <option value="left">Esquerda</option>
                            <option value="right">Direita</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tamanho</label>
                          <select
                            value={background.size || 'cover'}
                            onChange={(e) => setBackground({ ...background, size: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          >
                            <option value="cover">Cobrir (Cover)</option>
                            <option value="contain">Conter (Contain)</option>
                            <option value="100% 100%">Esticar</option>
                            <option value="auto">Automático</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    💡 Selecione um elemento na página para editá-lo, ou configure o fundo da página aqui.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white mb-3">Configurações da Página</h3>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Título da Página</label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => setPage({ ...page, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fundo da Página</label>
                
                {/* Tipo de Background */}
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setBackground({ ...background, type: 'color' })}
                    className={`px-3 py-1 text-xs rounded ${
                      background.type === 'color' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Cor
                  </button>
                  <button
                    onClick={() => setBackground({ ...background, type: 'gradient' })}
                    className={`px-3 py-1 text-xs rounded ${
                      background.type === 'gradient' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Gradiente
                  </button>
                  <button
                    onClick={() => setBackground({ ...background, type: 'image' })}
                    className={`px-3 py-1 text-xs rounded ${
                      background.type === 'image' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Imagem
                  </button>
                </div>

                {/* Configuração por tipo */}
                {background.type === 'color' && (
                  <input
                    type="color"
                    value={background.value}
                    onChange={(e) => setBackground({ ...background, value: e.target.value })}
                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded"
                  />
                )}

                {background.type === 'gradient' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Ex: 45deg, #ff6b6b, #4ecdc4"
                      value={background.value}
                      onChange={(e) => setBackground({ ...background, value: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Formato: ângulo, cor1, cor2
                    </p>
                  </div>
                )}

                {background.type === 'image' && (
                  <div className="space-y-3">
                    {/* Upload de arquivo */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Upload de Imagem</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-pink-500 file:text-white hover:file:bg-pink-600"
                      />
                    </div>

                    {/* URL da imagem */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Ou cole uma URL</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={background.image}
                        onChange={(e) => setBackground({ ...background, image: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>

                    {/* Preview da imagem */}
                    {background.image && (
                      <div className="mt-2">
                        <img
                          src={background.image}
                          alt="Preview"
                          className="w-full h-20 object-cover rounded border border-gray-700"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Opções adicionais para imagem */}
                    {background.image && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Opacidade</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={background.opacity || 1}
                            onChange={(e) => setBackground({ ...background, opacity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 text-center">
                            {Math.round((background.opacity || 1) * 100)}%
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Posição</label>
                          <select
                            value={background.position || 'center'}
                            onChange={(e) => setBackground({ ...background, position: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          >
                            <option value="center">Centralizado</option>
                            <option value="top">Superior</option>
                            <option value="bottom">Inferior</option>
                            <option value="left">Esquerda</option>
                            <option value="right">Direita</option>
                            <option value="top left">Superior Esquerda</option>
                            <option value="top right">Superior Direita</option>
                            <option value="bottom left">Inferior Esquerda</option>
                            <option value="bottom right">Inferior Direita</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tamanho</label>
                          <select
                            value={background.size || 'cover'}
                            onChange={(e) => setBackground({ ...background, size: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          >
                            <option value="cover">Cobrir (Cover)</option>
                            <option value="contain">Conter (Contain)</option>
                            <option value="100% 100%">Esticar</option>
                            <option value="auto">Automático</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-white">Editor de Página</h2>
            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-400">• Não salvo</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={savePage}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
            
            {page.isPublished ? (
              <button
                onClick={unpublishPage}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                <span>Despublicar</span>
              </button>
            ) : (
              <button
                onClick={publishPage}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                <span>Publicar</span>
              </button>
            )}
            
            <button
              onClick={() => window.open(`https://${project.subdomain}.sexyflow.onrender.com/${page.slug}`, '_blank')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div 
              ref={canvasRef}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className={`bg-white shadow-lg rounded-lg relative ${
                isDragging ? 'ring-2 ring-pink-500 ring-opacity-50' : ''
              }`}
              style={{
                minHeight: `${calculateCanvasHeight()}px`,
                background: background.type === 'color' 
                  ? background.value 
                  : background.type === 'gradient'
                  ? `linear-gradient(${background.value})`
                  : background.type === 'image'
                  ? `url(${background.image})`
                  : '#ffffff',
                backgroundSize: background.type === 'image' ? (background.size || 'cover') : 'auto',
                backgroundPosition: background.type === 'image' ? (background.position || 'center') : 'initial',
                backgroundRepeat: background.type === 'image' ? 'no-repeat' : 'initial',
                opacity: background.type === 'image' ? (background.opacity || 1) : 1
              }}
            >
              {elements.map(renderElement)}
              
              {elements.length === 0 && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Type className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Página vazia</p>
                    <p className="text-sm">Adicione elementos usando a barra lateral</p>
                  </div>
                </div>
              )}

              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-pink-500">
                    <div className="bg-pink-500 bg-opacity-10 border-2 border-dashed border-pink-500 rounded-lg p-8">
                      <Type className="h-12 w-12 mx-auto mb-4 text-pink-500" />
                      <p className="text-lg font-medium">Solte aqui para adicionar</p>
                      <p className="text-sm">Arraste o elemento para esta posição</p>
                    </div>
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

