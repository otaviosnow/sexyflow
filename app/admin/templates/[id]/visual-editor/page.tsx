'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Save, 
  Eye, 
  Undo, 
  Redo, 
  Settings, 
  Type, 
  Image, 
  Video, 
  Square, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Palette,
  Move,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Facebook,
  Minus,
  Upload,
  List,
  X
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

// Tipos
interface Element {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: { alignment: string };
  spacing: { top: number; bottom: number; left: number; right: number };
  responsive: {
    desktop: { position: { x: number; y: number }; size: { width: number; height: number }; content: any };
    tablet: { position: { x: number; y: number }; size: { width: number; height: number }; content: any };
    mobile: { position: { x: number; y: number }; size: { width: number; height: number }; content: any };
  };
}

interface TemplateData {
  _id: string;
  name: string;
  content: Element[];
  createdAt: string;
  updatedAt: string;
  type?: string;
  description?: string;
  previewImage?: string;
  isActive?: boolean;
}

export default function VisualEditor({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const templateId = params.id;
  
  // Estados
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [background, setBackground] = useState({ type: 'color', value: '#ffffff', opacity: 1, image: '' });
  const [showStructure, setShowStructure] = useState(false);
  const [showStructurePanel, setShowStructurePanel] = useState(false);
  const [showElementsLibrary, setShowElementsLibrary] = useState(true);
  const hasLoadedRef = useRef(false);

  // Detectar mudanças no background para marcar como não salvo
  useEffect(() => {
    if (hasLoadedRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [background]);

  // Minimizar biblioteca de elementos quando um elemento for selecionado
  useEffect(() => {
    if (selectedElement) {
      setShowElementsLibrary(false);
    } else {
      // Quando não há elemento selecionado, expandir a biblioteca
      setShowElementsLibrary(true);
    }
  }, [selectedElement]);

  // Função para converter hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };

  // Verificação de autenticação
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Carregar template
  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (session?.user?.id && params.id) {
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isLocalDev) {
        // Primeiro, tentar carregar do localStorage
        const savedData = localStorage.getItem(`template_${params.id}`);
        if (savedData) {
          try {
            console.log('📂 Dados encontrados no localStorage:', savedData);
            const templateData = JSON.parse(savedData);
            console.log('📋 Template parseado:', templateData);
            console.log('📝 Nome do template:', templateData.name);
            
            const finalTemplate = {
              _id: params.id,
              name: templateData.name || 'Template sem nome',
              content: templateData.content || [],
              createdAt: templateData.createdAt || new Date().toISOString(),
              updatedAt: templateData.updatedAt || new Date().toISOString()
            };
            
            console.log('🎯 Template final para estado:', finalTemplate);
            setTemplateData(finalTemplate);
            setElements(templateData.content || []);
            if (templateData.background) {
              setBackground(templateData.background);
              console.log('🎨 Background carregado:', templateData.background);
            }
            console.log('✅ Template carregado do localStorage com sucesso');
          } catch (error) {
            console.error('❌ Erro ao carregar template do localStorage:', error);
          }
        } else {
          console.log('📭 Nenhum dado encontrado no localStorage');
          // Se não há dados salvos, carregar template mock da API
          fetch(`/api/admin/templates/${params.id}`)
            .then(res => res.json())
            .then(data => {
              if (data._id) {
                setTemplateData({
                  _id: data._id,
                  name: data.name || 'Template sem nome',
                  content: data.content?.elements || [],
                  createdAt: data.createdAt || new Date().toISOString(),
                  updatedAt: data.updatedAt || new Date().toISOString()
                });
                setElements(data.content?.elements || []);
                console.log('Template carregado da API:', data);
              }
            })
            .catch(error => console.error('Erro ao carregar template da API:', error));
        }
      } else {
        fetch(`/api/admin/templates/${params.id}`)
          .then(res => res.json())
          .then(data => {
            if (data._id) {
              setTemplateData({
                _id: data._id,
                name: data.name || 'Template sem nome',
                content: data.content?.elements || [],
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              });
              setElements(data.content?.elements || []);
            }
          })
          .catch(error => console.error('Erro ao carregar template:', error));
      }
      
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, [session, params.id]);

  // Salvar template
  const saveTemplate = async () => {
    console.log('💾 Iniciando salvamento do template');
    console.log('📋 Template data atual:', templateData);
    
    if (!templateData) {
      console.log('❌ Nenhum template data encontrado');
      return;
    }

    const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    console.log('🌐 Modo local:', isLocalDev);
    
    if (isLocalDev) {
      const templateToSave = {
        ...templateData,
        content: elements,
        background: background,
        updatedAt: new Date().toISOString()
      };
      
      console.log('🔄 Template para salvar:', templateToSave);
      console.log('📝 Nome do template:', templateToSave.name);
      
      const key = `template_${params.id}`;
      console.log('🔑 Chave do localStorage:', key);
      
      localStorage.setItem(key, JSON.stringify(templateToSave));
      console.log('💾 Template salvo no localStorage');
      
      // Verificar se foi salvo corretamente
      const savedData = localStorage.getItem(key);
      console.log('🔍 Dados salvos verificados:', savedData);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('📋 Nome salvo verificado:', parsedData.name);
      }
      
      // Atualizar o estado local com os dados salvos
      setTemplateData(templateToSave);
      console.log('✅ Estado local atualizado');
      
      toast.success('Template salvo localmente!');
    } else {
      try {
        const response = await fetch(`/api/admin/templates/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: templateData.name,
            content: elements,
            background: background,
            type: templateData.type || 'presell',
            description: templateData.description || '',
            previewImage: templateData.previewImage || '',
            isActive: templateData.isActive !== undefined ? templateData.isActive : true
          })
        });
        
        if (response.ok) {
          const updatedTemplate = await response.json();
          setTemplateData(updatedTemplate);
          toast.success('Template salvo!');
        } else {
          toast.error('Erro ao salvar template');
        }
      } catch (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar template');
      }
    }
    
    setHasUnsavedChanges(false);
  };

  // Funções de elementos
  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'title': return { text: 'Título', fontSize: 30, fontFamily: 'Arial', fontWeight: 'bold', color: '#000000', alignment: 'center' };
      case 'text': return { text: 'Texto', fontSize: 16, fontFamily: 'Arial', fontWeight: 'normal', color: '#000000', alignment: 'left' };
      case 'button': return { text: 'Botão', fontSize: 16, fontFamily: 'Arial', fontWeight: 'normal', color: '#ffffff', backgroundColor: '#3b82f6', alignment: 'center', paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24 };
      case 'image': return { src: '', alt: 'Imagem', width: 300, height: 200 };
      case 'video': return { src: '', width: 300, height: 200 };
      case 'spacer': return { height: 50, backgroundColor: '#f3f4f6', borderColor: '#d1d5db' };
      case 'container': return { backgroundColor: '#ffffff', padding: 20 };
      case 'html': return { html: '<p>HTML personalizado</p>' };
      case 'fbpixel': return { pixelId: '', purchaseValue: '' };
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
      case 'html': return { width: 300, height: 100 };
      case 'fbpixel': return { width: 300, height: 50 };
      default: return { width: 300, height: 100 };
    }
  };

  const getCenteredPosition = (width: number) => {
    const containerWidth = 800;
    return (containerWidth - width) / 2;
  };

  const addElement = (type: string, x?: number, y?: number) => {
    const defaultSize = getDefaultSize(type);
    const centeredX = getCenteredPosition(defaultSize.width);

    const newElement: Element = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      content: {
        ...getDefaultContent(type),
        ...(type === 'image' || type === 'video' ? { size: 'medium' } : {})
      },
      position: { x: centeredX, y: 50 },
      size: defaultSize,
      style: { alignment: 'center' },
      spacing: { 
        top: 0, 
        bottom: 20, 
        left: 0, 
        right: 0 
      },
      responsive: {
        desktop: { position: { x: centeredX, y: 50 }, size: defaultSize, content: getDefaultContent(type) },
        tablet: { position: { x: centeredX, y: 50 }, size: defaultSize, content: getDefaultContent(type) },
        mobile: { position: { x: centeredX, y: 50 }, size: defaultSize, content: getDefaultContent(type) }
      }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setHasUnsavedChanges(true);
    toast.success('Elemento adicionado!');
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    setHasUnsavedChanges(true);
    toast.success('Elemento removido!');
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const duplicatedElement = {
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: { ...element.position, y: element.position.y + 50 }
      };
      setElements([...elements, duplicatedElement]);
      setSelectedElement(duplicatedElement.id);
      setHasUnsavedChanges(true);
      toast.success('Elemento duplicado!');
    }
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    setHasUnsavedChanges(true);
  };

  // Função para sincronizar mudanças entre viewports
  const syncElementAcrossViewports = (id: string, property: string, value: any) => {
    setElements(elements.map(el => {
      if (el.id === id) {
        const updatedElement = { ...el };
        
        // Sincronizar propriedades específicas entre todos os viewports
        if (property === 'content') {
          // Atualizar o conteúdo principal do elemento
          updatedElement.content = { ...updatedElement.content, ...value };
          
          // Sincronizar com todos os viewports
          updatedElement.responsive = {
            desktop: { 
              ...updatedElement.responsive.desktop, 
              content: { ...updatedElement.responsive.desktop.content, ...value } 
            },
            tablet: { 
              ...updatedElement.responsive.tablet, 
              content: { ...updatedElement.responsive.tablet.content, ...value } 
            },
            mobile: { 
              ...updatedElement.responsive.mobile, 
              content: { ...updatedElement.responsive.mobile.content, ...value } 
            }
          };
        } else if (property === 'spacing') {
          updatedElement.spacing = { ...updatedElement.spacing, ...value };
        }
        
        return updatedElement;
      }
      return el;
    }));
    setHasUnsavedChanges(true);
  };

  // Drag & Drop
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedElementId(elementId);
    setDragStartY(e.clientY);
    setDragOffset(0);
  };

  const handleElementMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedElementId) {
      const deltaY = e.clientY - dragStartY;
      setDragOffset(deltaY);
    }
  };

  const handleElementMouseUp = (e: React.MouseEvent) => {
    if (isDragging && draggedElementId) {
      // Encontrar o elemento mais próximo baseado na posição Y
      const draggedElement = elements.find(el => el.id === draggedElementId);
      if (!draggedElement) return;
      
      const currentIndex = elements.findIndex(el => el.id === draggedElementId);
      const mouseY = e.clientY;
      
      // Encontrar o índice de destino baseado na posição do mouse
      let targetIndex = currentIndex;
      
      for (let i = 0; i < elements.length; i++) {
        if (i === currentIndex) continue;
        
        const element = elements[i];
        const elementRect = document.querySelector(`[data-element-id="${element.id}"]`)?.getBoundingClientRect();
        
        if (elementRect) {
          const elementCenterY = elementRect.top + elementRect.height / 2;
          
          if (mouseY < elementCenterY && i < currentIndex) {
            targetIndex = i;
            break;
          } else if (mouseY > elementCenterY && i > currentIndex) {
            targetIndex = i + 1;
          }
        }
      }
      
      if (targetIndex !== currentIndex) {
        reorderElement(draggedElementId, targetIndex);
      }
      
      setIsDragging(false);
      setDraggedElementId(null);
      setDragOffset(0);
    }
  };

  // Função para reordenar elementos
  const reorderElement = (elementId: string, newIndex: number) => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;
    
    const clampedIndex = Math.max(0, Math.min(elements.length - 1, newIndex));
    if (clampedIndex === currentIndex) return;
    
    const newElements = [...elements];
    const [movedElement] = newElements.splice(currentIndex, 1);
    newElements.splice(clampedIndex, 0, movedElement);
    
    setElements(newElements);
    setHasUnsavedChanges(true);
    toast.success('Elemento reordenado!');
  };

  // Event listeners globais para drag
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

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
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

  // Renderizar elemento
  const renderElement = (element: Element) => {
    const viewportElement = element.responsive[viewport];
    
    switch (element.type) {
      case 'title':
        return (
          <div
            style={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                            element.style?.alignment === 'right' ? 'flex-end' : 'center',
              padding: '10px 0'
            }}
          >
            <h1
              style={{
                fontSize: `${viewportElement.content?.fontSize || 30}px`,
                fontFamily: viewportElement.content?.fontFamily || 'Arial',
                fontWeight: viewportElement.content?.fontWeight || 'bold',
                color: viewportElement.content?.color || '#000000',
                textAlign: viewportElement.content?.alignment || 'center',
                margin: 0,
                lineHeight: 1.2,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-line'
              }}
            >
              {viewportElement.content?.text || 'Título'}
            </h1>
          </div>
        );

      case 'text':
        return (
          <div
            style={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                            element.style?.alignment === 'right' ? 'flex-end' : 'center',
              padding: '10px 0'
            }}
          >
            <p
              style={{
                fontSize: `${viewportElement.content?.fontSize || 16}px`,
                fontFamily: viewportElement.content?.fontFamily || 'Arial',
                fontWeight: viewportElement.content?.fontWeight || 'normal',
                color: viewportElement.content?.color || '#000000',
                textAlign: viewportElement.content?.alignment || 'left',
                margin: 0,
                lineHeight: 1.5,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {viewportElement.content?.text || 'Texto'}
            </p>
          </div>
        );

      case 'button':
        return (
          <div
            style={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                            element.style?.alignment === 'right' ? 'flex-end' : 'center',
              padding: '10px 0'
            }}
          >
            {viewportElement.content?.link ? (
              <a
                href={viewportElement.content.link}
                target={viewportElement.content?.openNewTab ? '_blank' : '_self'}
                rel={viewportElement.content?.openNewTab ? 'noopener noreferrer' : ''}
                style={{
                  fontSize: `${viewportElement.content?.fontSize || 16}px`,
                  fontFamily: viewportElement.content?.fontFamily || 'Arial',
                  fontWeight: viewportElement.content?.fontWeight || 'normal',
                  color: viewportElement.content?.color || '#ffffff',
                  backgroundColor: viewportElement.content?.backgroundColor || '#3b82f6',
                  padding: `${viewportElement.content?.paddingTop || 12}px ${viewportElement.content?.paddingRight || 24}px ${viewportElement.content?.paddingBottom || 12}px ${viewportElement.content?.paddingLeft || 24}px`,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '120px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                {viewportElement.content?.text || 'Botão'}
              </a>
            ) : (
              <button
                style={{
                  fontSize: `${viewportElement.content?.fontSize || 16}px`,
                  fontFamily: viewportElement.content?.fontFamily || 'Arial',
                  fontWeight: viewportElement.content?.fontWeight || 'normal',
                  color: viewportElement.content?.color || '#ffffff',
                  backgroundColor: viewportElement.content?.backgroundColor || '#3b82f6',
                  padding: `${viewportElement.content?.paddingTop || 12}px ${viewportElement.content?.paddingRight || 24}px ${viewportElement.content?.paddingBottom || 12}px ${viewportElement.content?.paddingLeft || 24}px`,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '120px'
                }}
              >
                {viewportElement.content?.text || 'Botão'}
              </button>
            )}
          </div>
        );

      case 'image':
        return (
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                          element.style?.alignment === 'right' ? 'flex-end' : 'center'
          }}>
            {viewportElement.content.src ? (
              <img
                src={viewportElement.content.src}
                alt={viewportElement.content.alt}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: `${viewportElement.content?.maxHeight || 400}px`,
                  objectFit: viewportElement.content?.objectFit || 'contain',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '200px',
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
        return (
          <div style={{
            width: '100%',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                          element.style?.alignment === 'right' ? 'flex-end' : 'center'
          }}>
            {viewportElement.content.src ? (
              <video
                src={viewportElement.content.src}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
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

      case 'spacer':
        const isSelected = selectedElement === element.id;
        const spacerHeight = viewportElement.content?.height || 50;
        const spacerBgColor = viewportElement.content?.backgroundColor || '#f3f4f6';
        const spacerBorderColor = viewportElement.content?.borderColor || '#d1d5db';
        
        return (
          <div
            style={{
              width: '100%',
              height: `${spacerHeight}px`,
              backgroundColor: spacerBgColor,
              border: isSelected ? '4px solid rgba(59, 130, 246, 0.8)' : `1px solid ${spacerBorderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxSizing: 'border-box',
              opacity: 0.8
            }}
          >
            <span style={{ 
              color: '#6b7280', 
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Espaçador ({spacerHeight}px)
            </span>
          </div>
        );

      case 'container':
        return (
          <div
            style={{
              width: '100%',
              height: '200px',
              backgroundColor: viewportElement.content.backgroundColor,
              padding: viewportElement.content.padding,
              borderRadius: '8px',
              border: '1px dashed #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                            element.style?.alignment === 'right' ? 'flex-end' : 'center'
            }}
          >
            Container
          </div>
        );

      case 'html':
        return (
          <div
            style={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style?.alignment === 'left' ? 'flex-start' : 
                            element.style?.alignment === 'right' ? 'flex-end' : 'center',
              padding: '10px 0'
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: viewportElement.content.html }}
              style={{ 
                width: '100%', 
                height: 'auto',
                color: '#1f2937',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              className="html-content"
            />
          </div>
        );

      case 'fbpixel':
        return (
          <div
            style={{
              width: '100%',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #d1d5db',
              borderRadius: 8,
              background: '#fff',
              color: '#111827',
              fontSize: 14,
              padding: 12
            }}
            title="Elemento restrito: apenas admin adiciona; usuário informa o Pixel"
          >
            {viewportElement.content?.pixelId ? (
              <span>Facebook Pixel configurado: {viewportElement.content.pixelId}</span>
            ) : (
              <span>Coloque seu Pixel (ID)</span>
            )}
          </div>
        );
      
      default:
        return <div>Elemento não suportado</div>;
    }
  };

  // Função para obter estilo de padding
  const getPaddingStyle = (content: any) => {
    return {
      paddingTop: content.paddingTop || 0,
      paddingRight: content.paddingRight || 0,
      paddingBottom: content.paddingBottom || 0,
      paddingLeft: content.paddingLeft || 0
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-white text-xl font-bold">
              {templateData?.name || 'Editor Visual'}
            </h1>
            <button
              onClick={() => {
                console.log('🔧 Iniciando edição do nome do template');
                console.log('📝 Nome atual:', templateData?.name);
                
                const newName = prompt('Digite o nome do template:', templateData?.name || '');
                console.log('✏️ Novo nome inserido:', newName);
                
                if (newName && newName.trim() !== '') {
                  console.log('✅ Nome válido, processando...');
                  
                  const updatedTemplate = {
                    ...templateData,
                    name: newName.trim(),
                    updatedAt: new Date().toISOString()
                  } as TemplateData;
                  
                  console.log('🔄 Template atualizado:', updatedTemplate);
                  
                  setTemplateData(updatedTemplate);
                  setHasUnsavedChanges(true);
                  
                  console.log('💾 Estado local atualizado');
                  
                  // Salvar imediatamente no localStorage em modo local
                  const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
                  console.log('🌐 Modo local:', isLocalDev);
                  
                  if (isLocalDev) {
                    const key = `template_${params.id}`;
                    console.log('🔑 Chave do localStorage:', key);
                    
                    localStorage.setItem(key, JSON.stringify(updatedTemplate));
                    console.log('💾 Dados salvos no localStorage');
                    
                    // Verificar se foi salvo corretamente
                    const savedData = localStorage.getItem(key);
                    console.log('🔍 Dados recuperados do localStorage:', savedData);
                    
                    if (savedData) {
                      const parsedData = JSON.parse(savedData);
                      console.log('📋 Nome salvo:', parsedData.name);
                    }
                  }
                } else {
                  console.log('❌ Nome inválido ou cancelado');
                }
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded transition-colors"
              title="Editar nome do template"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowStructurePanel(!showStructurePanel)}
              className={`p-1 rounded transition-colors ${
                showStructurePanel 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Estrutura da Página"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={saveTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
          
          <button
            onClick={() => window.open(`/admin/templates/${params.id}/preview`, '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1">

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto" data-sidebar>
          {/* Viewport Controls */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">Dispositivo</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-white font-medium capitalize">{viewport}</span>
                <span className="text-gray-400">{elements.length} elementos</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  viewport === 'desktop' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded-lg transition-colors ${
                  viewport === 'tablet' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  viewport === 'mobile' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Background Settings */}
          <div className="mb-6">
            <h3 className="text-white text-sm font-semibold mb-3">Fundo</h3>
            <div className="space-y-3">
              {/* Background Type Selector */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setBackground({ ...background, type: 'color' })}
                  className={`px-3 py-1 rounded text-xs ${
                    background.type === 'color' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Cor
                </button>
                <button
                  onClick={() => setBackground({ ...background, type: 'image' })}
                  className={`px-3 py-1 rounded text-xs ${
                    background.type === 'image' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Imagem
                </button>
              </div>

              {/* Color Background */}
              {background.type === 'color' && (
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">Cor de fundo:</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={background.value}
                      onChange={(e) => setBackground({ ...background, value: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={background.value}
                      onChange={(e) => setBackground({ ...background, value: e.target.value })}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-300 text-xs">Opacidade:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={background.opacity}
                      onChange={(e) => setBackground({ ...background, opacity: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-gray-300 text-xs w-8">
                      {Math.round(background.opacity * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Image Background */}
              {background.type === 'image' && (
                <div className="space-y-2">
                  <label className="text-gray-300 text-xs">Imagem de fundo:</label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={background.image}
                      onChange={(e) => setBackground({ ...background, image: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      placeholder="URL da imagem"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-300 text-xs">Opacidade:</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={background.opacity}
                        onChange={(e) => setBackground({ ...background, opacity: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-gray-300 text-xs w-8">
                        {Math.round(background.opacity * 100)}%
                      </span>
                    </div>
                    {background.image && (
                      <div className="mt-2">
                        <img
                          src={background.image}
                          alt="Preview"
                          className="w-full h-20 object-cover rounded border border-gray-600"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Element Library */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">Elementos</h3>
              <button
                onClick={() => setShowElementsLibrary(!showElementsLibrary)}
                className="text-gray-400 hover:text-white transition-colors"
                title={showElementsLibrary ? "Minimizar" : "Expandir"}
              >
                {showElementsLibrary ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {showElementsLibrary && (
              <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement('title')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Type className="w-4 h-4" />
                <span className="text-xs">Título</span>
              </button>
              
              <button
                onClick={() => addElement('text')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Type className="w-4 h-4" />
                <span className="text-xs">Texto</span>
              </button>
              
              <button
                onClick={() => addElement('button')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Square className="w-4 h-4" />
                <span className="text-xs">Botão</span>
              </button>
              
              <button
                onClick={() => addElement('image')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Image className="w-4 h-4" />
                <span className="text-xs">Imagem</span>
              </button>
              
              <button
                onClick={() => addElement('video')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Video className="w-4 h-4" />
                <span className="text-xs">Vídeo</span>
              </button>
              
              <button
                onClick={() => addElement('spacer')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Square className="w-4 h-4" />
                <span className="text-xs">Espaçador</span>
              </button>
              
              <button
                onClick={() => addElement('container')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Square className="w-4 h-4" />
                <span className="text-xs">Container</span>
              </button>
              
              <button
                onClick={() => addElement('html')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
              >
                <Code className="w-4 h-4" />
                <span className="text-xs">HTML</span>
              </button>
              
              {session?.user?.role === 'ADMIN' && (
                <button
                  onClick={() => addElement('fbpixel')}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors flex flex-col items-center space-y-1"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="text-xs">Pixel</span>
                </button>
              )}
              </div>
            )}
          </div>

          {/* Element Properties */}
          {selectedElement && (
            <div className="bg-gray-700 rounded-lg p-4" data-properties-panel>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold">Propriedades</h3>
                <button
                  onClick={() => setShowElementsLibrary(true)}
                  className="text-gray-400 hover:text-white text-xs transition-colors"
                  title="Mostrar biblioteca de elementos"
                >
                  + Elementos
                </button>
              </div>
              
              {(() => {
                const element = elements.find(el => el.id === selectedElement);
                if (!element) return null;

                return (
                  <div className="space-y-4">
                    {/* Spacing Controls */}
                    <div>
                      <h4 className="text-white text-xs font-semibold mb-2">ESPAÇAMENTO</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-gray-300 text-xs">Superior</label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { top: Math.max(0, element.spacing.top - 10) })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={element.spacing.top}
                              onChange={(e) => syncElementAcrossViewports(selectedElement, 'spacing', { top: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-600 text-white text-xs p-1 rounded border-0"
                            />
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { top: element.spacing.top + 10 })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Inferior</label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { bottom: Math.max(0, element.spacing.bottom - 10) })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={element.spacing.bottom}
                              onChange={(e) => syncElementAcrossViewports(selectedElement, 'spacing', { bottom: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-600 text-white text-xs p-1 rounded border-0"
                            />
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { bottom: element.spacing.bottom + 10 })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Esquerda</label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { left: Math.max(0, element.spacing.left - 10) })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={element.spacing.left}
                              onChange={(e) => syncElementAcrossViewports(selectedElement, 'spacing', { left: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-600 text-white text-xs p-1 rounded border-0"
                            />
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { left: element.spacing.left + 10 })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Direita</label>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { right: Math.max(0, element.spacing.right - 10) })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={element.spacing.right}
                              onChange={(e) => syncElementAcrossViewports(selectedElement, 'spacing', { right: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-600 text-white text-xs p-1 rounded border-0"
                            />
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'spacing', { right: element.spacing.right + 10 })}
                              className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Controls based on element type */}
                    {element.type === 'title' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">Texto</label>
                          <textarea
                            value={element.responsive[viewport].content?.text || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { text: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0 resize-none"
                            rows={3}
                            placeholder="Digite o título (use Enter para quebra de linha)"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Tamanho da Fonte</label>
                          <input
                            type="number"
                            value={element.responsive[viewport].content?.fontSize || 30}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { fontSize: parseInt(e.target.value) || 30 })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Alinhamento</label>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'left' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'left' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'center' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'center' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'right' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'right' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {element.type === 'text' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">Texto</label>
                          <textarea
                            value={element.responsive[viewport].content?.text || ''}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, text: e.target.value }
                                }
                              }
                            })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0 h-20"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Tamanho da Fonte</label>
                          <input
                            type="number"
                            value={element.responsive[viewport].content?.fontSize || 16}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, fontSize: parseInt(e.target.value) || 16 }
                                }
                              }
                            })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Alinhamento</label>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'left' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'left' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'center' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'center' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'right' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'right' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateElement(selectedElement, {
                                responsive: {
                                  ...element.responsive,
                                  [viewport]: {
                                    ...element.responsive[viewport],
                                    content: { ...element.responsive[viewport].content, alignment: 'justify' }
                                  }
                                }
                              })}
                              className={`p-2 rounded ${element.responsive[viewport].content?.alignment === 'justify' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              <AlignJustify className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {element.type === 'button' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">Texto</label>
                          <input
                            type="text"
                            value={element.responsive[viewport].content?.text || ''}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, text: e.target.value }
                                }
                              }
                            })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Cor de Fundo</label>
                          <input
                            type="color"
                            value={element.responsive[viewport].content?.backgroundColor || '#3b82f6'}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, backgroundColor: e.target.value }
                                }
                              }
                            })}
                            className="w-full h-10 rounded border-0"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Cor do Texto</label>
                          <input
                            type="color"
                            value={element.responsive[viewport].content?.color || '#ffffff'}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, color: e.target.value }
                                }
                              }
                            })}
                            className="w-full h-10 rounded border-0"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Link (URL)</label>
                          <input
                            type="url"
                            value={element.responsive[viewport].content?.link || ''}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, link: e.target.value }
                                }
                              }
                            })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                            placeholder="https://exemplo.com"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`openNewTab-${element.id}`}
                            checked={element.responsive[viewport].content?.openNewTab || false}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, openNewTab: e.target.checked }
                                }
                              }
                            })}
                            className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`openNewTab-${element.id}`} className="text-gray-300 text-xs">
                            Abrir em nova guia
                          </label>
                        </div>
                      </div>
                    )}

                    {element.type === 'image' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs mb-2 block">Upload de Imagem</label>
                          <ImageUpload
                            currentImage={element.responsive[viewport].content?.src || ''}
                            onImageSelect={(url) => syncElementAcrossViewports(selectedElement, 'content', { src: url })}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Ou cole uma URL</label>
                          <input
                            type="url"
                            value={element.responsive[viewport].content?.src || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { src: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0 mt-1"
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Texto Alternativo</label>
                          <input
                            type="text"
                            value={element.responsive[viewport].content?.alt || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { alt: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                            placeholder="Descrição da imagem"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Altura Máxima (px)</label>
                          <input
                            type="number"
                            value={element.responsive[viewport].content?.maxHeight || 400}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { maxHeight: parseInt(e.target.value) || 400 })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                            placeholder="400"
                            min="100"
                            max="800"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Ajuste da Imagem</label>
                          <div className="flex space-x-1 mt-1">
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'content', { objectFit: 'contain' })}
                              className={`px-3 py-1 rounded text-xs ${
                                element.responsive[viewport].content?.objectFit === 'contain' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              Contém
                            </button>
                            <button
                              onClick={() => syncElementAcrossViewports(selectedElement, 'content', { objectFit: 'cover' })}
                              className={`px-3 py-1 rounded text-xs ${
                                element.responsive[viewport].content?.objectFit === 'cover' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              Preenche
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {element.type === 'video' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">URL do Vídeo</label>
                          <input
                            type="url"
                            value={element.responsive[viewport].content?.src || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { src: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                            placeholder="https://exemplo.com/video.mp4"
                          />
                        </div>
                      </div>
                    )}

                    {element.type === 'spacer' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">Altura (px)</label>
                          <input
                            type="number"
                            value={element.responsive[viewport].content?.height || 50}
                            onChange={(e) => updateElement(selectedElement, {
                              responsive: {
                                ...element.responsive,
                                [viewport]: {
                                  ...element.responsive[viewport],
                                  content: { ...element.responsive[viewport].content, height: parseInt(e.target.value) || 50 }
                                }
                              }
                            })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                          />
                        </div>
                      </div>
                    )}

                    {element.type === 'html' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">Código HTML</label>
                          <textarea
                            value={element.responsive[viewport].content?.html || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { html: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0 h-20 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {element.type === 'fbpixel' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs">Pixel ID</label>
                          <input
                            type="text"
                            value={element.responsive[viewport].content?.pixelId || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { pixelId: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                            placeholder="123456789012345"
                          />
                        </div>
                        
                        <div>
                          <label className="text-gray-300 text-xs">Valor da Compra</label>
                          <input
                            type="number"
                            value={element.responsive[viewport].content?.purchaseValue || ''}
                            onChange={(e) => syncElementAcrossViewports(selectedElement, 'content', { purchaseValue: e.target.value })}
                            className="w-full bg-gray-600 text-white text-sm p-2 rounded border-0"
                            placeholder="99.90"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Viewport Header */}
          <div className="bg-gray-700 border-b border-gray-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-white text-lg font-semibold">
                  {viewport === 'desktop' ? 'Desktop' : viewport === 'tablet' ? 'Tablet' : 'Mobile'}
                </h2>
                <div className="text-gray-300 text-sm">
                  {elements.length} elemento{elements.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="text-gray-300 text-sm">
                {hasUnsavedChanges && '• Alterações não salvas'}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-100 p-8 overflow-auto">
            <div 
              className="max-w-4xl mx-auto min-h-screen"
              style={{
                backgroundColor: background.type === 'color' 
                  ? `rgba(${hexToRgb(background.value)}, ${background.opacity})` 
                  : 'transparent',
                backgroundImage: background.type === 'image' && background.image 
                  ? `url(${background.image})` 
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {elements.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-500 text-lg mb-4">
                    Nenhum elemento adicionado
                  </div>
                  <div className="text-gray-400 text-sm">
                    Use a barra lateral para adicionar elementos
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-0 w-full">
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      data-element="true"
                      data-element-id={element.id}
                      className={`relative cursor-move transition-all duration-200 ${
                        selectedElement === element.id && element.type !== 'spacer' ? 'ring-4 ring-blue-400 ring-opacity-80 shadow-2xl shadow-blue-500/25' : ''
                      } ${
                        isDragging && draggedElementId === element.id ? 'z-50' : 'z-10'
                      }`}
                      style={{
                        marginTop: `${element.spacing?.top || 0}px`,
                        marginBottom: `${element.spacing?.bottom || 20}px`,
                        marginLeft: `${element.spacing?.left || 0}px`,
                        marginRight: `${element.spacing?.right || 0}px`,
                        transform: isDragging && draggedElementId === element.id ? `translateY(${dragOffset}px)` : 'none'
                      }}
                      onClick={() => setSelectedElement(element.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        // Removido: duplicação automática no clique direito
                      }}
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
                              duplicateElement(element.id);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                            title="Duplicar elemento"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105"
                            title="Excluir elemento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* Indicador de drag */}
                      {isDragging && draggedElementId === element.id && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs z-50">
                          Arrastando
                        </div>
                      )}
                      
                      {/* Linha de inserção */}
                      {isDragging && draggedElementId !== element.id && (
                        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 opacity-0 transition-opacity duration-200 hover:opacity-100" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Structure Panel - Right Side */}
        {showStructurePanel && (
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Estrutura da Página</h3>
              <button
                onClick={() => setShowStructurePanel(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {elements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm mb-2">Nenhum elemento adicionado</div>
                <div className="text-gray-500 text-xs">Adicione elementos usando a barra lateral</div>
              </div>
            ) : (
              <div className="space-y-2">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedElement === element.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="text-sm font-medium">
                            {element.type === 'fbpixel' ? 'Facebook Pixel' : 
                             element.type === 'heading' ? 'Título' :
                             element.type === 'text' ? 'Texto' :
                             element.type === 'button' ? 'Botão' :
                             element.type === 'image' ? 'Imagem' :
                             element.type === 'video' ? 'Vídeo' :
                             element.type === 'spacer' ? 'Espaçador' :
                             element.type === 'html' ? 'HTML' :
                             element.type}
                          </div>
                          {element.content?.text && (
                            <div className="text-xs text-gray-400 truncate max-w-48">
                              {element.content.text}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateElement(element.id);
                          }}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Duplicar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          className="p-1 hover:bg-red-600 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}