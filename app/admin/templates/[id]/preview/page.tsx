'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';

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

export default function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templateData, setTemplateData] = useState<any>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [background, setBackground] = useState({ type: 'color', value: '#ffffff', opacity: 1, image: '' });
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // Verificar se estamos em modo de desenvolvimento local
        const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        
        if (isLocalDev) {
          // Carregar dados do localStorage em desenvolvimento
          const savedData = localStorage.getItem(`template_${params.id}`);
          if (savedData) {
            try {
              const templateData = JSON.parse(savedData);
              console.log('Carregando template do localStorage para preview:', templateData);
              
              setTemplateData({
                _id: params.id,
                name: templateData.name || 'Template Salvo',
                type: 'presell',
                content: templateData.content || { elements: [], background: { type: 'color', value: '#ffffff', image: '' } }
              });
              
              // Carregar elementos e background salvos
              console.log('Template data completo:', templateData);
              console.log('Template content:', templateData.content);
              
              if (templateData.content && Array.isArray(templateData.content)) {
                // Se content é um array direto
                setElements(templateData.content);
                console.log('Elementos carregados do array direto:', templateData.content);
              } else if (templateData.content && templateData.content.elements) {
                // Se content tem propriedade elements
                setElements(templateData.content.elements);
                console.log('Elementos carregados da propriedade elements:', templateData.content.elements);
              } else {
                console.log('Nenhum elemento encontrado no template');
                console.log('Tipo de content:', typeof templateData.content);
                console.log('Content é array?', Array.isArray(templateData.content));
              }
              
              // Carregar background
              if (templateData.background) {
                setBackground(templateData.background);
                console.log('Background carregado para preview:', templateData.background);
              } else if (templateData.content && templateData.content.background) {
                setBackground(templateData.content.background);
                console.log('Background carregado do content:', templateData.content.background);
              } else {
                console.log('Nenhum background encontrado, usando padrão');
                setBackground({ type: 'color', value: '#ffffff', opacity: 1, image: '' });
              }
            } catch (error) {
              console.error('Erro ao carregar template do localStorage:', error);
            }
          }
        } else {
          // Modo produção - carregar da API
          const response = await fetch(`/api/admin/templates/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            setTemplateData(data);
            setElements(data.elements || []);
            setBackground(data.background || { type: 'color', value: '#ffffff', opacity: 1, image: '' });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar template:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadTemplate();
    }
  }, [params.id, status]);

  // Injetar Facebook Pixels quando elementos mudarem
  useEffect(() => {
    // Limpar todos os scripts existentes primeiro
    const allPixelScripts = document.querySelectorAll('script[data-pixel-id], script[src*="fbevents.js"]');
    allPixelScripts.forEach(script => script.remove());
    
    // Limpar todos os noscripts
    const allNoscripts = document.querySelectorAll('noscript');
    allNoscripts.forEach(ns => {
      if (ns.innerHTML.includes('facebook.com/tr?id=')) {
        ns.remove();
      }
    });
    
    // Encontrar todos os elementos Facebook Pixel
    const pixelElements = elements.filter(el => el.type === 'fbpixel' && el.content?.pixelId?.trim());
    
    if (pixelElements.length > 0) {
      const element = pixelElements[0]; // Usar apenas o primeiro pixel
      const id = element.content.pixelId.trim();
      const purchaseValue = parseFloat(element.content.purchaseValue) || 14.9;
      
      // Detectar se estamos em localhost
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
      
      console.log('Injetando Facebook Pixel único:', id);
      console.log('Valor do Purchase configurado:', purchaseValue);
      console.log('Tipo do valor:', typeof purchaseValue);
      console.log('Ambiente localhost:', isLocalhost);
      
      if (isLocalhost) {
        console.log('🔧 Modo localhost detectado - usando implementação simulada');
        
        // Em localhost, usar implementação simulada que funciona
        window.fbq = function() {
          console.log('🎯 Facebook Pixel (localhost):', arguments);
          
          // Simular eventos para debug
          if (arguments[0] === 'track' && arguments[1] === 'Purchase') {
            console.log('✅ Evento Purchase simulado com sucesso!');
            console.log('💰 Valor:', arguments[2]?.value);
            console.log('💱 Moeda:', arguments[2]?.currency);
            
            // Salvar no localStorage para debug
            const eventData = {
              event: 'Purchase',
              value: arguments[2]?.value,
              currency: arguments[2]?.currency,
              timestamp: new Date().toISOString(),
              pixelId: id
            };
            localStorage.setItem(`pixel_event_${id}`, JSON.stringify(eventData));
          }
        };
        window.fbq.queue = [];
        window.fbq.loaded = true;
        
        // Disparar eventos imediatamente
        fbq('init', id);
        fbq('track', 'Lead');
        console.log('🚀 Disparando Purchase (localhost) com valor:', purchaseValue);
        fbq('track', 'Purchase', {value: purchaseValue, currency: 'BRL'});
        
      } else {
        // Em produção, usar script oficial
        console.log('🌐 Modo produção - carregando script oficial do Facebook');
        
        const fbScript = document.createElement('script');
        fbScript.async = true;
        fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
        fbScript.onload = function() {
          console.log('Script do Facebook carregado com sucesso!');
          
          // Função para aguardar fbq estar disponível
          const waitForFbq = (attempts = 0) => {
            if (typeof fbq !== 'undefined') {
              console.log('fbq disponível! Inicializando pixel...');
              // Inicializar pixel
              fbq('init', id);
              fbq('track', 'Lead');
              
              // Disparar Purchase
              console.log('Disparando evento Purchase para pixel:', id);
              console.log('Dados do Purchase:', {value: purchaseValue, currency: 'BRL'});
              fbq('track', 'Purchase', {value: purchaseValue, currency: 'BRL'});
            } else if (attempts < 20) { // Tentar por até 2 segundos (20 x 100ms)
              console.log(`Aguardando fbq... tentativa ${attempts + 1}/20`);
              setTimeout(() => waitForFbq(attempts + 1), 100);
            } else {
              console.error('fbq não ficou disponível após 2 segundos. Usando implementação local.');
              // Fallback para implementação local
              window.fbq = function() {
                console.log('Facebook Pixel (fallback):', arguments);
              };
              window.fbq.queue = [];
              window.fbq.loaded = true;
              
              fbq('init', id);
              fbq('track', 'Lead');
              console.log('Disparando Purchase (fallback) com valor:', purchaseValue);
              fbq('track', 'Purchase', {value: purchaseValue, currency: 'BRL'});
            }
          };
          
          // Iniciar verificação
          waitForFbq();
        };
        fbScript.onerror = function() {
          console.warn('Script do Facebook bloqueado. Usando implementação local.');
          
          // Criar fbq manualmente se bloqueado
          window.fbq = function() {
            console.log('Facebook Pixel (local):', arguments);
          };
          window.fbq.queue = [];
          window.fbq.loaded = true;
          
          // Aguardar um pouco antes de disparar eventos
          setTimeout(() => {
            fbq('init', id);
            fbq('track', 'Lead');
            console.log('Disparando Purchase (fallback) com valor:', purchaseValue);
            fbq('track', 'Purchase', {value: purchaseValue, currency: 'BRL'});
          }, 50);
        };
        document.head.appendChild(fbScript);
      }
      
      // Adicionar noscript para fallback
      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = '1';
      img.width = '1';
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${id}&ev=Lead&noscript=1`;
      noscript.appendChild(img);
      document.head.appendChild(noscript);
    }
    
    // Cleanup function
    return () => {
      const allPixelScripts = document.querySelectorAll('script[data-pixel-id], script[src*="fbevents.js"]');
      allPixelScripts.forEach(script => script.remove());
      const allNoscripts = document.querySelectorAll('noscript');
      allNoscripts.forEach(ns => {
        if (ns.innerHTML.includes('facebook.com/tr?id=')) {
          ns.remove();
        }
      });
    };
  }, [elements]);

  const getCanvasSize = () => {
    switch (viewport) {
      case 'desktop':
        return { width: 1200, height: 800 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'mobile':
        return { width: 375, height: 667 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };

  const renderElement = (element: Element) => {
    console.log('Renderizando elemento do tipo:', element.type, 'com conteúdo:', element.content);
    
    switch (element.type) {
      case 'fbpixel': {
        const id = element.content?.pixelId?.trim();
        const purchaseValue = element.content?.purchaseValue ?? 14.9;
        if (!id) {
          console.log('Pixel ID não encontrado, retornando null');
          return null;
        }
        // Retornar um elemento vazio mas visível para debug
        return (
          <div style={{ 
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1px',
            height: '1px'
          }}>
            Facebook Pixel: {id}
          </div>
        );
      }
      case 'heading':
        return (
          <h1
            style={{
              color: element.content.color || '#000000',
              fontSize: `${element.content.fontSize || 30}px`,
              fontWeight: element.content.fontWeight || 'bold',
              textAlign: element.content.textAlign || element.content.alignment || 'left',
              fontFamily: element.content.fontFamily || 'Arial',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              width: '100%',
              margin: `${element.content.marginTop || 0}px ${element.content.marginRight || 0}px ${element.content.marginBottom || 0}px ${element.content.marginLeft || 0}px`,
              lineHeight: '1.2'
            }}
          >
            {element.content.text || 'Título'}
          </h1>
        );
      case 'text':
        return (
          <div
            style={{
              color: element.content.color || '#000000',
              fontSize: `${element.content.fontSize || 16}px`,
              fontWeight: element.content.fontWeight || 'normal',
              textAlign: element.content.textAlign || element.content.alignment || 'left',
              fontFamily: element.content.fontFamily || 'Arial',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              width: '100%',
              margin: `${element.content.marginTop || 0}px ${element.content.marginRight || 0}px ${element.content.marginBottom || 0}px ${element.content.marginLeft || 0}px`,
              lineHeight: '1.4'
            }}
          >
            {element.content.text || 'Texto'}
          </div>
        );
      case 'image':
        return (
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={element.content.src || '/placeholder.png'}
              alt={element.content.alt || 'Imagem'}
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: `${element.content?.maxHeight || 400}px`,
                objectFit: element.content?.objectFit || 'contain',
                borderRadius: `${element.content.borderRadius || 0}px`,
                display: 'block'
              }}
            />
          </div>
        );
      case 'video':
        return (
          <video
            src={element.content.src || ''}
            controls={element.content.controls !== false}
            autoPlay={element.content.autoPlay === true}
            loop={element.content.loop === true}
            muted={element.content.muted === true}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: `${element.content.borderRadius || 0}px`,
            }}
          />
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
            {element.content?.link ? (
              <a
                href={element.content.link}
                target={element.content?.openNewTab ? '_blank' : '_self'}
                rel={element.content?.openNewTab ? 'noopener noreferrer' : ''}
                style={{
                  fontSize: `${element.content?.fontSize || 16}px`,
                  fontFamily: element.content?.fontFamily || 'Arial',
                  fontWeight: element.content?.fontWeight || 'normal',
                  color: element.content?.color || '#ffffff',
                  backgroundColor: element.content?.backgroundColor || '#3b82f6',
                  padding: `${element.content?.paddingTop || 12}px ${element.content?.paddingRight || 24}px ${element.content?.paddingBottom || 12}px ${element.content?.paddingLeft || 24}px`,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '120px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                {element.content?.text || 'Botão'}
              </a>
            ) : (
              <button
                style={{
                  fontSize: `${element.content?.fontSize || 16}px`,
                  fontFamily: element.content?.fontFamily || 'Arial',
                  fontWeight: element.content?.fontWeight || 'normal',
                  color: element.content?.color || '#ffffff',
                  backgroundColor: element.content?.backgroundColor || '#3b82f6',
                  padding: `${element.content?.paddingTop || 12}px ${element.content?.paddingRight || 24}px ${element.content?.paddingBottom || 12}px ${element.content?.paddingLeft || 24}px`,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '120px'
                }}
              >
                {element.content?.text || 'Botão'}
              </button>
            )}
          </div>
        );
      case 'spacer':
        return (
          <div
            style={{
              width: '100%',
              height: `${element.content.height || 50}px`,
              backgroundColor: element.content.backgroundColor || 'transparent',
            }}
          />
        );
      case 'pixel':
        return (
          <img
            src={element.content.pixelUrl || ''}
            alt="Pixel de rastreamento"
            style={{ width: '1px', height: '1px', opacity: 0 }}
          />
        );
      case 'html':
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: element.content?.html || '' }}
            style={{ 
              width: '100%',
              color: '#000000'
            }}
          />
        );
      default:
        console.log('Tipo de elemento desconhecido:', element.type);
        return <div style={{ padding: '10px', border: '1px dashed #ccc', color: '#666' }}>
          Elemento desconhecido: {element.type}
        </div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando preview...</div>
      </div>
    );
  }

  console.log('Background atual no preview:', background);
  console.log('Tipo de background:', background.type);
  console.log('Valor do background:', background.value);
  console.log('Opacidade:', background.opacity);
  console.log('Imagem:', background.image);

  return (
    <div 
      className="min-h-screen w-full"
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
      {/* Debug Panel - Apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg z-50">
            <div className="text-xs mb-2">Debug Facebook Pixel</div>
            <div className="text-xs text-yellow-300 mb-2">
              {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? '🔧 Modo localhost - usando simulação' 
                : '⚠️ Se eventos não aparecem, desative o ad blocker'}
            </div>
            <button
              onClick={() => {
                // Limpar localStorage
                const pixelElements = elements.filter(el => el.type === 'fbpixel' && el.content?.pixelId?.trim());
                pixelElements.forEach(element => {
                  const id = element.content.pixelId.trim();
                  localStorage.removeItem(`purchaseTracked_${id}`);
                  localStorage.removeItem(`pixel_event_${id}`);
                });
                // Recarregar página
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
            >
              Limpar & Recarregar
            </button>
          </div>
        )}
      {/* Preview Canvas - Versão Limpa */}
      <div className="w-full min-h-screen">
        {elements.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-4">
                Nenhum elemento adicionado
              </div>
              <div className="text-gray-400 text-sm">
                Esta página está vazia
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-0 w-full">
            {elements.map((element, index) => {
              const renderedElement = renderElement(element);
              
              // Se o elemento renderizado for null, não mostrar nada (elementos ocultos)
              if (renderedElement === null) {
                return null;
              }
              
              return (
                <div
                  key={element.id}
                  className="flex items-center justify-center w-full"
                  style={{
                    marginTop: `${element.spacing?.top || 0}px`,
                    marginBottom: `${element.spacing?.bottom || 20}px`,
                    marginLeft: `${element.spacing?.left || 0}px`,
                    marginRight: `${element.spacing?.right || 0}px`,
                    padding: `${element.content?.paddingTop || 0}px ${element.content?.paddingRight || 0}px ${element.content?.paddingBottom || 0}px ${element.content?.paddingLeft || 0}px`
                  }}
                >
                  {renderedElement}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
