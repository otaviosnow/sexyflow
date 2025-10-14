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
  Code,
  Layout,
  Grid,
  Layers,
  Search,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Copy,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Link,
  Maximize,
  Minimize,
  Upload,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Download,
  Share,
  Lock,
  Unlock,
  Eye as EyeIcon,
  EyeOff,
  Zap,
  Target,
  Star,
  Heart,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle
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
  responsive?: {
    desktop: { position: { x: number; y: number }; size: { width: number; height: number }; content?: any };
    tablet: { position: { x: number; y: number }; size: { width: number; height: number }; content?: any };
    mobile: { position: { x: number; y: number }; size: { width: number; height: number }; content?: any };
  };
}

// Categorias simplificadas conforme solicitado
const ELEMENT_CATEGORIES = [
  {
    id: 'basic',
    name: 'BÁSICOS',
    icon: Layout,
    elements: [
      { id: 'heading', name: 'Título', icon: Type, color: 'bg-blue-500', description: 'Títulos H1, H2, H3...' },
      { id: 'text', name: 'Editor de Texto', icon: Type, color: 'bg-green-500', description: 'Parágrafo de texto' },
      { id: 'button', name: 'Botão', icon: MousePointer, color: 'bg-purple-500', description: 'Botão de ação' },
      { id: 'image', name: 'Imagem', icon: Image, color: 'bg-orange-500', description: 'Imagem com otimização' },
      { id: 'video', name: 'Vídeo', icon: Video, color: 'bg-red-500', description: 'Vídeo responsivo' },
      { id: 'divider', name: 'Divisor', icon: Layout, color: 'bg-gray-500', description: 'Linha divisória' },
      { id: 'spacer', name: 'Espaçador', icon: Layout, color: 'bg-slate-500', description: 'Espaço em branco' },
      { id: 'icon', name: 'Ícone', icon: Star, color: 'bg-yellow-500', description: 'Ícones vetoriais' },
      { id: 'progress', name: 'Barra de Progresso', icon: Target, color: 'bg-teal-500', description: 'Indicador de progresso' },
      { id: 'testimonial', name: 'Depoimento', icon: Users, color: 'bg-cyan-500', description: 'Avaliações com sistema de estrelas' },
    ]
  },
  {
    id: 'layout',
    name: 'LAYOUT',
    icon: Grid,
    elements: [
      { id: 'container', name: 'Seção Interna', icon: Layout, color: 'bg-indigo-500', description: 'Container flexível' },
      { id: 'column', name: 'Coluna', icon: Layout, color: 'bg-cyan-500', description: 'Coluna de conteúdo' },
      { id: 'section', name: 'Seção', icon: Grid, color: 'bg-teal-500', description: 'Seção completa' },
      { id: 'accordion', name: 'Accordion', icon: ChevronDown, color: 'bg-violet-500', description: 'Conteúdo expansível' },
      { id: 'tabs', name: 'Abas', icon: Layers, color: 'bg-fuchsia-500', description: 'Navegação por abas' },
    ]
  },
  {
    id: 'advanced',
    name: 'AVANÇADOS',
    icon: Code,
    elements: [
      { id: 'html', name: 'HTML', icon: Code, color: 'bg-gray-700', description: 'Código HTML customizado' },
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
  const [showUpload, setShowUpload] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']));
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showOutline, setShowOutline] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const [templateData, setTemplateData] = useState<Template>({
    _id: '',
    name: '',
    type: 'presell',
    content: {}
  });

  const [elements, setElements] = useState<Element[]>([]);
  const [background, setBackground] = useState({ type: 'color', value: '#ffffff', image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Monitorar mudanças nos elementos para debug
  useEffect(() => {
    console.log('🔍 Elements state changed:', elements);
    console.log('📊 Elements count:', elements.length);
  }, [elements]);

  // Monitorar mudanças no background para debug
  useEffect(() => {
    console.log('🎨 Background state changed:', background);
    if (background.type === 'image' && background.image) {
      console.log('🖼️ Background image URL:', background.image);
      console.log('🔗 Full URL:', `url('${background.image}')`);
    }
  }, [background]);

  // Auto-save periódico para evitar perda de dados
  useEffect(() => {
    if (elements.length > 0 && !loading) {
      const autoSaveTimer = setTimeout(() => {
        console.log('🔄 Auto-save triggered');
        handleSave();
      }, 30000); // Auto-save a cada 30 segundos

      return () => clearTimeout(autoSaveTimer);
    }
  }, [elements, loading]);

  // Eventos globais para drag & drop
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

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/templates/${params.id}`);
      if (response.ok) {
        const templateData = await response.json();
        setTemplateData(templateData);
        
        // Garantir que os elementos sempre existam
        const templateElements = templateData.content?.elements || [];
        console.log('📥 Elementos carregados do template:', templateElements);
        
        // Garantir que o background sempre existe
        const templateBackground = templateData.content?.background || { type: 'color', value: '#ffffff', image: '' };
        console.log('🎨 Background carregado do template:', templateBackground);
        
        setElements(templateElements);
        setBackground(templateBackground);
        
        // Inicializar histórico apenas se houver elementos
        if (templateElements.length > 0) {
          saveToHistory(templateElements);
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

  const saveToHistory = (newElements: Element[]) => {
    console.log('💾 Salvando no histórico:', newElements);
    const newHistory = history.slice(0, historyIndex + 1);
    // Criar uma cópia profunda dos elementos para evitar referências
    const elementsCopy = JSON.parse(JSON.stringify(newElements));
    newHistory.push(elementsCopy);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSave = async () => {
    console.log('💾 handleSave called');
    console.log('📊 Current elements:', elements);
    console.log('🎨 Current background:', background);
    
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

      console.log('📤 Template to save:', updatedTemplate);

      const response = await fetch(`/api/admin/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTemplate),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Save successful:', result);
        toast.success('Template salvo com sucesso!');
        setTemplateData(updatedTemplate);
      } else {
        const errorText = await response.text();
        console.log('❌ Save failed:', errorText);
        toast.error(`Erro ao salvar: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Save error:', error);
      toast.error(`Erro ao salvar: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const addElement = (type: string) => {
    console.log('🎯 addElement called with type:', type);
    console.log('📊 Current elements count:', elements.length);
    
    const defaultSize = getDefaultSize(type);
    console.log('📏 Default size:', defaultSize);
    
    const centeredX = getCenteredPosition(defaultSize.width);
    console.log('📍 Centered X position:', centeredX);
    
    // Calcular posição Y baseada na posição do último elemento + seu tamanho + margem
    let elementY = 50; // Margem inicial do topo
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      const lastElementViewport = getElementForViewport(lastElement);
      elementY = lastElementViewport.position.y + lastElementViewport.size.height + 20; // 20px de margem
    }
    
    console.log('📍 Element Y position:', elementY);
    
    const newElement: Element = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      content: getDefaultContent(type),
      position: { x: centeredX, y: elementY },
      size: defaultSize,
      style: getDefaultStyle(type),
      responsive: {
        desktop: { position: { x: centeredX, y: elementY }, size: defaultSize },
        tablet: { position: { x: centeredX, y: elementY }, size: defaultSize },
        mobile: { position: { x: centeredX, y: elementY }, size: defaultSize }
      }
    };

    console.log('✨ New element created:', newElement);
    
    const newElements = [...elements, newElement];
    console.log('📋 New elements array:', newElements);
    
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements);
    toast.success('Elemento adicionado!');
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('elementType');
    console.log('🎯 handleCanvasDrop called with elementType:', elementType);
    
    if (!elementType) {
      console.log('❌ No elementType found');
      return;
    }

    const defaultSize = getDefaultSize(elementType);
    console.log('📏 Default size for drag:', defaultSize);
    
    const centeredX = getCenteredPosition(defaultSize.width);
    
    // Calcular posição Y baseada na posição do último elemento + seu tamanho + margem
    let elementY = 50; // Margem inicial do topo
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      const lastElementViewport = getElementForViewport(lastElement);
      elementY = lastElementViewport.position.y + lastElementViewport.size.height + 20; // 20px de margem
    }
    
    console.log('📍 Sequential position:', { centeredX, elementY });

    const newElement: Element = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: elementType,
      content: getDefaultContent(elementType),
      position: { x: centeredX, y: elementY },
      size: defaultSize,
      style: getDefaultStyle(elementType),
      responsive: {
        desktop: { position: { x: centeredX, y: elementY }, size: defaultSize },
        tablet: { position: { x: centeredX, y: elementY }, size: defaultSize },
        mobile: { position: { x: centeredX, y: elementY }, size: defaultSize }
      }
    };

    console.log('✨ New dragged element created:', newElement);
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements);
    toast.success('Elemento adicionado ao canvas!');
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Funções para drag & drop de reordenação
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    // Só ativa o drag se não estiver no modo de edição
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
      return;
    }
    
    setIsDragging(true);
    setDraggedElementId(elementId);
    setDragStartY(e.clientY);
    setDragOffset(0);
    
    e.preventDefault();
  };

  const handleElementMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedElementId) return;
    
    const currentY = e.clientY;
    const offset = currentY - dragStartY;
    setDragOffset(offset);
  };

  const handleElementMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !draggedElementId) return;
    
    const currentY = e.clientY;
    const offset = currentY - dragStartY;
    
    // Calcular qual elemento deve trocar de posição
    const draggedElement = elements.find(el => el.id === draggedElementId);
    if (!draggedElement) {
      resetDrag();
      return;
    }

    const draggedIndex = elements.indexOf(draggedElement);
    const draggedViewport = getElementForViewport(draggedElement);
    const draggedCenterY = draggedViewport.position.y + (draggedViewport.size.height / 2);
    
    // Encontrar o elemento mais próximo
    let targetIndex = -1;
    let minDistance = Infinity;
    
    elements.forEach((element, index) => {
      if (index === draggedIndex) return;
      
      const elementViewport = getElementForViewport(element);
      const elementCenterY = elementViewport.position.y + (elementViewport.size.height / 2);
      const distance = Math.abs((draggedCenterY + offset) - elementCenterY);
      
      if (distance < minDistance) {
        minDistance = distance;
        targetIndex = index;
      }
    });
    
    // Reordenar elementos se encontrou um alvo válido
    if (targetIndex !== -1 && targetIndex !== draggedIndex) {
      reorderElements(draggedIndex, targetIndex);
    }
    
    resetDrag();
  };

  const resetDrag = () => {
    setIsDragging(false);
    setDraggedElementId(null);
    setDragStartY(0);
    setDragOffset(0);
  };

  const reorderElements = (fromIndex: number, toIndex: number) => {
    const newElements = [...elements];
    const [draggedElement] = newElements.splice(fromIndex, 1);
    newElements.splice(toIndex, 0, draggedElement);
    
    // Recalcular posições Y para todos os elementos
    const reorderedElements = newElements.map((element, index) => {
      const viewportData = getElementForViewport(element);
      let newY = 50; // Margem inicial
      
      // Calcular Y baseado na posição do elemento anterior
      for (let i = 0; i < index; i++) {
        const prevElement = newElements[i];
        const prevViewport = getElementForViewport(prevElement);
        newY = prevViewport.position.y + prevViewport.size.height + 20;
      }
      
      return {
        ...element,
        position: { ...viewportData.position, y: newY },
        responsive: {
          ...element.responsive,
          desktop: { ...viewportData, position: { ...viewportData.position, y: newY } },
          tablet: { ...element.responsive.tablet, position: { ...element.responsive.tablet.position, y: newY } },
          mobile: { ...element.responsive.mobile, position: { ...element.responsive.mobile.position, y: newY } }
        }
      };
    });
    
    setElements(reorderedElements);
    saveToHistory(reorderedElements);
    toast.success('Elementos reordenados!');
  };

  const handleElementDragStart = (elementType: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', elementType);
  };

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user-media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📤 Upload result:', result);
        toast.success('Arquivo enviado com sucesso!');
        
        // Usar a URL completa da imagem
        const imageUrl = result.url || result.path || result.filename;
        console.log('🖼️ Image URL to use:', imageUrl);
        
        if (selectedElement && elements.find(e => e.id === selectedElement)?.type === 'background') {
          updateElement(selectedElement, {
            content: { ...elements.find(e => e.id === selectedElement)?.content, image: imageUrl }
          });
        } else if (selectedElement && elements.find(e => e.id === selectedElement)?.type === 'image') {
          updateElement(selectedElement, {
            content: { ...elements.find(e => e.id === selectedElement)?.content, src: imageUrl }
          });
        } else {
          setBackground({ ...background, image: imageUrl });
        }
        
        setShowUpload(false);
      } else {
        const errorText = await response.text();
        console.error('❌ Upload error:', errorText);
        toast.error('Erro ao enviar arquivo');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading':
        return { 
          text: 'Título Principal', 
          level: 'h1', 
          fontSize: 48, 
          color: '#1f2937', 
          fontWeight: 'bold', 
          textAlign: 'center',
          marginTop: 0,
          marginBottom: 0,
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          fontFamily: 'inherit'
        };
      case 'text':
        return { 
          text: 'Este é um parágrafo de texto. Clique para editar o conteúdo.', 
          fontSize: 16, 
          color: '#374151', 
          lineHeight: 1.6, 
          textAlign: 'left', 
          fontWeight: 'normal',
          marginTop: 0,
          marginBottom: 0,
          letterSpacing: 0,
          textDecoration: 'none',
          fontFamily: 'inherit'
        };
      case 'button':
        return { 
          text: 'Clique Aqui', 
          backgroundColor: '#3b82f6', 
          color: '#ffffff', 
          borderRadius: 8, 
          padding: '12px 24px',
          link: '',
          target: '_self',
          fontSize: 16,
          fontWeight: 'normal',
          borderWidth: 0,
          borderColor: 'transparent',
          hoverBackgroundColor: '#2563eb',
          hoverColor: '#ffffff',
          transition: 'all 0.3s ease'
        };
      case 'image':
        return { 
          src: '', 
          alt: 'Imagem', 
          width: 300, 
          height: 200, 
          borderRadius: 8,
          objectFit: 'cover',
          caption: '',
          link: '',
          target: '_self'
        };
      case 'video':
        return { 
          src: '', 
          poster: '', 
          width: 400, 
          height: 225, 
          borderRadius: 8,
          autoplay: false,
          controls: true,
          loop: false,
          muted: false,
          preload: 'metadata'
        };
      case 'container':
        return { 
          backgroundColor: 'transparent', 
          padding: 20, 
          borderRadius: 0, 
          border: 'none',
          minHeight: 100,
          maxWidth: '100%',
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0
        };
      case 'column':
        return { 
          backgroundColor: 'transparent', 
          padding: 15, 
          borderRadius: 0,
          minHeight: 100,
          width: '100%'
        };
      case 'section':
        return { 
          backgroundColor: '#f9fafb', 
          padding: 40, 
          borderRadius: 0, 
          border: 'none',
          minHeight: 200,
          backgroundImage: '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'spacer':
        return { 
          height: 50, 
          backgroundColor: 'transparent',
          width: '100%'
        };
      case 'html':
        return { 
          html: '<div style="padding: 20px; background: #f3f4f6; border-radius: 8px;">HTML personalizado</div>',
          isEditing: false
        };
      case 'divider':
        return { 
          height: 2, 
          backgroundColor: '#e5e7eb', 
          style: 'solid',
          width: '100%',
          marginTop: 20,
          marginBottom: 20
        };
      case 'icon':
        return { 
          icon: 'star', 
          size: 24, 
          color: '#3b82f6',
          backgroundColor: 'transparent',
          padding: 0,
          borderRadius: 0,
          link: '',
          target: '_self'
        };
      case 'progress':
        return {
          percentage: 75,
          color: '#3b82f6',
          backgroundColor: '#e5e7eb',
          height: 8,
          borderRadius: 4,
          text: 'Progresso',
          showText: true,
          textColor: '#374151'
        };
      case 'testimonial':
        return {
          text: 'Este é um depoimento incrível do nosso cliente.',
          author: 'Nome do Cliente',
          role: 'CEO, Empresa',
          avatar: '',
          rating: 5,
          backgroundColor: '#ffffff',
          textColor: '#374151',
          authorColor: '#1f2937',
          roleColor: '#6b7280'
        };
      case 'accordion':
        return {
          items: [
            { title: 'Item 1', content: 'Conteúdo do item 1' },
            { title: 'Item 2', content: 'Conteúdo do item 2' }
          ],
          backgroundColor: '#ffffff',
          titleColor: '#1f2937',
          contentColor: '#374151',
          borderColor: '#e5e7eb'
        };
      case 'tabs':
        return {
          items: [
            { title: 'Aba 1', content: 'Conteúdo da aba 1' },
            { title: 'Aba 2', content: 'Conteúdo da aba 2' }
          ],
          activeTab: 0,
          backgroundColor: '#ffffff',
          titleColor: '#1f2937',
          contentColor: '#374151',
          activeColor: '#3b82f6'
        };
      default:
        return {};
    }
  };

  const getDefaultSize = (type: string) => {
    const { width: canvasWidth } = getCanvasSize();
    
    switch (type) {
      case 'heading':
        return { width: Math.min(400, canvasWidth - 40), height: 60 };
      case 'text':
        return { width: Math.min(300, canvasWidth - 40), height: 80 };
      case 'button':
        return { width: 150, height: 50 };
      case 'image':
        return { width: Math.min(300, canvasWidth - 40), height: 200 };
      case 'video':
        return { width: Math.min(400, canvasWidth - 40), height: 225 };
      case 'container':
        return { width: Math.min(500, canvasWidth - 40), height: 200 };
      case 'column':
        return { width: Math.min(250, canvasWidth - 40), height: 300 };
      case 'section':
        return { width: Math.min(800, canvasWidth - 20), height: 300 };
      case 'spacer':
        return { width: Math.min(100, canvasWidth - 40), height: 50 };
      case 'html':
        return { width: Math.min(300, canvasWidth - 40), height: 100 };
      case 'divider':
        return { width: Math.min(400, canvasWidth - 40), height: 2 };
      case 'icon':
        return { width: 48, height: 48 };
      case 'progress':
        return { width: Math.min(300, canvasWidth - 40), height: 40 };
      case 'testimonial':
        return { width: Math.min(350, canvasWidth - 40), height: 200 };
      case 'accordion':
        return { width: Math.min(400, canvasWidth - 40), height: 150 };
      case 'tabs':
        return { width: Math.min(400, canvasWidth - 40), height: 200 };
      default:
        return { width: Math.min(200, canvasWidth - 40), height: 50 };
    }
  };

  const getCenteredPosition = (elementWidth: number) => {
    const { width: canvasWidth } = getCanvasSize();
    return (canvasWidth - elementWidth) / 2;
  };

  const getDefaultStyle = (type: string) => {
    switch (type) {
      case 'button':
        return { cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: 'none' };
      case 'image':
        return { objectFit: 'cover', cursor: 'pointer' };
      case 'video':
        return { objectFit: 'cover', cursor: 'pointer' };
      case 'icon':
        return { cursor: 'pointer', transition: 'all 0.3s ease' };
      default:
        return {};
    }
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    const newElements = elements.map(element => {
      if (element.id === elementId) {
        const updatedElement = { ...element, ...updates };
        
        // Sempre atualizar o objeto responsive
        const currentResponsive = updatedElement.responsive || {
          desktop: { position: updatedElement.position, size: updatedElement.size, content: updatedElement.content },
          tablet: { position: updatedElement.position, size: updatedElement.size, content: updatedElement.content },
          mobile: { position: updatedElement.position, size: updatedElement.size, content: updatedElement.content }
        };
        
        // Atualizar apenas o viewport ativo
        updatedElement.responsive = {
          ...currentResponsive,
          [activeView as keyof typeof currentResponsive]: {
            position: updates.position || currentResponsive[activeView as keyof typeof currentResponsive]?.position || updatedElement.position,
            size: updates.size || currentResponsive[activeView as keyof typeof currentResponsive]?.size || updatedElement.size,
            content: updates.content || currentResponsive[activeView as keyof typeof currentResponsive]?.content || updatedElement.content
          }
        };

        // Se estamos atualizando posição/tamanho, também atualizar o elemento principal
        if (updates.position) {
          updatedElement.position = updates.position;
        }
        if (updates.size) {
          updatedElement.size = updates.size;
        }
        if (updates.content) {
          updatedElement.content = updates.content;
        }
        
        return updatedElement;
      }
      return element;
    });
    
    setElements(newElements);
    saveToHistory(newElements);
  };

  const deleteElement = (elementId: string) => {
    const newElements = elements.filter(element => element.id !== elementId);
    setElements(newElements);
    saveToHistory(newElements);
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Elemento removido!');
  };

  const duplicateElement = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    if (element) {
      const newElement: Element = {
        ...element,
        id: `element_${Date.now()}`,
        position: { x: element.position.x + 20, y: element.position.y + 20 },
        responsive: {
          desktop: { 
            position: { x: element.position.x + 20, y: element.position.y + 20 }, 
            size: element.size 
          },
          tablet: { 
            position: { x: element.position.x + 20, y: element.position.y + 20 }, 
            size: element.size 
          },
          mobile: { 
            position: { x: element.position.x + 20, y: element.position.y + 20 }, 
            size: element.size 
          }
        }
      };
      
      const newElements = [...elements, newElement];
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedElement(newElement.id);
      toast.success('Elemento duplicado!');
    }
  };

  const getCanvasSize = () => {
    switch (activeView) {
      case 'desktop': return { width: 1200, height: 800 };
      case 'tablet': return { width: 768, height: 600 };
      case 'mobile': return { width: 375, height: 667 };
      default: return { width: 1200, height: 800 };
    }
  };

  const getElementForViewport = (element: Element) => {
    // Garantir que o objeto responsive sempre existe
    const responsive = element.responsive || {
      desktop: { position: element.position, size: element.size, content: element.content },
      tablet: { position: element.position, size: element.size, content: element.content },
      mobile: { position: element.position, size: element.size, content: element.content }
    };
    
    const viewportData = responsive[activeView as keyof typeof responsive];
    if (viewportData) {
      return {
        ...element,
        position: viewportData.position || element.position,
        size: viewportData.size || element.size,
        content: viewportData.content || element.content,
        responsive: responsive
      };
    }
    return element;
  };

  const getElementDataForCurrentViewport = (element: Element) => {
    if (element.responsive?.[activeView as keyof typeof element.responsive]) {
      const viewportData = element.responsive[activeView as keyof typeof element.responsive];
      return {
        position: viewportData?.position || element.position,
        size: viewportData?.size || element.size,
        content: viewportData?.content || element.content
      };
    }
    return {
      position: element.position,
      size: element.size,
      content: element.content
    };
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Ordenar elementos por posição Y (de cima para baixo)
  const getSortedElements = () => {
    return [...elements].sort((a, b) => {
      const aY = getElementForViewport(a).position.y;
      const bY = getElementForViewport(b).position.y;
      return aY - bY;
    });
  };

  // Obter nome do elemento para exibição
  const getElementDisplayName = (element: Element) => {
    const viewportElement = getElementForViewport(element);
    switch (viewportElement.type) {
      case 'heading':
        return `Título: ${viewportElement.content.text || 'Sem texto'}`;
      case 'text':
        return `Texto: ${viewportElement.content.text?.substring(0, 30) || 'Sem texto'}...`;
      case 'button':
        return `Botão: ${viewportElement.content.text || 'Sem texto'}`;
      case 'image':
        return viewportElement.content.src ? 'Imagem' : 'Imagem (sem arquivo)';
      case 'video':
        return viewportElement.content.src ? 'Vídeo' : 'Vídeo (sem arquivo)';
      case 'html':
        return 'HTML Personalizado';
      case 'container':
        return 'Container';
      case 'column':
        return 'Coluna';
      case 'section':
        return 'Seção';
      case 'spacer':
        return 'Espaçador';
      case 'divider':
        return 'Divisor';
      case 'icon':
        return 'Ícone';
      case 'progress':
        return 'Barra de Progresso';
      case 'testimonial':
        return `Depoimento: ${viewportElement.content.author || 'Sem autor'}`;
      case 'accordion':
        return 'Accordion';
      case 'tabs':
        return 'Abas';
      default:
        return `${viewportElement.type.charAt(0).toUpperCase() + viewportElement.type.slice(1)}`;
    }
  };

  const renderElement = (element: Element) => {
    const viewportElement = getElementForViewport(element);
    
    switch (viewportElement.type) {
      case 'heading':
        const HeadingTag = viewportElement.content.level || 'h1';
        return (
          <HeadingTag 
            style={{ 
              color: viewportElement.content.color, 
              fontSize: viewportElement.content.fontSize + 'px',
              fontWeight: viewportElement.content.fontWeight,
              margin: 0,
              lineHeight: viewportElement.content.lineHeight,
              textAlign: viewportElement.content.textAlign || 'center',
              marginTop: (viewportElement.content.marginTop || 0) + 'px',
              marginBottom: (viewportElement.content.marginBottom || 0) + 'px',
              letterSpacing: viewportElement.content.letterSpacing + 'px',
              textDecoration: viewportElement.content.textDecoration,
              fontFamily: viewportElement.content.fontFamily
            }}
          >
            {viewportElement.content.text}
          </HeadingTag>
        );
      case 'text':
        return (
          <p 
            style={{ 
              color: viewportElement.content.color, 
              fontSize: viewportElement.content.fontSize + 'px',
              fontWeight: viewportElement.content.fontWeight || 'normal',
              lineHeight: viewportElement.content.lineHeight,
              margin: 0,
              textAlign: viewportElement.content.textAlign || 'left',
              marginTop: (viewportElement.content.marginTop || 0) + 'px',
              marginBottom: (viewportElement.content.marginBottom || 0) + 'px',
              letterSpacing: viewportElement.content.letterSpacing + 'px',
              textDecoration: viewportElement.content.textDecoration,
              fontFamily: viewportElement.content.fontFamily
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
              padding: viewportElement.content.padding,
              borderRadius: viewportElement.content.borderRadius + 'px',
              border: viewportElement.content.borderWidth + 'px solid ' + viewportElement.content.borderColor,
              cursor: 'pointer',
              fontSize: viewportElement.content.fontSize + 'px',
              fontWeight: viewportElement.content.fontWeight,
              boxShadow: viewportElement.style?.boxShadow,
              transition: viewportElement.content.transition,
              ...viewportElement.style
            }}
            onMouseEnter={(e) => {
              if (viewportElement.content.hoverBackgroundColor) {
                e.currentTarget.style.backgroundColor = viewportElement.content.hoverBackgroundColor;
              }
              if (viewportElement.content.hoverColor) {
                e.currentTarget.style.color = viewportElement.content.hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = viewportElement.content.backgroundColor;
              e.currentTarget.style.color = viewportElement.content.color;
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
              objectFit: viewportElement.content.objectFit || 'cover',
              borderRadius: viewportElement.content.borderRadius + 'px',
              cursor: viewportElement.style?.cursor
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
        return viewportElement.content.src ? (
          <video
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: viewportElement.style?.objectFit || 'cover',
              borderRadius: viewportElement.content.borderRadius + 'px'
            }}
            controls={viewportElement.content.controls}
            poster={viewportElement.content.poster}
            autoPlay={viewportElement.content.autoplay}
            loop={viewportElement.content.loop}
            muted={viewportElement.content.muted}
            preload={viewportElement.content.preload}
          >
            <source src={viewportElement.content.src} type="video/mp4" />
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
              backgroundColor: viewportElement.content.backgroundColor,
              padding: viewportElement.content.padding + 'px',
              borderRadius: viewportElement.content.borderRadius + 'px',
              border: viewportElement.content.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: viewportElement.content.minHeight + 'px',
              maxWidth: viewportElement.content.maxWidth,
              marginTop: viewportElement.content.marginTop + 'px',
              marginBottom: viewportElement.content.marginBottom + 'px',
              marginLeft: viewportElement.content.marginLeft + 'px',
              marginRight: viewportElement.content.marginRight + 'px'
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
              backgroundColor: viewportElement.content.backgroundColor,
              padding: viewportElement.content.padding + 'px',
              borderRadius: viewportElement.content.borderRadius + 'px',
              border: viewportElement.content.border,
              minHeight: viewportElement.content.minHeight + 'px',
              backgroundImage: viewportElement.content.backgroundImage ? `url('${viewportElement.content.backgroundImage}')` : undefined,
              backgroundSize: viewportElement.content.backgroundSize,
              backgroundPosition: viewportElement.content.backgroundPosition,
              backgroundRepeat: viewportElement.content.backgroundRepeat
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
              width: viewportElement.content.width || '100%',
              height: viewportElement.content.height + 'px',
              backgroundColor: viewportElement.content.backgroundColor
            }}
          />
        );
      case 'html':
        return (
          <div 
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '10px',
              backgroundColor: '#f9fafb',
              overflow: 'auto'
            }}
          >
            {viewportElement.content.isEditing ? (
              <textarea
                value={viewportElement.content.html}
                onChange={(e) => {
                  if (selectedElement === element.id) {
                    updateElement(element.id, {
                      content: { ...viewportElement.content, html: e.target.value }
                    });
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  resize: 'none'
                }}
                onBlur={() => {
                  updateElement(element.id, {
                    content: { ...viewportElement.content, isEditing: false }
                  });
                }}
                autoFocus
              />
            ) : (
              <div
                style={{ cursor: 'pointer', minHeight: '50px' }}
                onClick={() => {
                  setSelectedElement(element.id);
                  updateElement(element.id, {
                    content: { ...viewportElement.content, isEditing: true }
                  });
                }}
                dangerouslySetInnerHTML={{ __html: viewportElement.content.html }}
              />
            )}
          </div>
        );
      case 'divider':
        return (
          <div 
            style={{
              width: viewportElement.content.width || '100%',
              height: viewportElement.content.height + 'px',
              backgroundColor: viewportElement.content.backgroundColor,
              borderTop: `${viewportElement.content.height}px ${viewportElement.content.style} ${viewportElement.content.backgroundColor}`,
              marginTop: viewportElement.content.marginTop + 'px',
              marginBottom: viewportElement.content.marginBottom + 'px'
            }}
          />
        );
      case 'icon':
        const getIconEmoji = (iconType: string) => {
          switch (iconType) {
            case 'star': return '⭐';
            case 'heart': return '❤️';
            case 'check': return '✅';
            case 'arrow': return '➡️';
            case 'phone': return '📞';
            case 'mail': return '✉️';
            case 'location': return '📍';
            case 'calendar': return '📅';
            default: return '⭐';
          }
        };
        
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: viewportElement.content.color,
            fontSize: viewportElement.content.size + 'px',
            backgroundColor: viewportElement.content.backgroundColor,
            padding: viewportElement.content.padding + 'px',
            borderRadius: viewportElement.content.borderRadius + 'px',
            cursor: viewportElement.style?.cursor,
            transition: viewportElement.style?.transition
          }}>
            {getIconEmoji(viewportElement.content.icon)}
          </div>
        );
      case 'progress':
        return (
          <div style={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '10px'
          }}>
            {viewportElement.content.showText && (
              <div style={{
                fontSize: '14px',
                color: viewportElement.content.textColor,
                marginBottom: '5px'
              }}>
                {viewportElement.content.text}
              </div>
            )}
            <div style={{
              width: '100%',
              height: viewportElement.content.height + 'px',
              backgroundColor: viewportElement.content.backgroundColor,
              borderRadius: viewportElement.content.borderRadius + 'px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: viewportElement.content.percentage + '%',
                height: '100%',
                backgroundColor: viewportElement.content.color,
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          </div>
        );
      case 'testimonial':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: viewportElement.content.backgroundColor,
            padding: '20px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '16px',
              color: viewportElement.content.textColor,
              marginBottom: '15px',
              fontStyle: 'italic'
            }}>
              "{viewportElement.content.text}"
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                👤
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: viewportElement.content.authorColor
                }}>
                  {viewportElement.content.author}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: viewportElement.content.roleColor
                }}>
                  {viewportElement.content.role}
                </div>
              </div>
            </div>
          </div>
        );
      case 'background':
        return (
          <div 
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: viewportElement.content.type === 'color' ? viewportElement.content.value : 'transparent',
              backgroundImage: viewportElement.content.type === 'image' && viewportElement.content.image ? `url('${viewportElement.content.image}')` : undefined,
              backgroundSize: viewportElement.content.size || 'cover',
              backgroundPosition: viewportElement.content.position || 'center',
              backgroundRepeat: viewportElement.content.repeat || 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #d1d5db',
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <Palette className="h-8 w-8 mx-auto mb-2" style={{ display: 'block' }} />
              <span>Fundo</span>
            </div>
          </div>
        );
      default:
        return <div style={{ color: '#6b7280' }}>Elemento não suportado: {viewportElement.type}</div>;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header Toolbar - Design Profissional */}
      <div className="bg-white shadow-lg border-b border-slate-200 h-16 flex items-center px-6 backdrop-blur-sm bg-white/95">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {templateData.name}
            </h1>
            <p className="text-xs text-slate-500">Editor Visual</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {/* Viewport Selector - Design Profissional */}
          <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
            {[
              { id: 'desktop', label: 'Desktop', icon: Monitor, color: 'bg-blue-500' },
              { id: 'tablet', label: 'Tablet', icon: Tablet, color: 'bg-purple-500' },
              { id: 'mobile', label: 'Mobile', icon: Smartphone, color: 'bg-green-500' }
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === id 
                    ? `${color} text-white shadow-lg transform scale-105` 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Outline/Estrutura */}
          <button
            onClick={() => setShowOutline(!showOutline)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              showOutline 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Estrutura</span>
          </button>
          
          {/* Configuração do Fundo da Página */}
          <button
            onClick={() => setSelectedElement(null)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-all duration-200"
          >
            <Palette className="h-4 w-4" />
            <span>Fundo</span>
          </button>
          
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => {
                if (historyIndex > 0) {
                  setHistoryIndex(historyIndex - 1);
                  setElements(history[historyIndex - 1]);
                  toast.success('Desfeito!');
                }
              }}
              disabled={historyIndex <= 0}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Desfazer"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (historyIndex < history.length - 1) {
                  setHistoryIndex(historyIndex + 1);
                  setElements(history[historyIndex + 1]);
                  toast.success('Refeito!');
                }
              }}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Refazer"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              showPreview 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
        {/* Outline Panel - Estrutura dos Elementos */}
        {showOutline && (
          <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Estrutura da Página</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {elements.length} elemento{elements.length !== 1 ? 's' : ''} na página
                  </p>
                </div>
                <button
                  onClick={() => setShowOutline(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {elements.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Layers className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum elemento na página</p>
                  <p className="text-sm">Adicione elementos para vê-los aqui</p>
                </div>
              ) : (
                <div className="p-2">
                  {getSortedElements().map((element, index) => {
                    const viewportElement = getElementForViewport(element);
                    const isSelected = selectedElement === element.id;
                    
                    return (
                      <div
                        key={element.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('elementId', element.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const draggedId = e.dataTransfer.getData('elementId');
                          if (draggedId && draggedId !== element.id) {
                            const draggedIndex = elements.findIndex(el => el.id === draggedId);
                            const targetIndex = elements.findIndex(el => el.id === element.id);
                            if (draggedIndex !== -1 && targetIndex !== -1) {
                              reorderElements(draggedIndex, targetIndex);
                            }
                          }
                        }}
                        onClick={() => {
                          setSelectedElement(element.id);
                          setShowOutline(false);
                        }}
                        className={`p-4 mb-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg transform scale-105' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 flex items-center space-x-2">
                            <Move className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-grab" />
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-medium ${
                              ELEMENT_CATEGORIES
                                .flatMap(cat => cat.elements)
                                .find(el => el.id === element.type)?.color || 'bg-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {getElementDisplayName(element)}
                              </span>
                              {isSelected && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {viewportElement.type.charAt(0).toUpperCase() + viewportElement.type.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {viewportElement.position.x}px, {viewportElement.position.y}px
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Left Sidebar - Design Profissional */}
        {!showOutline && (
          <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col shadow-xl">
          {/* Search */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar Widget..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Categories - Design Profissional */}
          <div className="flex-1 overflow-y-auto p-2">
            {ELEMENT_CATEGORIES.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => {
                    setActiveCategory(category.id);
                    toggleCategory(category.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${
                    activeCategory === category.id 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <category.icon className="h-5 w-5" />
                    <span>{category.name}</span>
                  </div>
                  {expandedCategories.has(category.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {expandedCategories.has(category.id) && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      {filteredElements.map((element) => (
                        <button
                          key={element.id}
                          onClick={() => addElement(element.id)}
                          draggable
                          onDragStart={handleElementDragStart(element.id)}
                          className={`aspect-square rounded-xl text-white flex flex-col items-center justify-center space-y-2 hover:opacity-90 transition-all duration-200 cursor-grab active:cursor-grabbing ${element.color} hover:scale-105 hover:shadow-lg transform hover:rotate-1`}
                          title={element.description}
                        >
                          <element.icon className="h-6 w-6" />
                          <span className="text-xs font-semibold text-center leading-tight">{element.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="flex justify-center">
              <div 
                className="relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  minHeight: '100vh',
                  backgroundColor: background.type === 'color' ? background.value : '#ffffff',
                  backgroundImage: background.type === 'image' && background.image ? `url('${background.image.startsWith('http') ? background.image : `${window.location.origin}${background.image}`}')` : undefined,
                  backgroundSize: background.type === 'image' ? 'cover' : 'auto',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
                onDrop={handleCanvasDrop}
                onDragOver={handleCanvasDragOver}
              >
                {elements.map((element, index) => {
                  const viewportElement = getElementForViewport(element);
                  const isDragged = draggedElementId === element.id;
                  const dragStyle = isDragged ? {
                    transform: `translateY(${dragOffset}px)`,
                    zIndex: 1000,
                    opacity: 0.8
                  } : {};
                  
                  // Calcular se deve mostrar indicador de drop
                  const shouldShowDropIndicator = isDragging && !isDragged && draggedElementId;
                  const draggedElement = elements.find(el => el.id === draggedElementId);
                  const draggedIndex = draggedElement ? elements.indexOf(draggedElement) : -1;
                  
                  // Mostrar indicador se o elemento atual está na posição de destino
                  const isDropTarget = shouldShowDropIndicator && (
                    (draggedIndex < index && dragOffset > 0) ||
                    (draggedIndex > index && dragOffset < 0)
                  );
                  
                  return (
                    <div key={element.id}>
                      {/* Drop Indicator */}
                      {isDropTarget && (
                        <div 
                          className="absolute left-0 right-0 h-1 bg-blue-500 rounded-full shadow-lg"
                          style={{
                            top: viewportElement.position.y - 10,
                            zIndex: 999
                          }}
                        />
                      )}
                      
                      <div
                        className={`absolute transition-all duration-200 hover:shadow-lg ${
                          selectedElement === element.id 
                            ? 'ring-4 ring-blue-500 ring-opacity-60 shadow-2xl transform scale-105' 
                            : 'hover:shadow-md'
                        } ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
                        style={{
                          left: viewportElement.position.x,
                          top: viewportElement.position.y,
                          width: viewportElement.size.width,
                          height: viewportElement.size.height,
                          zIndex: selectedElement === element.id ? 10 : 1,
                          ...dragStyle
                        }}
                        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                        onMouseMove={handleElementMouseMove}
                        onMouseUp={handleElementMouseUp}
                        onMouseLeave={() => {
                          if (isDragging && draggedElementId === element.id) {
                            resetDrag();
                          }
                        }}
                        onClick={() => {
                          if (!isDragging) {
                            setSelectedElement(element.id);
                          }
                        }}
                      >
                        {/* Drag Handle */}
                        {selectedElement === element.id && (
                          <div className="absolute -top-8 left-0 flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
                            <Move className="h-3 w-3" />
                            <span>Arrastar</span>
                          </div>
                        )}
                        
                        {renderElement(element)}
                      </div>
                    </div>
                  );
                })}

                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <div className="text-center p-8 bg-white/80 rounded-2xl shadow-lg border border-slate-200">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-lg font-semibold text-slate-700 mb-2">Comece criando sua página</p>
                      <p className="text-sm text-slate-500">Arraste elementos do painel lateral para o canvas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-l border-slate-200 flex flex-col shadow-xl">
          {selectedElementData ? (
            <>
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Propriedades</h3>
                  <p className="text-sm text-slate-600">{selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => duplicateElement(selectedElementData.id)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteElement(selectedElementData.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Toolbar de ações rápidas */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-2">
                  <button
                    onClick={() => {
                      updateElement(selectedElementData.id, {
                        position: { x: (width - selectedElementData.size.width) / 2, y: selectedElementData.position.y }
                      });
                      toast.success('Elemento centralizado!');
                    }}
                    className="p-2 text-slate-400 hover:text-green-500 hover:bg-white rounded-lg transition-all duration-200"
                    title="Centralizar"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      updateElement(selectedElementData.id, {
                        position: { x: width - selectedElementData.size.width, y: selectedElementData.position.y }
                      });
                      toast.success('Elemento alinhado à direita!');
                    }}
                    className="p-2 text-slate-400 hover:text-purple-500 hover:bg-white rounded-lg transition-all duration-200"
                    title="Alinhar à direita"
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      updateElement(selectedElementData.id, {
                        position: { x: 0, y: selectedElementData.position.y }
                      });
                      toast.success('Elemento alinhado à esquerda!');
                    }}
                    className="p-2 text-slate-400 hover:text-orange-500 hover:bg-white rounded-lg transition-all duration-200"
                    title="Alinhar à esquerda"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Dica de Drag & Drop */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <Move className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Reordenar</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Clique e arraste o elemento para reordenar na página
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {/* Controles de Responsividade */}
              <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Responsividade</h4>
                <div className="flex space-x-2">
                  {[
                    { id: 'desktop', label: 'Desktop', icon: Monitor, color: 'bg-blue-500' },
                    { id: 'tablet', label: 'Tablet', icon: Tablet, color: 'bg-purple-500' },
                    { id: 'mobile', label: 'Mobile', icon: Smartphone, color: 'bg-green-500' }
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      onClick={() => setActiveView(id as any)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        activeView === id
                          ? `${color} text-white shadow-lg transform scale-105`
                          : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Edite as propriedades para cada dispositivo individualmente
                </p>
              </div>

              {/* Propriedades de Posição e Tamanho */}
              <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">
                  Posição e Tamanho - {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h4>
                {(() => {
                  const viewportData = getElementDataForCurrentViewport(selectedElementData);
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">X</label>
                        <input
                          type="number"
                          value={viewportData.position.x}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            position: { ...viewportData.position, x: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Y</label>
                        <input
                          type="number"
                          value={viewportData.position.y}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            position: { ...viewportData.position, y: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Largura</label>
                        <input
                          type="number"
                          value={viewportData.size.width}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            size: { ...viewportData.size, width: parseInt(e.target.value) || 100 }
                          })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Altura</label>
                        <input
                          type="number"
                          value={viewportData.size.height}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            size: { ...viewportData.size, height: parseInt(e.target.value) || 100 }
                          })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Propriedades do Botão */}
              {selectedElementData.type === 'button' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão</label>
                    <input
                      type="text"
                      value={getElementDataForCurrentViewport(selectedElementData).content.text}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Texto do botão"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Borda Arredondada</label>
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
                    <div className="text-sm text-gray-600">
                      {selectedElementData.content.borderRadius}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                    <input
                      type="text"
                      value={selectedElementData.content.padding}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, padding: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="12px 24px"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                    <input
                      type="url"
                      value={selectedElementData.content.link}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, link: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo (Hover)</label>
                    <input
                      type="color"
                      value={selectedElementData.content.hoverBackgroundColor}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, hoverBackgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades do Título */}
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
                      placeholder="Digite o título"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nível do Título</label>
                    <select
                      value={selectedElementData.content.level}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, level: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    <div className="text-sm text-gray-600">
                      {selectedElementData.content.fontSize}px
                    </div>
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
                      <option value="lighter">Mais leve</option>
                      <option value="bolder">Mais escuro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <div className="flex space-x-2">
                      {[
                        { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                        { value: 'center', icon: AlignCenter, label: 'Centro' },
                        { value: 'right', icon: AlignRight, label: 'Direita' },
                        { value: 'justify', icon: AlignJustify, label: 'Justificar' }
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, textAlign: value }
                          })}
                          className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg border transition-colors ${
                            selectedElementData.content.textAlign === value
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-red-500'
                          }`}
                          title={label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades do Texto */}
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
                      placeholder="Digite o texto"
                    />
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
                    <div className="text-sm text-gray-600">
                      {selectedElementData.content.fontSize}px
                    </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alinhamento</label>
                    <div className="flex space-x-2">
                      {[
                        { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                        { value: 'center', icon: AlignCenter, label: 'Centro' },
                        { value: 'right', icon: AlignRight, label: 'Direita' },
                        { value: 'justify', icon: AlignJustify, label: 'Justificar' }
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, textAlign: value }
                          })}
                          className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg border transition-colors ${
                            selectedElementData.content.textAlign === value
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-red-500'
                          }`}
                          title={label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades da Imagem */}
              {selectedElementData.type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={selectedElementData.content.src}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          content: { ...selectedElementData.content, src: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="https://..."
                      />
                      <button
                        onClick={() => setShowUpload(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Fazer Upload</span>
                      </button>
                    </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Borda Arredondada</label>
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
                    <div className="text-sm text-gray-600">
                      {selectedElementData.content.borderRadius}px
                    </div>
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

              {/* Propriedades do HTML */}
              {selectedElementData.type === 'html' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código HTML</label>
                    <textarea
                      value={getElementDataForCurrentViewport(selectedElementData).content.html}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, html: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={8}
                      placeholder="Digite o código HTML..."
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>💡 Dica: Use CSS inline para estilização ou adicione classes CSS personalizadas.</p>
                  </div>
                </div>
              )}

              {/* Propriedades do Divisor */}
              {selectedElementData.type === 'divider' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura da Linha</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={getElementDataForCurrentViewport(selectedElementData).content.height}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, height: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.height}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Linha</label>
                    <input
                      type="color"
                      value={getElementDataForCurrentViewport(selectedElementData).content.backgroundColor}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estilo da Linha</label>
                    <select
                      value={getElementDataForCurrentViewport(selectedElementData).content.style}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, style: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="solid">Sólida</option>
                      <option value="dashed">Tracejada</option>
                      <option value="dotted">Pontilhada</option>
                      <option value="double">Dupla</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Margem Superior</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={getElementDataForCurrentViewport(selectedElementData).content.marginTop}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, marginTop: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.marginTop}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Margem Inferior</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={getElementDataForCurrentViewport(selectedElementData).content.marginBottom}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, marginBottom: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.marginBottom}px
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades do Espaçador */}
              {selectedElementData.type === 'spacer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura do Espaço</label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={getElementDataForCurrentViewport(selectedElementData).content.height}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, height: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.height}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo (Opcional)</label>
                    <input
                      type="color"
                      value={getElementDataForCurrentViewport(selectedElementData).content.backgroundColor}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Deixe transparente para um espaçador invisível
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades do Ícone */}
              {selectedElementData.type === 'icon' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                    <select
                      value={getElementDataForCurrentViewport(selectedElementData).content.icon}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, icon: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="star">⭐ Estrela</option>
                      <option value="heart">❤️ Coração</option>
                      <option value="check">✅ Check</option>
                      <option value="arrow">➡️ Seta</option>
                      <option value="phone">📞 Telefone</option>
                      <option value="mail">✉️ Email</option>
                      <option value="location">📍 Localização</option>
                      <option value="calendar">📅 Calendário</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho do Ícone</label>
                    <input
                      type="range"
                      min="16"
                      max="64"
                      value={getElementDataForCurrentViewport(selectedElementData).content.size}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, size: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.size}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Ícone</label>
                    <input
                      type="color"
                      value={getElementDataForCurrentViewport(selectedElementData).content.color}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, color: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                    <input
                      type="color"
                      value={getElementDataForCurrentViewport(selectedElementData).content.backgroundColor}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, backgroundColor: e.target.value }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={getElementDataForCurrentViewport(selectedElementData).content.padding}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, padding: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.padding}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Borda Arredondada</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={getElementDataForCurrentViewport(selectedElementData).content.borderRadius}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, borderRadius: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      {getElementDataForCurrentViewport(selectedElementData).content.borderRadius}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link (Opcional)</label>
                    <input
                      type="url"
                      value={getElementDataForCurrentViewport(selectedElementData).content.link}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...getElementDataForCurrentViewport(selectedElementData).content, link: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* Propriedades do Fundo */}
              {selectedElementData.type === 'background' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Fundo</label>
                    <select
                      value={selectedElementData.content.type}
                      onChange={(e) => updateElement(selectedElementData.id, {
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
                        onChange={(e) => updateElement(selectedElementData.id, {
                          content: { ...selectedElementData.content, value: e.target.value }
                        })}
                        className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        Cor atual: {selectedElementData.content.value}
                      </div>
                    </div>
                  )}
                  
                  {selectedElementData.content.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo</label>
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={selectedElementData.content.image || ''}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            content: { ...selectedElementData.content, image: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => setShowUpload(true)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Fazer Upload</span>
                        </button>
                      </div>
                      {selectedElementData.content.image && (
                        <div className="mt-2">
                          <img 
                            src={selectedElementData.content.image} 
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
                </div>
              )}
              </div>
            </>
          ) : (
            /* Painel de Configuração do Fundo da Página */
            <div>
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Fundo da Página</h3>
                    <p className="text-sm text-slate-600">Configure o fundo global da página</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setBackground({ type: 'color', value: '#ffffff', image: '' });
                        toast.success('Fundo resetado!');
                      }}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Resetar"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Tipo de Fundo</label>
                    <select
                      value={background.type}
                      onChange={(e) => setBackground({ ...background, type: e.target.value as 'color' | 'image' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                    >
                      <option value="color">Cor Sólida</option>
                      <option value="image">Imagem</option>
                    </select>
                  </div>
                  
                  {background.type === 'color' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Cor de Fundo</label>
                      <input
                        type="color"
                        value={background.value}
                        onChange={(e) => setBackground({ ...background, value: e.target.value })}
                        className="w-full h-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                      />
                      <div className="mt-3 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                        <strong>Cor atual:</strong> {background.value}
                      </div>
                    </div>
                  )}
                  
                  {background.type === 'image' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Imagem de Fundo</label>
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={background.image}
                          onChange={(e) => setBackground({ ...background, image: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => setShowUpload(true)}
                          className="w-full flex items-center justify-center space-x-3 px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-slate-600 hover:text-blue-600"
                        >
                          <Upload className="h-5 w-5" />
                          <span className="font-medium">Fazer Upload</span>
                        </button>
                      </div>
                      {background.image && (
                        <div className="mt-4">
                          <img 
                            src={background.image.startsWith('http') ? background.image : `${window.location.origin}${background.image}`}
                            alt="Preview do fundo" 
                            className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
                            onError={(e) => {
                              console.error('❌ Image load error:', e);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('✅ Image loaded successfully');
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Preview - {templateData.name}</h3>
                <p className="text-sm text-slate-600">Visualização em tempo real</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Viewport Selector no Preview */}
                <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
                  {[
                    { id: 'desktop', label: 'Desktop', icon: Monitor, color: 'bg-blue-500' },
                    { id: 'tablet', label: 'Tablet', icon: Tablet, color: 'bg-purple-500' },
                    { id: 'mobile', label: 'Mobile', icon: Smartphone, color: 'bg-green-500' }
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      onClick={() => setActiveView(id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeView === id 
                          ? `${color} text-white shadow-lg transform scale-105` 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="flex justify-center">
                <div 
                  className="relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    minHeight: '100vh',
                    backgroundColor: background.type === 'color' ? background.value : '#ffffff',
                    backgroundImage: background.type === 'image' ? `url('${background.image}')` : undefined,
                    backgroundSize: background.type === 'image' ? 'cover' : 'auto',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {elements.map((element) => {
                    const viewportElement = getElementForViewport(element);
                    return (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: viewportElement.position.x,
                          top: viewportElement.position.y,
                          width: viewportElement.size.width,
                          height: viewportElement.size.height,
                          zIndex: 1
                        }}
                      >
                        {renderElement(element)}
                      </div>
                    );
                  })}

                  {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Plus className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">Nenhum elemento na página</p>
                        <p className="text-sm">Adicione elementos para visualizar o preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-md border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Fazer Upload</h3>
                <p className="text-sm text-slate-600">Envie imagens ou vídeos</p>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 text-slate-600 hover:text-blue-600 group"
              >
                {uploadingFile ? (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="font-medium">{uploadingFile ? 'Enviando...' : 'Selecionar Arquivo'}</span>
              </button>
              
              <div className="bg-slate-100 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-600 font-medium">
                  Formatos suportados: JPG, PNG, GIF, WebP, MP4, WebM
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tamanho máximo: 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}