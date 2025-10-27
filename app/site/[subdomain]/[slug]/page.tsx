import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Page from '@/models/Page';

interface SubdomainSlugPageProps {
  params: {
    subdomain: string;
    slug: string;
  };
}

async function getProject(subdomain: string): Promise<any> {
  try {
    await connectDB();
    
    const project = await Project.findOne({ 
      subdomain: subdomain.toLowerCase(),
      isActive: true 
    }).lean();
    
    return project;
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return null;
  }
}

async function getPage(projectId: string, slug: string): Promise<any> {
  try {
    await connectDB();
    
    const page = await Page.findOne({
      projectId,
      slug: slug.toLowerCase(),
      isActive: true
    }).lean();
    
    return page;
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    return null;
  }
}

export default async function SubdomainSlugPage({ params }: SubdomainSlugPageProps) {
  console.log('🌐 Renderizando:', params.subdomain, '/', params.slug);
  
  const project = await getProject(params.subdomain);
  
  if (!project) {
    console.log('❌ Projeto não encontrado:', params.subdomain);
    notFound();
  }
  
  const page = await getPage(project._id.toString(), params.slug);
  
  if (!page) {
    console.log('❌ Página não encontrada:', params.slug);
    notFound();
  }
  
  console.log('✅ Página encontrada:', page.title);
  
  // Renderizar página usando template
  const { content } = page;
  
  return (
    <div className="min-h-screen">
      <div 
        style={{
          background: content?.background?.type === 'color' 
            ? content.background.value 
            : content?.background?.type === 'gradient'
            ? `linear-gradient(${content.background.value})`
            : content?.background?.type === 'image'
            ? `url(${content.background.image})`
            : '#ffffff'
        }}
      >
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
              fbq('track', 'PageView');
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
export async function generateMetadata({ params }: SubdomainSlugPageProps) {
  const project = await getProject(params.subdomain);
  
  if (!project) {
    return {
      title: 'Página não encontrada'
    };
  }
  
  const page = await getPage(project._id.toString(), params.slug);
  
  if (!page) {
    return {
      title: 'Página não encontrada'
    };
  }
  
  return {
    title: `${page.title} - ${project.name}`,
    description: page.description || `${page.title} - ${project.name}`
  };
}

