'use client';

import { useEffect } from 'react';

interface Widget {
  id: string;
  type: string;
  props: any;
}

interface Column {
  id: string;
  widgets: Widget[];
}

interface Section {
  id: string;
  columns: Column[];
}

interface PageContent {
  sections?: Section[];
  background?: {
    type: 'color' | 'image' | 'gradient';
    value?: string;
    image?: string;
  };
}

// Renderizar widget individual
function renderWidget(w: Widget) {
  switch (w.type) {
    case 'heading':
      const HeadingTag = (w.props.tag || 'h2') as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          style={{
            fontSize: w.props.size || 36,
            color: w.props.color || '#111',
            textAlign: w.props.align || 'center',
          }}
        >
          {w.props.text || 'Título'}
        </HeadingTag>
      );
    case 'text':
      return (
        <p
          style={{
            fontSize: w.props.size || 16,
            color: w.props.color || '#333',
            textAlign: w.props.align || 'center',
          }}
        >
          {w.props.text || 'Texto'}
        </p>
      );
    case 'button':
      return (
        <div style={{ textAlign: w.props.align || 'center' }}>
          <a
            href={w.props.url || '#'}
            style={{
              display: 'inline-block',
              background: w.props.bg || '#3b82f6',
              color: w.props.color || '#fff',
              borderRadius: w.props.radius || 8,
              padding: `${w.props.padV || 12}px ${w.props.padH || 24}px`,
              textDecoration: 'none',
            }}
          >
            {w.props.text || 'Botão'}
          </a>
        </div>
      );
    case 'image':
      return (
        <div style={{ textAlign: w.props.align || 'center' }}>
          {w.props.src ? (
            <img
              src={w.props.src}
              alt={w.props.alt || ''}
              style={{ maxWidth: w.props.width || 600, width: '100%' }}
            />
          ) : (
            <div className="text-gray-400">Imagem sem fonte</div>
          )}
        </div>
      );
    case 'video':
      return (
        <div style={{ textAlign: w.props.align || 'center' }}>
          {w.props.src ? (
            <video
              src={w.props.src}
              controls
              style={{ maxWidth: w.props.width || 720, width: '100%' }}
            />
          ) : (
            <div className="text-gray-400">Vídeo sem fonte</div>
          )}
        </div>
      );
    case 'spacer':
      return <div style={{ height: w.props.height || 24 }} />;
    case 'divider':
      return (
        <hr
          style={{
            borderColor: w.props.color || '#e5e7eb',
            borderWidth: w.props.thickness || 1,
            borderStyle: 'solid',
          }}
        />
      );
    case 'html':
      return <div dangerouslySetInnerHTML={{ __html: w.props.html }} />;
    case 'pixelpageview':
      // Renderizar pixel do Facebook/Meta
      return <PixelPageView pixelId={w.props.pixelId} />;
    case 'pixelhot':
      // Widget oculto - não renderiza visualmente
      return null;
    default:
      return null;
  }
}

// Componente para Pixel PageView
function PixelPageView({ pixelId }: { pixelId?: string }) {
  useEffect(() => {
    if (!pixelId) return;

    // Verificar se fbq já existe
    if (typeof window !== 'undefined' && (window as any).fbq) {
      // Pixel já carregado, apenas disparar PageView
      (window as any).fbq('track', 'PageView');
      return;
    }

    // Carregar pixel do Facebook
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.body.appendChild(noscript);

    return () => {
      // Cleanup opcional
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, [pixelId]);

  // Widget oculto - não renderiza visualmente
  return null;
}

export default function PageRenderer({ content }: { content: PageContent }) {
  if (!content || !content.sections) {
    return null;
  }

  return (
    <>
      {content.sections.map((section) => (
        <div key={section.id} className="px-6 py-8">
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${section.columns.length}, 1fr)`,
            }}
          >
            {section.columns.map((column) => (
              <div key={column.id}>
                {column.widgets.map((widget) => (
                  <div key={widget.id} className="mb-4 last:mb-0">
                    {renderWidget(widget)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

