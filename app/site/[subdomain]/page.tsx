import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Page from '@/models/Page';
import PageRenderer from '@/components/PageRenderer';

interface SubdomainPageProps {
  params: {
    subdomain: string;
  };
}

async function getProject(subdomain: string): Promise<any> {
  try {
    await connectDB();
    
    const project = await Project.findOne({ 
      subdomain: subdomain.toLowerCase(),
      isActive: true 
    }).populate('pages').lean();
    
    return project;
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return null;
  }
}

async function getHomePage(projectId: string): Promise<any> {
  try {
    await connectDB();
    
    // Buscar a primeira página do projeto ou a página marcada como home
    const homePage = await Page.findOne({
      projectId,
      isActive: true
    }).sort({ createdAt: 1 }).lean();
    
    return homePage;
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    return null;
  }
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
  console.log('🌐 Renderizando subdomínio:', params.subdomain);
  
  const project = await getProject(params.subdomain);
  
  if (!project) {
    console.log('❌ Projeto não encontrado:', params.subdomain);
    notFound();
  }
  
  console.log('✅ Projeto encontrado:', project.name);
  
  const homePage = await getHomePage(project._id.toString());
  
  // Registrar pageview para a página inicial
  if (homePage) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://sexyflow.com.br'}/api/analytics/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: homePage._id,
          projectId: project._id,
          subdomain: params.subdomain,
          slug: '', // Página inicial não tem slug
        })
      });
    } catch (e) {
      console.warn('Falha ao registrar pageview');
    }
  }
  
  if (!homePage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {project.name}
          </h1>
          
          <p className="text-gray-600 mb-6">
            Este projeto ainda não tem nenhuma página publicada.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            Crie sua primeira página para que ela apareça aqui!
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizar página usando template
  const { content } = homePage;
  
  // Verificar se é estrutura v2 (sections) ou antiga (elements)
  const isV2Structure = content?.sections && Array.isArray(content.sections);
  
  return (
    <div className="min-h-screen">
      <div 
        className={`min-h-screen w-full ${content?.background?.type === 'image' ? 'responsive-bg-image' : ''}`}
        style={{
          backgroundColor: content?.background?.type === 'color' 
            ? content.background.value 
            : content?.background?.type === 'gradient'
            ? 'transparent'
            : content?.background?.type === 'image'
            ? 'transparent'
            : '#ffffff',
          backgroundImage: content?.background?.type === 'image' && content.background.image
            ? `url(${content.background.image})`
            : content?.background?.type === 'gradient'
            ? `linear-gradient(${content.background.value})`
            : 'none',
          backgroundAttachment: 'scroll' // Evita problemas em mobile
        }}
      >
        {isV2Structure ? (
          // Estrutura v2 - usar PageRenderer
          <PageRenderer content={content} />
        ) : (
          // Estrutura antiga - manter compatibilidade
          <div className="container mx-auto px-4 py-8">
            {content?.elements?.map((element: any) => (
            <div 
              key={element.id}
              className="mb-4"
              style={{
                width: element.size?.width || 'auto',
                height: element.size?.height || 'auto'
              }}
            >
              {element.type === 'title' && (
                <h1 
                  style={{
                    fontSize: element.content?.fontSize || 32,
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
                    textAlign: element.content?.alignment || 'left'
                  }}
                >
                  {element.content?.text || 'Texto'}
                </p>
              )}
              
              {element.type === 'button' && (
                <a
                  href={element.content?.link || '#'}
                  style={{
                    display: 'inline-block',
                    fontSize: element.content?.fontSize || 16,
                    fontFamily: element.content?.fontFamily || 'Arial',
                    fontWeight: element.content?.fontWeight || 'normal',
                    color: element.content?.color || '#ffffff',
                    backgroundColor: element.content?.backgroundColor || '#3b82f6',
                    padding: `${element.content?.paddingTop || 12}px ${element.content?.paddingRight || 24}px ${element.content?.paddingBottom || 12}px ${element.content?.paddingLeft || 24}px`,
                    borderRadius: element.content?.borderRadius || '8px',
                    textDecoration: 'none',
                    textAlign: element.content?.alignment || 'center'
                  }}
                >
                  {element.content?.text || 'Botão'}
                </a>
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
            </div>
          ))}
        </div>
        )}
      </div>
      
      {/* Analytics */}
      {project.settings?.analytics?.facebookPixel && (
        <>
          <script dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${project.settings.analytics.facebookPixel}');
              // Verificar se PageView já foi disparado para evitar duplicação
              var pageviewKey = 'pixel_pageview_${project.settings.analytics.facebookPixel}';
              if (!localStorage.getItem(pageviewKey)) {
                fbq('track', 'PageView');
                localStorage.setItem(pageviewKey, 'true');
              }
            `
          }} />
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${project.settings.analytics.facebookPixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
      
      {project.settings?.analytics?.googleAnalytics && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${project.settings.analytics.googleAnalytics}`} />
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${project.settings.analytics.googleAnalytics}');
            `
          }} />
        </>
      )}
    </div>
  );
}

// Gerar metadata dinâmica
export async function generateMetadata({ params }: SubdomainPageProps) {
  const project = await getProject(params.subdomain);
  
  if (!project) {
    return {
      title: 'Projeto não encontrado'
    };
  }
  
  return {
    title: project.name,
    description: project.description || `Página de ${project.name}`
  };
}

