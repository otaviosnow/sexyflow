'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Monitor, Tablet, Smartphone, Eye, Save, Undo, Redo, 
  Move, Copy, Trash2, Upload, Palette, Settings,
  Type, Image, Video, Code, Square, Minus, Star,
  ChevronDown, ChevronRight, Search, X, Plus,
  Layers, Zap, ChevronUp, Link
} from 'lucide-react';

// Tipos
interface Element {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: any;
  spacing: { top: number; bottom: number }; // Espaçamento superior e inferior do elemento
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
  const templateId = params.id;
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeCategory, setActiveCategory] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  const [background, setBackground] = useState({ type: 'color', value: '#ffffff', image: '', opacity: 1 });
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    content: {}
  });
  const [draggedSidebarElementType, setDraggedSidebarElementType] = useState<string | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Novos estados para funcionalidades avançadas
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [selectedAnimation, setSelectedAnimation] = useState<string>('');
  
  // Estados para histórico (undo/redo)
  const [history, setHistory] = useState<Element[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para controles de spacing
  const [linkedPadding, setLinkedPadding] = useState(true);
  const [linkedMargin, setLinkedMargin] = useState(true);
  const [activeSpacingView, setActiveSpacingView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Rastrear mudanças não salvas
  useEffect(() => {
    if (elements.length > 0 || background.type !== 'color' || background.value !== '#ffffff' || background.image !== '') {
      setHasUnsavedChanges(true);
    }
  }, [elements, background]);

  // Função para salvar e marcar como salvo
  const saveAndMarkAsSaved = async () => {
    try {
      setSaving(true);
      
      console.log('Salvando template:', { templateId, elements, background });
      
      // Verificar se estamos em modo de desenvolvimento local
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isLocalDev) {
        // Salvar no localStorage para persistência local
        const templateData = {
          id: templateId,
          elements,
          background,
          lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem(`template_${templateId}`, JSON.stringify(templateData));
        console.log('Template salvo no localStorage:', templateData);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHasUnsavedChanges(false);
        setLastSaved(new Date().toISOString());
        toast.success('Template salvo com sucesso! (Modo local)', {
          id: 'saving-template'
        });
        return true;
      }
      
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            elements,
            background
          }
        })
      });

      console.log('Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Template salvo:', result);
        setHasUnsavedChanges(false);
        toast.success('Template salvo com sucesso!', {
          id: 'saving-template'
        });
        return true;
      } else {
        const errorData = await response.json();
        console.error('Erro na API:', errorData);
        throw new Error(errorData.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error(`Erro ao salvar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, {
        id: 'saving-template'
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Função para lidar com navegação de volta
  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      router.push('/admin');
    }
  };

  // Função para confirmar saída
  const confirmExit = () => {
    setShowExitConfirm(false);
    setHasUnsavedChanges(false);
    router.push('/admin');
  };

  // Função para cancelar saída
  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  // Bibliotecas de animações
  const ANIMATIONS = [
    { id: 'fadeIn', name: 'Fade In', duration: 500 },
    { id: 'slideInLeft', name: 'Slide In Left', duration: 600 },
    { id: 'slideInRight', name: 'Slide In Right', duration: 600 },
    { id: 'slideInUp', name: 'Slide In Up', duration: 600 },
    { id: 'slideInDown', name: 'Slide In Down', duration: 600 },
    { id: 'bounceIn', name: 'Bounce In', duration: 800 },
    { id: 'zoomIn', name: 'Zoom In', duration: 500 },
    { id: 'rotateIn', name: 'Rotate In', duration: 700 },
    { id: 'flipInX', name: 'Flip In X', duration: 600 },
    { id: 'flipInY', name: 'Flip In Y', duration: 600 }
  ];

  // Funções básicas
  const getCanvasSize = () => {
    const baseSize = (() => {
      switch (activeView) {
        case 'desktop': return { width: 1200, height: 800 };
        case 'tablet': return { width: 768, height: 600 };
        case 'mobile': return { width: 375, height: 667 };
        default: return { width: 1200, height: 800 };
      }
    })();

    // Calcular altura dinâmica baseada nos elementos
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      const calculatedHeight = lastElement.position.y + lastElement.size.height + (lastElement.spacing?.bottom || 20) + 50;
      return {
        ...baseSize,
        height: Math.max(baseSize.height, calculatedHeight)
      };
    }

    return baseSize;
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
        return { html: '<div style="color: #1f2937; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">HTML personalizado</div>' };
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
      case 'image': return { width: 400, height: 300 }; // Tamanho médio padrão
      case 'video': return { width: 400, height: 300 }; // Tamanho médio padrão
      case 'container': return { width: Math.min(500, canvasWidth - 40), height: 200 };
      case 'spacer': return { width: Math.min(100, canvasWidth - 40), height: 50 };
      case 'html': return { width: Math.min(300, canvasWidth - 40), height: 100 };
      default: return { width: Math.min(200, canvasWidth - 40), height: 50 };
    }
  };

  const getCenteredPosition = (elementWidth: number) => {
    const { width: canvasWidth } = getCanvasSize();
    const centeredX = (canvasWidth - elementWidth) / 2;
    return centeredX;
  };

  const addElement = (type: string, x?: number, y?: number) => {
    const defaultSize = getDefaultSize(type);
    const centeredX = getCenteredPosition(defaultSize.width); // Sempre centralizado
    
    // Calcular posição Y considerando espaçadores
    let elementY = 50; // Primeiro elemento sempre no topo
    if (elements.length > 0) {
      // Encontrar a posição correta considerando todos os elementos anteriores
      let maxBottom = 0;
      for (const element of elements) {
        let elementBottom;
        
        // Se for um espaçador, usar sua altura real
        if (element.type === 'spacer') {
          elementBottom = element.position.y + (element.content.height || 50);
        } else {
          elementBottom = element.position.y + element.size.height;
        }
        
        maxBottom = Math.max(maxBottom, elementBottom);
      }
      
      // Adicionar espaçamento padrão
      elementY = maxBottom + 20;
    }

    const newElement: Element = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      content: {
        ...getDefaultContent(type),
        ...(type === 'image' || type === 'video' ? { size: 'medium' } : {})
      },
      position: { x: centeredX, y: elementY },
      size: defaultSize,
      style: { alignment: 'center' }, // Adicionar alinhamento padrão
      spacing: { top: 0, bottom: 20 }, // Espaçamento padrão de 20px
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

  // Function to start dragging an element from the sidebar
  const handleSidebarDragStart = (e: React.DragEvent, type: string) => {
    setDraggedSidebarElementType(type);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Function to handle dragging over the canvas
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Function to handle dropping on the canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (type && draggedSidebarElementType === type) {
      // Ignorar a posição do mouse e sempre usar posição sequencial
      addElement(type);
      setDraggedSidebarElementType(null);
    }
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(element => element.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Elemento removido!');
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    console.log('updateElement chamado:', { elementId, updates });
    
    setElements(prevElements => {
      const newElements = prevElements.map(element => {
        if (element.id === elementId) {
          console.log('Elemento encontrado, atualizando:', element);
          const updatedElement = { ...element, ...updates };
          console.log('Elemento após merge:', updatedElement);
          return updatedElement;
        }
        return element;
      });
      
      console.log('Novos elementos:', newElements);
      return newElements;
    });
  };

  // Função para aplicar alinhamento
  const applyAlignment = (elementId: string, alignment: 'left' | 'center' | 'right') => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return;

    const { width: canvasWidth } = getCanvasSize();
    let newX = element.position.x;

    switch (alignment) {
      case 'left':
        newX = 20; // Margem da esquerda
        break;
      case 'center':
        newX = (canvasWidth - element.size.width) / 2;
        break;
      case 'right':
        newX = canvasWidth - element.size.width - 20; // Margem da direita
        break;
    }

    updateElement(elementId, { 
      position: { ...element.position, x: newX },
      style: { ...element.style, alignment }
    });
  };

  // Função para recalcular posições dos elementos após mudança de espaçamento
  const recalculatePositions = () => {
    const updatedElements = [...elements];
    let currentY = 50; // Primeiro elemento sempre no topo

    for (let i = 0; i < updatedElements.length; i++) {
      updatedElements[i].position.y = currentY;
      currentY += updatedElements[i].size.height + (updatedElements[i].spacing?.bottom || 20);
    }

    setElements(updatedElements);
  };

  // Função para recalcular posições após mudança de altura do espaçador
  const recalculatePositionsAfterSpacer = (spacerId: string, heightDifference: number) => {
    const spacerIndex = elements.findIndex(e => e.id === spacerId);
    if (spacerIndex === -1) return;

    const updatedElements = [...elements];
    
    // Ajustar posições dos elementos que vêm depois do espaçador
    for (let i = spacerIndex + 1; i < updatedElements.length; i++) {
      updatedElements[i] = {
        ...updatedElements[i],
        position: {
          ...updatedElements[i].position,
          y: updatedElements[i].position.y + heightDifference
        }
      };
    }

    setElements(updatedElements);
  };

  // Função para snap to grid
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return { x: snappedX, y: snappedY };
  };

  // Função para calcular posição responsiva
  const getResponsivePosition = (element: Element) => {
    const scaleFactor = activeView === 'tablet' ? 0.8 : activeView === 'mobile' ? 0.6 : 1;
    const scaledWidth = element.size.width * scaleFactor;
    const canvasWidth = getCanvasSize().width;
    
    return {
      left: (canvasWidth - scaledWidth) / 2, // Centralizar horizontalmente
      top: element.position.y,
      width: element.size.width * scaleFactor,
      height: element.size.height * scaleFactor
    };
  };

  // Função para aplicar animação
  const applyAnimation = (elementId: string, animation: string) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return;

    updateElement(elementId, {
      content: { ...element.content, animation }
    });
  };

  // Função para abrir preview em nova guia
  const [showPreview, setShowPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setPreviewViewport('desktop');
    }
  };

  // Função para renderizar grid
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const { width, height } = getCanvasSize();
    const lines = [];
    
    // Linhas verticais
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="rgba(156, 163, 175, 0.4)"
          strokeWidth="0.5"
        />
      );
    }
    
    // Linhas horizontais
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="rgba(156, 163, 175, 0.4)"
          strokeWidth="0.5"
        />
      );
    }
    
    return (
      <svg 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 0,
          opacity: 0.8,
          width: '100%',
          height: '100%'
        }}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {lines}
      </svg>
    );
  };

  // Função para obter elementos ordenados por posição
  const getSortedElements = () => {
    return [...elements].sort((a, b) => a.position.y - b.position.y);
  };

  // Função para obter nome de exibição do elemento
  const getElementDisplayName = (element: Element) => {
    const typeNames: { [key: string]: string } = {
      heading: 'Título',
      text: 'Texto',
      button: 'Botão',
      image: 'Imagem',
      video: 'Vídeo',
      container: 'Container',
      spacer: 'Espaçador',
      html: 'HTML',
      divider: 'Divisor',
      icon: 'Ícone'
    };
    return typeNames[element.type] || element.type;
  };

  // Função para salvar no histórico
  const saveToHistory = (newElements: Element[]) => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(newElements))]);
    setHistoryIndex(prev => prev + 1);
  };

  // Função para obter estilos de animação
  const getAnimationStyles = (animationId: string) => {
    if (!animationId) return {};
    
    const animations: { [key: string]: any } = {
      fadeIn: {
        animation: 'fadeIn 0.5s ease-in-out',
        animationFillMode: 'both'
      },
      slideInLeft: {
        animation: 'slideInLeft 0.6s ease-out',
        animationFillMode: 'both'
      },
      slideInRight: {
        animation: 'slideInRight 0.6s ease-out',
        animationFillMode: 'both'
      },
      slideInUp: {
        animation: 'slideInUp 0.6s ease-out',
        animationFillMode: 'both'
      },
      slideInDown: {
        animation: 'slideInDown 0.6s ease-out',
        animationFillMode: 'both'
      },
      zoomIn: {
        animation: 'zoomIn 0.5s ease-out',
        animationFillMode: 'both'
      },
      bounceIn: {
        animation: 'bounceIn 0.8s ease-out',
        animationFillMode: 'both'
      },
      rotateIn: {
        animation: 'rotateIn 0.6s ease-out',
        animationFillMode: 'both'
      },
      flipInX: {
        animation: 'flipInX 0.6s ease-out',
        animationFillMode: 'both'
      },
      pulse: {
        animation: 'pulse 2s infinite',
        animationFillMode: 'both'
      }
    };
    
    return animations[animationId] || {};
  };

  // Função para renderizar controles de tamanho responsivos
  const renderSizeControls = (elementId: string, element: Element) => {
    const getSizeValue = (viewport: 'desktop' | 'tablet' | 'mobile', dimension: 'width' | 'height') => {
      console.log('getSizeValue chamado:', { viewport, dimension, element });
      
      const viewportData = element.responsive?.[viewport];
      console.log('viewportData:', viewportData);
      
      if (dimension === 'width') {
        const value = viewportData?.content?.customWidth || element.content.customWidth || element.size.width || 400;
        console.log('Largura encontrada:', value);
        return value;
      } else {
        const value = viewportData?.content?.customHeight || element.content.customHeight || element.size.height || 300;
        console.log('Altura encontrada:', value);
        return value;
      }
    };

    const updateSizeValue = (viewport: 'desktop' | 'tablet' | 'mobile', dimension: 'width' | 'height', value: number) => {
      console.log('Atualizando tamanho:', { viewport, dimension, value, elementId });
      
      const newElement = { ...element };
      if (!newElement.responsive) {
        newElement.responsive = { 
          desktop: { position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, content: {} }, 
          tablet: { position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, content: {} }, 
          mobile: { position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, content: {} } 
        };
      }
      if (!newElement.responsive[viewport]) {
        newElement.responsive[viewport] = { position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, content: {} };
      }
      if (!newElement.responsive[viewport].content) {
        newElement.responsive[viewport].content = {};
      }
      
      if (dimension === 'width') {
        newElement.responsive[viewport].content.customWidth = value;
        // Também atualizar o tamanho principal do elemento
        newElement.size.width = value;
      } else {
        newElement.responsive[viewport].content.customHeight = value;
        // Também atualizar o tamanho principal do elemento
        newElement.size.height = value;
      }
      
      console.log('Elemento atualizado:', newElement);
      updateElement(elementId, newElement);
    };

    return (
      <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-600/50">
        <h4 className="text-sm font-medium text-white mb-3">Tamanho Responsivo</h4>
        
        {/* Seletor de Viewport */}
        <div className="mb-4">
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as const).map((viewport) => (
              <button
                key={viewport}
                onClick={() => setActiveSpacingView(viewport)}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all duration-200 ${
                  activeSpacingView === viewport
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {viewport === 'desktop' ? 'Desktop' : viewport === 'tablet' ? 'Tablet' : 'Mobile'}
              </button>
            ))}
          </div>
        </div>

        {/* Controles de Tamanho */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Largura ({activeSpacingView})
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="100"
                max="1200"
                value={getSizeValue(activeSpacingView, 'width')}
                onChange={(e) => updateSizeValue(activeSpacingView, 'width', parseInt(e.target.value) || 400)}
                className="flex-1 px-3 py-2 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => updateSizeValue(activeSpacingView, 'width', Math.min(1200, getSizeValue(activeSpacingView, 'width') + 10))}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateSizeValue(activeSpacingView, 'width', Math.max(100, getSizeValue(activeSpacingView, 'width') - 10))}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Altura ({activeSpacingView})
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="100"
                max="800"
                value={getSizeValue(activeSpacingView, 'height')}
                onChange={(e) => updateSizeValue(activeSpacingView, 'height', parseInt(e.target.value) || 300)}
                className="flex-1 px-3 py-2 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => updateSizeValue(activeSpacingView, 'height', Math.min(800, getSizeValue(activeSpacingView, 'height') + 10))}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateSizeValue(activeSpacingView, 'height', Math.max(100, getSizeValue(activeSpacingView, 'height') - 10))}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Função para renderizar controles de spacing (padding e margin) com responsividade
  const renderSpacingControls = (elementId: string, element: Element) => {

    const getSpacingValue = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left') => {
      const responsive = element.responsive?.[activeSpacingView];
      if (responsive?.content?.[`${type}${side.charAt(0).toUpperCase() + side.slice(1)}`] !== undefined) {
        return responsive.content[`${type}${side.charAt(0).toUpperCase() + side.slice(1)}`] || 0;
      }
      return element.content[`${type}${side.charAt(0).toUpperCase() + side.slice(1)}`] || 0;
    };

    const updateSpacingValue = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
      const property = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`;
      
      if (activeSpacingView === 'desktop') {
        updateElement(elementId, {
          content: { ...element.content, [property]: value }
        });
      } else {
        const responsive = element.responsive || { desktop: {}, tablet: {}, mobile: {} };
        updateElement(elementId, {
          responsive: {
            ...responsive,
            [activeSpacingView]: {
              ...responsive[activeSpacingView],
              content: {
                ...responsive[activeSpacingView]?.content,
                [property]: value
              }
            }
          }
        });
      }
    };

    const updateAllSpacing = (type: 'padding' | 'margin', value: number) => {
      const sides = ['top', 'right', 'bottom', 'left'] as const;
      sides.forEach(side => {
        updateSpacingValue(type, side, value);
      });
    };

    const renderSpacingInput = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', label: string) => {
      const value = getSpacingValue(type, side);
      const isLinked = type === 'padding' ? linkedPadding : linkedMargin;
      
      return (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => updateSpacingValue(type, side, Math.max(0, value - 1))}
            className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all duration-200"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="flex-1 flex items-center space-x-1">
            <input
              type="number"
              min="0"
              max="200"
              value={value}
              onChange={(e) => {
                const newValue = parseInt(e.target.value) || 0;
                if (isLinked) {
                  updateAllSpacing(type, newValue);
                } else {
                  updateSpacingValue(type, side, newValue);
                }
              }}
              className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          <button
            onClick={() => updateSpacingValue(type, side, Math.min(200, value + 1))}
            className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all duration-200"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      );
    };

    return (
      <div className="border-t border-gray-600/50 pt-4">
        <h4 className="text-sm font-medium text-white mb-3">Espaçamento</h4>
        
        {/* Viewport Selector */}
        <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4 border border-gray-600">
          {(['desktop', 'tablet', 'mobile'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveSpacingView(view)}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                activeSpacingView === view
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {view === 'desktop' && <Monitor className="w-3 h-3 mx-auto" />}
              {view === 'tablet' && <Tablet className="w-3 h-3 mx-auto" />}
              {view === 'mobile' && <Smartphone className="w-3 h-3 mx-auto" />}
            </button>
          ))}
        </div>

        {/* Margin Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-gray-300">Margem</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLinkedMargin(!linkedMargin)}
                className={`p-1 rounded transition-all duration-200 ${
                  linkedMargin 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
                title={linkedMargin ? 'Valores vinculados' : 'Valores independentes'}
              >
                <Link className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Topo</label>
              {renderSpacingInput('margin', 'top', 'Topo')}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Direita</label>
              {renderSpacingInput('margin', 'right', 'Direita')}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Baixo</label>
              {renderSpacingInput('margin', 'bottom', 'Baixo')}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Esquerda</label>
              {renderSpacingInput('margin', 'left', 'Esquerda')}
            </div>
          </div>
        </div>

        {/* Padding Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-gray-300">Padding</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLinkedPadding(!linkedPadding)}
                className={`p-1 rounded transition-all duration-200 ${
                  linkedPadding 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
                title={linkedPadding ? 'Valores vinculados' : 'Valores independentes'}
              >
                <Link className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Topo</label>
              {renderSpacingInput('padding', 'top', 'Topo')}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Direita</label>
              {renderSpacingInput('padding', 'right', 'Direita')}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Baixo</label>
              {renderSpacingInput('padding', 'bottom', 'Baixo')}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Esquerda</label>
              {renderSpacingInput('padding', 'left', 'Esquerda')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Funções para drag & drop de reordenação
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setDraggedElementId(elementId);
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragOffset(0);
  };

  const handleElementMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedElementId) return;
    
    const deltaY = e.clientY - dragStartY;
    setDragOffset(deltaY);
  };

  const handleElementMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !draggedElementId) return;
    
    const deltaY = e.clientY - dragStartY;
    const elementHeight = 100; // Altura aproximada de um elemento
    
    if (Math.abs(deltaY) > elementHeight / 2) {
      const currentIndex = elements.findIndex(el => el.id === draggedElementId);
      const direction = deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(elements.length - 1, currentIndex + direction));
      
      if (newIndex !== currentIndex) {
        const draggedElement = elements.find(el => el.id === draggedElementId);
        const targetElement = elements[newIndex];
        
        // Se o elemento está sendo movido para baixo de um espaçador
        if (draggedElement && targetElement && targetElement.type === 'spacer') {
          const spacerBottom = targetElement.position.y + (targetElement.content.height || 50);
          const newPosition = {
            ...draggedElement.position,
            y: spacerBottom + 20
          };
          
          updateElement(draggedElementId, { position: newPosition });
        } else {
          // Apenas reordenar sem recalcular posições - permitir movimento livre
          reorderElements(draggedElementId, newIndex);
        }
      }
    }
    
    resetDrag();
  };

  const resetDrag = () => {
    setDraggedElementId(null);
    setIsDragging(false);
    setDragStartY(0);
    setDragOffset(0);
  };

  const reorderElements = (elementId: string, newIndex: number) => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1 || newIndex === currentIndex) return;
    
    const newElements = [...elements];
    const [movedElement] = newElements.splice(currentIndex, 1);
    newElements.splice(newIndex, 0, movedElement);
    
    setElements(newElements);
    
    // Recalcular posições após reordenação
    setTimeout(() => {
      const updatedElements = [...newElements];
      let currentY = 50;
      
      for (let i = 0; i < updatedElements.length; i++) {
        updatedElements[i].position.y = currentY;
        currentY += updatedElements[i].size.height + (updatedElements[i].spacing?.bottom || 20);
      }
      
      setElements(updatedElements);
    }, 100);
  };

  const renderElementProperties = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return null;

    const updateContent = (content: any) => {
      updateElement(elementId, { content });
    };

    const updatePosition = (position: any) => {
      updateElement(elementId, { position });
    };

    const updateSize = (size: any) => {
      updateElement(elementId, { size });
    };

    switch (element.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Texto</label>
              <input
                type="text"
                value={element.content.text || ''}
                onChange={(e) => updateContent({ ...element.content, text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nível</label>
              <select
                value={element.content.level || 'h1'}
                onChange={(e) => updateContent({ ...element.content, level: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tamanho da Fonte</label>
              <input
                type="range"
                min="12"
                max="72"
                value={element.content.fontSize || 48}
                onChange={(e) => updateContent({ ...element.content, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm text-slate-500">{element.content.fontSize || 48}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
              <input
                type="color"
                value={element.content.color || '#1f2937'}
                onChange={(e) => updateContent({ ...element.content, color: e.target.value })}
                className="w-full h-10 border border-slate-300 rounded-lg"
              />
            </div>
            
            
            {renderSpacingControls(elementId, element)}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Texto</label>
              <textarea
                value={element.content.text || ''}
                onChange={(e) => updateContent({ ...element.content, text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tamanho da Fonte</label>
              <input
                type="range"
                min="10"
                max="24"
                value={element.content.fontSize || 16}
                onChange={(e) => updateContent({ ...element.content, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm text-slate-500">{element.content.fontSize || 16}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
              <input
                type="color"
                value={element.content.color || '#374151'}
                onChange={(e) => updateContent({ ...element.content, color: e.target.value })}
                className="w-full h-10 border border-slate-300 rounded-lg"
              />
            </div>
            
            
            {renderSpacingControls(elementId, element)}
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Texto</label>
              <input
                type="text"
                value={element.content.text || ''}
                onChange={(e) => updateContent({ ...element.content, text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cor de Fundo</label>
              <input
                type="color"
                value={element.content.backgroundColor || '#3b82f6'}
                onChange={(e) => updateContent({ ...element.content, backgroundColor: e.target.value })}
                className="w-full h-10 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Texto</label>
              <input
                type="color"
                value={element.content.color || '#ffffff'}
                onChange={(e) => updateContent({ ...element.content, color: e.target.value })}
                className="w-full h-10 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Link</label>
              <input
                type="url"
                value={element.content.link || ''}
                onChange={(e) => updateContent({ ...element.content, link: e.target.value })}
                placeholder="https://exemplo.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Controles de Padding Responsivo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Padding</label>
              
              {/* Desktop */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Desktop</label>
                <input
                  type="text"
                  value={element.content.padding || '12px 24px'}
                  onChange={(e) => updateContent({ ...element.content, padding: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="12px 24px"
                />
              </div>
              
              {/* Tablet */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Tablet</label>
                <input
                  type="text"
                  value={element.responsive?.tablet?.content?.padding || element.content.padding || '12px 24px'}
                  onChange={(e) => {
                    const newPadding = e.target.value;
                    updateElement(elementId, {
                      responsive: {
                        ...element.responsive,
                        tablet: {
                          ...element.responsive?.tablet,
                          content: {
                            ...element.responsive?.tablet?.content,
                            padding: newPadding
                          }
                        }
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Herda do Desktop"
                />
              </div>
              
              {/* Mobile */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Mobile</label>
                <input
                  type="text"
                  value={element.responsive?.mobile?.content?.padding || element.content.padding || '12px 24px'}
                  onChange={(e) => {
                    const newPadding = e.target.value;
                    updateElement(elementId, {
                      responsive: {
                        ...element.responsive,
                        mobile: {
                          ...element.responsive?.mobile,
                          content: {
                            ...element.responsive?.mobile?.content,
                            padding: newPadding
                          }
                        }
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Herda do Desktop"
                />
              </div>
            </div>
            
            
            {renderSpacingControls(elementId, element)}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL da Imagem</label>
              <input
                type="url"
                value={element.content.src || ''}
                onChange={(e) => updateContent({ ...element.content, src: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload de Imagem</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    updateContent({ ...element.content, src: url, uploadedFile: file.name });
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {element.content.uploadedFile && (
                <p className="text-xs text-green-600 mt-1">✓ {element.content.uploadedFile}</p>
              )}
            </div>
            
            {renderSizeControls(elementId, element)}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Texto Alternativo</label>
              <input
                type="text"
                value={element.content.alt || ''}
                onChange={(e) => updateContent({ ...element.content, alt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Link</label>
              <input
                type="url"
                value={element.content.link || ''}
                onChange={(e) => updateContent({ ...element.content, link: e.target.value })}
                placeholder="https://exemplo.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL do Vídeo</label>
              <input
                type="url"
                value={element.content.src || ''}
                onChange={(e) => updateContent({ ...element.content, src: e.target.value })}
                placeholder="https://exemplo.com/video.mp4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload de Vídeo</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    updateContent({ ...element.content, src: url, uploadedFile: file.name });
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {element.content.uploadedFile && (
                <p className="text-xs text-green-600 mt-1">✓ {element.content.uploadedFile}</p>
              )}
            </div>
            
            {renderSizeControls(elementId, element)}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoplay"
                checked={element.content.autoplay || false}
                onChange={(e) => updateContent({ ...element.content, autoplay: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="autoplay" className="text-sm font-medium text-slate-700">Autoplay</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="controls"
                checked={element.content.controls !== false}
                onChange={(e) => updateContent({ ...element.content, controls: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="controls" className="text-sm font-medium text-slate-700">Controles</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="loop"
                checked={element.content.loop || false}
                onChange={(e) => updateContent({ ...element.content, loop: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="loop" className="text-sm font-medium text-slate-700">Loop</label>
            </div>
            
          </div>
        );

      case 'container':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-1">📦 Container</h4>
              <p className="text-xs text-green-600">Agrupa elementos em uma área delimitada para melhor organização</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Cor de Fundo</label>
              <input
                type="color"
                value={element.content.backgroundColor || '#ffffff'}
                onChange={(e) => updateContent({ ...element.content, backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-600 rounded-lg bg-gray-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Padding Interno</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={element.content.padding || 20}
                  onChange={(e) => updateContent({ ...element.content, padding: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-400 w-12 text-right">{element.content.padding || 20}px</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Borda</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={element.content.border || false}
                  onChange={(e) => updateContent({ ...element.content, border: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Mostrar borda</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Padding</label>
              <input
                type="text"
                value={element.content.padding || '20px'}
                onChange={(e) => updateContent({ ...element.content, padding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
              />
            </div>
            
            {/* Controles de Espaçamento com Setas */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Espaçamento Superior</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const currentSpacing = element.spacing?.top || 0;
                    updateElement(elementId, { 
                      spacing: { ...element.spacing, top: Math.max(0, currentSpacing - 5) }
                    });
                    setTimeout(() => recalculatePositions(), 100);
                  }}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all duration-200"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={element.spacing?.top || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updateElement(elementId, { 
                      spacing: { ...element.spacing, top: value }
                    });
                    setTimeout(() => recalculatePositions(), 100);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const currentSpacing = element.spacing?.top || 0;
                    updateElement(elementId, { 
                      spacing: { ...element.spacing, top: Math.min(200, currentSpacing + 5) }
                    });
                    setTimeout(() => recalculatePositions(), 100);
                  }}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all duration-200"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400">px</span>
              </div>
            </div>
            
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">📏 Espaçador</h4>
              <p className="text-xs text-blue-600">Cria espaços vazios entre elementos para melhor organização visual</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Altura do Espaço</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={element.content.height || 50}
                  onChange={(e) => {
                    const newHeight = parseInt(e.target.value) || 50;
                    const oldHeight = element.content.height || 50;
                    const heightDifference = newHeight - oldHeight;
                    
                    console.log('Mudando altura do espaçador para:', newHeight, 'diferença:', heightDifference);
                    
                    // Atualizar altura do espaçador
                    updateContent({ ...element.content, height: newHeight });
                    
                    // Se houve mudança, reorganizar elementos abaixo
                    if (heightDifference !== 0) {
                      console.log('Altura mudou, reorganizando elementos...');
                      
                      // Usar setTimeout para garantir que a atualização do espaçador seja processada primeiro
                      setTimeout(() => {
                        const spacerIndex = elements.findIndex(el => el.id === elementId);
                        console.log('Índice do espaçador:', spacerIndex);
                        
                        if (spacerIndex !== -1) {
                          setElements(prevElements => {
                            console.log('Elementos antes da reorganização:', prevElements.map(el => ({ id: el.id, type: el.type, y: el.position.y })));
                            
                            const updatedElements = [...prevElements];
                            const spacerElement = updatedElements[spacerIndex];
                            
                            console.log(`Espaçador: y=${spacerElement.position.y}, height=${spacerElement.content.height}, diferença=${heightDifference}`);
                            
                            // Recalcular posições de todos os elementos baseado na nova altura do espaçador
                            let currentY = 50; // Primeiro elemento sempre no topo
                            
                            for (let i = 0; i < updatedElements.length; i++) {
                              if (i === spacerIndex) {
                                // Manter o espaçador na posição atual
                                console.log(`Espaçador ${i}: mantido em y=${spacerElement.position.y}`);
                                continue;
                              }
                              
                              const element = updatedElements[i];
                              const elementTop = element.position.y;
                              
                              // Se o elemento está abaixo do espaçador, recalcular sua posição
                              if (elementTop > spacerElement.position.y) {
                                // Calcular nova posição baseada na altura atual do espaçador
                                const spacerBottom = spacerElement.position.y + (spacerElement.content.height || 50);
                                const newY = spacerBottom + 20; // 20px de espaçamento
                                
                                updatedElements[i] = {
                                  ...element,
                                  position: {
                                    ...element.position,
                                    y: newY
                                  }
                                };
                                
                                console.log(`Elemento ${i} (${element.type}): ${elementTop}px -> ${newY}px (recalculado baseado no espaçador)`);
                              } else {
                                console.log(`Elemento ${i} (${element.type}): mantido em ${element.position.y}px (estava acima do espaçador)`);
                              }
                            }
                            
                            console.log('Elementos após reorganização:', updatedElements.map(el => ({ id: el.id, type: el.type, y: el.position.y })));
                            return updatedElements;
                          });
                        } else {
                          console.log('Espaçador não encontrado na lista!');
                        }
                      }, 100);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
          </div>
        );

      case 'html':
        return (
          <div className="space-y-4">
            {/* Controles de Posicionamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => applyAlignment(elementId, 'left')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'left' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'center')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'center' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Centro
                </button>
                <button
                  onClick={() => applyAlignment(elementId, 'right')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    element.style?.alignment === 'right' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Código HTML</label>
              <textarea
                value={element.content.html || ''}
                onChange={(e) => updateContent({ ...element.content, html: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={6}
              />
            </div>
            
          </div>
        );

      default:
        return (
          <div className="text-sm text-slate-500">
            Propriedades não disponíveis para este elemento.
          </div>
        );
    }
  };

  const renderElement = (element: Element) => {
    // Aplicar responsividade baseada no viewport ativo
    const getResponsiveElement = (element: Element) => {
      const scaleFactor = (() => {
        switch (activeView) {
          case 'tablet': return 0.8;
          case 'mobile': return 0.6;
          default: return 1;
        }
      })();
      
      return {
        ...element,
        content: {
          ...element.content,
          fontSize: element.content.fontSize ? element.content.fontSize * scaleFactor : element.content.fontSize
        }
      };
    };
    
    const viewportElement = getResponsiveElement(element);
    
    // Função para gerar estilo de padding
    const getPaddingStyle = (content: any) => {
      const paddingTop = content.paddingTop || 0;
      const paddingBottom = content.paddingBottom || 0;
      const paddingLeft = content.paddingLeft || 0;
      const paddingRight = content.paddingRight || 0;
      
      return {
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`
      };
    };
    
    switch (viewportElement.type) {
      case 'heading':
        const HeadingTag = viewportElement.content.level || 'h1';
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                          viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
            ...getPaddingStyle(viewportElement.content),
            ...getAnimationStyles(viewportElement.content.animation)
          }}>
            <HeadingTag
              style={{
                fontSize: viewportElement.content.fontSize,
                color: viewportElement.content.color,
                margin: 0,
                padding: 0
              }}
            >
              {viewportElement.content.text}
            </HeadingTag>
          </div>
        );
      
      case 'text':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                          viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
            ...getPaddingStyle(viewportElement.content)
          }}>
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
          </div>
        );
      
      case 'button':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                          viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
            ...getPaddingStyle(viewportElement.content)
          }}>
            <button
              style={{
                backgroundColor: viewportElement.content.backgroundColor,
                color: viewportElement.content.color,
                padding: viewportElement.content.padding || '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                margin: 0,
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
                width: 'auto',
                height: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {viewportElement.content.text}
            </button>
          </div>
        );
      
      case 'image':
        const imageWidth = viewportElement.responsive?.[activeView]?.content?.customWidth || 
                          viewportElement.content.customWidth || 
                          (viewportElement.content.size === 'small' ? 200 : 
                           viewportElement.content.size === 'large' ? 600 : 400);
        const imageHeight = viewportElement.responsive?.[activeView]?.content?.customHeight || 
                           viewportElement.content.customHeight || 
                           (viewportElement.content.size === 'small' ? 150 : 
                            viewportElement.content.size === 'large' ? 450 : 300);
        
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                          viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
            ...getPaddingStyle(viewportElement.content)
          }}>
            {viewportElement.content.src ? (
              <img
                src={viewportElement.content.src}
                alt={viewportElement.content.alt}
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  maxWidth: '100%',
                  maxHeight: '100%',
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
            )}
          </div>
        );
      
      case 'video':
        const videoWidth = viewportElement.responsive?.[activeView]?.content?.customWidth || 
                          viewportElement.content.customWidth || 
                          (viewportElement.content.size === 'small' ? 200 : 
                           viewportElement.content.size === 'large' ? 600 : 400);
        const videoHeight = viewportElement.responsive?.[activeView]?.content?.customHeight || 
                           viewportElement.content.customHeight || 
                           (viewportElement.content.size === 'small' ? 150 : 
                            viewportElement.content.size === 'large' ? 450 : 300);
        
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                          viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
            ...getPaddingStyle(viewportElement.content)
          }}>
            {viewportElement.content.src ? (
              <video
                src={viewportElement.content.src}
                style={{ 
                  width: videoWidth,
                  height: videoHeight,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: '8px'
                }}
                controls
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
            )}
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
              border: '1px dashed #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                            viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
              ...getPaddingStyle(viewportElement.content)
            }}
          >
            Container
          </div>
        );
      
      case 'spacer':
        const isSelected = selectedElement === viewportElement.id;
        const spacerHeight = viewportElement.content?.height || 50;
        return (
          <div
            style={{
              width: '100%',
              height: `${spacerHeight}px`,
              backgroundColor: 'rgba(156, 163, 175, 0.1)',
              border: isSelected ? '4px solid rgba(59, 130, 246, 0.8)' : '1px dashed rgba(156, 163, 175, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ 
              color: 'rgba(156, 163, 175, 0.6)', 
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Espaçador ({spacerHeight}px)
            </span>
          </div>
        );
      
      case 'html':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: viewportElement.style?.alignment === 'left' ? 'flex-start' : 
                            viewportElement.style?.alignment === 'right' ? 'flex-end' : 'center',
              ...getPaddingStyle(viewportElement.content)
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: viewportElement.content.html }}
              style={{ 
                width: '100%', 
                height: '100%',
                color: '#1f2937',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              className="html-content"
            />
          </div>
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

  // Event listeners para drag & drop
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleElementMouseMove(e as any);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        handleElementMouseUp(e as any);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, draggedElementId, dragStartY]);

  // Event listener para clicar fora dos elementos
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Verificar se o clique foi fora dos elementos e fora do painel de propriedades
      if (!target.closest('[data-element]') && 
          !target.closest('[data-properties-panel]') &&
          !target.closest('[data-sidebar]')) {
        setSelectedElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id && params.id) {
      // Verificar se estamos em modo de desenvolvimento local
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isLocalDev) {
        // Tentar carregar dados salvos do localStorage
        const savedData = localStorage.getItem(`template_${params.id}`);
        if (savedData) {
          try {
            const templateData = JSON.parse(savedData);
            console.log('Carregando template do localStorage:', templateData);
            
            setTemplateData({
              _id: params.id,
              name: 'Template Salvo',
              type: 'presell',
              content: { elements: [], background: { type: 'color', value: '#ffffff', image: '' } }
            });
            
            // Carregar elementos e background salvos
            if (templateData.elements) {
              setElements(templateData.elements);
            }
            if (templateData.background) {
              setBackground(templateData.background);
            }
            if (templateData.lastSaved) {
              setLastSaved(templateData.lastSaved);
            }
            
            setHasUnsavedChanges(false);
          } catch (error) {
            console.error('Erro ao carregar template do localStorage:', error);
            // Fallback para dados mock
            setTemplateData({
              _id: params.id,
              name: 'Template Mock',
              type: 'presell',
              content: { elements: [], background: { type: 'color', value: '#ffffff', image: '' } }
            });
          }
        } else {
          // Dados mock para novo template
          setTemplateData({
            _id: params.id,
            name: 'Template Mock',
            type: 'presell',
            content: { elements: [], background: { type: 'color', value: '#ffffff', image: '' } }
          });
        }
      } else {
        // Modo produção - carregar da API
        setTemplateData({
          _id: params.id,
          name: 'Template Mock',
          type: 'presell',
          content: { elements: [], background: { type: 'color', value: '#ffffff', image: '' } }
        });
      }
      
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

  // Função para converter hex para RGB
  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    // Handle # prefix
    if (hex.startsWith('#')) {
      hex = hex.slice(1);
    }
    // Handle 3-digit hex
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    }
    // Handle 6-digit hex
    else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  // Função para lidar com upload de imagem
  const handleImageUpload = (file: File) => {
    // Validar tamanho do arquivo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    
    // Simular upload - em produção, enviaria para servidor
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBackground({ ...background, image: result });
      setShowUpload(false);
      toast.success('Imagem carregada com sucesso!');
    };
    reader.onerror = () => {
      toast.error('Erro ao carregar a imagem.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* CSS para animações e scrollbar */}
      <style jsx>{`
        /* Scrollbar customizada para sidebar */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes rotateIn {
          from { transform: rotate(-200deg); opacity: 0; }
          to { transform: rotate(0deg); opacity: 1; }
        }
        
        @keyframes flipInX {
          from { transform: perspective(400px) rotateX(90deg); opacity: 0; }
          to { transform: perspective(400px) rotateX(0deg); opacity: 1; }
        }
        
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }
                  
                  /* Estilos para elementos HTML */
                  .html-content {
                    color: #1f2937 !important;
                  }
                  
                  .html-content * {
                    color: inherit !important;
                  }
                  
                  .html-content p, .html-content div, .html-content span {
                    color: #1f2937 !important;
                  }
                  
                  .html-content h1, .html-content h2, .html-content h3, 
                  .html-content h4, .html-content h5, .html-content h6 {
                    color: #111827 !important;
                    font-weight: 600;
                  }
                `}</style>
      
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 h-16 flex items-center px-6 shadow-2xl">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleBackNavigation}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              hasUnsavedChanges 
                ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            <span>Voltar</span>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </button>
          
          {/* Status de salvamento */}
          {lastSaved && (
            <div className="text-xs text-gray-400">
              Salvo: {new Date(lastSaved).toLocaleTimeString('pt-BR')}
            </div>
          )}
          
          <div className="flex bg-gray-800/50 rounded-2xl p-1 border border-gray-700">
            {(['desktop', 'tablet', 'mobile'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeView === view
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title={`${view === 'desktop' ? 'Desktop (100%)' : view === 'tablet' ? 'Tablet (80%)' : 'Mobile (60%)'}`}
              >
                {view === 'desktop' && <Monitor className="w-4 h-4" />}
                {view === 'tablet' && <Tablet className="w-4 h-4" />}
                {view === 'mobile' && <Smartphone className="w-4 h-4" />}
              </button>
            ))}
          </div>
          
          {/* Indicador de responsividade */}
          <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700">
            {activeView === 'desktop' && 'Desktop (100%)'}
            {activeView === 'tablet' && 'Tablet (80%)'}
            {activeView === 'mobile' && 'Mobile (60%)'}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Botões de ferramentas */}
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-xl p-1 border border-gray-700">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  showGrid 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Mostrar/Ocultar Grid"
              >
                <Square className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowLayers(!showLayers)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  showLayers 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Painel de Camadas"
              >
                <Layers className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowAnimations(!showAnimations)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  showAnimations 
                    ? 'bg-pink-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Animações"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={togglePreview}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 ${
                showPreview 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-blue-500/25'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{showPreview ? 'Ocultar Preview' : 'Preview'}</span>
            </button>
            
            <button
              onClick={saveAndMarkAsSaved}
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Esquerda - Elementos e Propriedades */}
        <div data-sidebar="left" className="w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-gray-700">
            {/* Tabs para alternar entre Elementos e Propriedades */}
            <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4">
              <button
                onClick={() => setSelectedElement(null)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                  !selectedElement
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Elementos
              </button>
              <button
                onClick={() => setSelectedElement(null)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                  selectedElement
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Propriedades
              </button>
            </div>
            
            {!selectedElement ? (
              <>
                <h2 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Elementos
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar elementos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all duration-300"
                  />
                </div>
              </>
            ) : (
              <h2 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Propriedades
              </h2>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
            {!selectedElement ? (
              // Painel de Elementos e Propriedades de Fundo
              <div>
                {/* Propriedades de Fundo */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-600/50">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Fundo da Página
                  </h4>
                  
                  {/* Tipo de Fundo */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-300 mb-2">Tipo de Fundo</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setBackground({ ...background, type: 'color' })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          background.type === 'color'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Cor
                      </button>
                      <button
                        onClick={() => setBackground({ ...background, type: 'image' })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          background.type === 'image'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Imagem
                      </button>
                    </div>
                  </div>

                  {/* Controles de Cor */}
                  {background.type === 'color' && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-300 mb-2">Cor de Fundo</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={background.value}
                          onChange={(e) => setBackground({ ...background, value: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={background.value}
                          onChange={(e) => setBackground({ ...background, value: e.target.value })}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  )}

                  {/* Controles de Imagem */}
                  {background.type === 'image' && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-300 mb-2">Imagem de Fundo</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={background.image}
                            onChange={(e) => setBackground({ ...background, image: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                          {background.image && (
                            <button
                              onClick={() => setBackground({ ...background, image: '', type: 'color' })}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                              title="Remover imagem"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setShowUpload(true)}
                          className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Upload de Imagem
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Controle de Opacidade */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-300 mb-2">Opacidade</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={background.opacity}
                        onChange={(e) => setBackground({ ...background, opacity: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-400 w-12 text-right">
                        {Math.round(background.opacity * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Preview do Fundo */}
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-300 mb-2">Preview</label>
                    <div className="w-full h-16 rounded-lg border border-gray-600 relative overflow-hidden">
                      {/* Camada de Fundo com Opacidade */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: background.type === 'color' 
                            ? `rgba(${hexToRgb(background.value)}, ${background.opacity})` 
                            : 'transparent',
                          backgroundImage: background.type === 'image' && background.image ? `url(${background.image})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: background.type === 'image' ? background.opacity : 1
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Elementos */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    <Layers className="w-4 h-4 mr-2" />
                    Adicionar Elementos
                  </h4>
                </div>
                
                {ELEMENT_CATEGORIES.map((category) => (
                  <div key={category.id} className="mb-6">
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all duration-300 ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-600'
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
                            draggable="true"
                            onDragStart={(e) => handleSidebarDragStart(e, element.id)}
                            onClick={() => addElement(element.id)}
                            className="aspect-square rounded-2xl text-white flex flex-col items-center justify-center space-y-2 hover:opacity-90 transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-lg border border-gray-600/30"
                            style={{ 
                              background: `linear-gradient(135deg, ${element.color.replace('bg-', '').replace('-500', '')}, ${element.color.replace('bg-', '').replace('-500', '')}dd)`,
                              boxShadow: `0 4px 15px ${element.color.replace('bg-', '').replace('-500', '')}40`
                            }}
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
            ) : (
              // Painel de Propriedades
              <div>
                <h3 className="font-medium text-white mb-4 capitalize bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {elements.find(e => e.id === selectedElement)?.type}
                </h3>
                
                {/* Controles de Responsividade - Não mostrar para espaçador */}
                {elements.find(e => e.id === selectedElement)?.type !== 'spacer' && (
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-600/50">
                    <h4 className="text-sm font-medium text-white mb-3">Responsividade</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">
                          Tamanho da Fonte ({activeView})
                        </label>
                        <input
                          type="number"
                          min="8"
                          max="200"
                          value={elements.find(e => e.id === selectedElement)?.content?.fontSize || 16}
                          onChange={(e) => {
                            const element = elements.find(e => e.id === selectedElement);
                            if (element) {
                              updateElement(selectedElement, {
                                content: { ...element.content, fontSize: parseInt(e.target.value) || 16 }
                              });
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        Desktop: 100% | Tablet: 80% | Mobile: 60%
                      </div>
                    </div>
                  </div>
                )}

                {/* Controles de Animação - Não mostrar para espaçador */}
                {elements.find(e => e.id === selectedElement)?.type !== 'spacer' && (
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-600/50">
                    <h4 className="text-sm font-medium text-white mb-3">Animações</h4>
                    <select
                      value={elements.find(e => e.id === selectedElement)?.content?.animation || ''}
                      onChange={(e) => applyAnimation(selectedElement, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Sem animação</option>
                      {ANIMATIONS.map((anim) => (
                        <option key={anim.id} value={anim.id}>
                          {anim.name} ({anim.duration}ms)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {renderElementProperties(selectedElement)}
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-gray-800/20 to-gray-900/20">
          {showPreview ? (
            /* Preview Mode */
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto" style={{ width: getCanvasSize().width, height: getCanvasSize().height }}>
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Preview - {templateData.name || 'Template'}</h3>
                <div className="flex space-x-2">
                  {(['desktop', 'tablet', 'mobile'] as const).map((viewport) => (
                    <button
                      key={viewport}
                      onClick={() => setPreviewViewport(viewport)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        previewViewport === viewport
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {viewport === 'desktop' && <Monitor className="w-4 h-4 inline mr-1" />}
                      {viewport === 'tablet' && <Tablet className="w-4 h-4 inline mr-1" />}
                      {viewport === 'mobile' && <Smartphone className="w-4 h-4 inline mr-1" />}
                      {viewport.charAt(0).toUpperCase() + viewport.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview Content */}
              <div 
                className="relative overflow-auto"
                style={{
                  height: getCanvasSize().height - 60
                }}
              >
                {/* Camada de Fundo com Opacidade */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: background.type === 'color' 
                      ? `rgba(${hexToRgb(background.value)}, ${background.opacity})` 
                      : 'transparent',
                    backgroundImage: background.type === 'image' && background.image ? `url(${background.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: background.type === 'image' ? background.opacity : 1
                  }}
                />
                {/* Camada de Conteúdo com Opacidade Total */}
                <div className="relative z-10" style={{ opacity: 1 }}>
                {elements.map((element) => {
                  const scaleFactor = previewViewport === 'tablet' ? 0.8 : previewViewport === 'mobile' ? 0.6 : 1;
                  const scaledWidth = element.size.width * scaleFactor;
                  const scaledHeight = element.size.height * scaleFactor;
                  const canvasWidth = getCanvasSize().width;
                  const left = (canvasWidth - scaledWidth) / 2;
                  
                  return (
                    <div
                      key={element.id}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: left,
                        top: element.position.y,
                        width: scaledWidth,
                        height: scaledHeight,
                        padding: `${element.content.paddingTop || 0}px ${element.content.paddingRight || 0}px ${element.content.paddingBottom || 0}px ${element.content.paddingLeft || 0}px`
                      }}
                    >
                      {renderElement(element)}
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div
              className="relative bg-gray-900/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-auto border border-gray-600/50 mx-auto"
              style={{
                width: getCanvasSize().width,
                height: getCanvasSize().height,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
            >
            {/* Camada de Fundo com Opacidade */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                backgroundColor: background.type === 'color' 
                  ? `rgba(${hexToRgb(background.value)}, ${background.opacity})` 
                  : 'transparent',
                backgroundImage: background.type === 'image' && background.image ? `url(${background.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: background.type === 'image' ? background.opacity : 1
              }}
            />
            {/* Grid */}
            {renderGrid()}
            {/* Camada de Conteúdo com Opacidade Total */}
            <div className="relative z-10" style={{ opacity: 1 }}>
            {elements.length === 0 ? (
              <div className="absolute inset-0 flex items-start justify-center text-center p-8 pt-48">
                <div className="max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                    <Plus className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Comece adicionando elementos</h3>
                  <p className="text-gray-300">Use a barra lateral para adicionar elementos ao seu template</p>
                </div>
              </div>
            ) : (
              elements.map((element) => (
                <div
                  key={element.id}
                  data-element="true"
                  data-element-id={element.id}
                  className={`absolute cursor-move transition-all duration-200 ${
                    selectedElement === element.id && element.type !== 'spacer' ? 'ring-4 ring-blue-400 ring-opacity-80 shadow-2xl shadow-blue-500/25' : ''
                  } ${
                    isDragging && draggedElementId === element.id ? 'z-50' : 'z-10'
                  }`}
                  style={{
                    ...getResponsivePosition(element),
                    top: element.position.y + (isDragging && draggedElementId === element.id ? dragOffset : 0),
                    transform: isDragging && draggedElementId === element.id ? `translateY(${dragOffset}px)` : 'none'
                  }}
                  onClick={() => setSelectedElement(element.id)}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                  onMouseMove={handleElementMouseMove}
                  onMouseUp={handleElementMouseUp}
                >
                  {renderElement(element)}
                  
                  {selectedElement === element.id && (
                    <div className="absolute -top-10 left-0 flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* Indicador de drag */}
                  {isDragging && draggedElementId === element.id && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Arrastando
                    </div>
                  )}
                </div>
              ))
            )}
            </div>
            </div>
          )}
        </div>

        {/* Sidebar Direita - Painel de Camadas */}
        {showLayers && (
          <div className="w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Camadas
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Gerencie a ordem dos elementos
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
              <div className="space-y-2">
                {getSortedElements().map((element, index) => (
                  <div
                    key={element.id}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      selectedElement === element.id
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 text-gray-300'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-sm font-medium">
                          {getElementDisplayName(element)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index > 0) {
                              const newElements = [...elements];
                              [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
                              setElements(newElements);
                              saveToHistory(newElements);
                            }
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index < elements.length - 1) {
                              const newElements = [...elements];
                              [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
                              setElements(newElements);
                              saveToHistory(newElements);
                            }
                          }}
                          disabled={index === elements.length - 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Saída */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-yellow-500/20 p-3 rounded-2xl border border-yellow-500/30">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Mudanças não salvas
                </h3>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Você tem mudanças não salvas no template. Se sair agora, todas as alterações serão perdidas.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105"
                >
                  Quero sair
                </button>
                <button
                  onClick={cancelExit}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                  Continuar editando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Imagem */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/30">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Upload de Imagem
                  </h3>
                </div>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Área de Drag and Drop */}
                <div
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
                    
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  onClick={() => {
                    const input = document.getElementById('image-upload') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <div className="space-y-3">
                    <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Arraste uma imagem aqui</p>
                      <p className="text-gray-400 text-sm">ou clique para selecionar</p>
                    </div>
                  </div>
                </div>
                
                {/* Input de arquivo oculto */}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  className="hidden"
                />
                
                <div className="text-xs text-gray-400 text-center">
                  Formatos suportados: JPG, PNG, GIF, WebP (máx. 5MB)
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
