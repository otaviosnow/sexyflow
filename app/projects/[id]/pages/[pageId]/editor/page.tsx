'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Eye, Globe, Layout, Palette, Save, Settings, Trash2, Type, X } from 'lucide-react';
import toast from 'react-hot-toast';

// EDITOR V2 (simplificado) — Seções > Colunas > Widgets
type WidgetType = 'heading' | 'text' | 'button' | 'image' | 'video' | 'spacer' | 'divider' | 'html' | 'pixelhot';

interface Widget { id: string; type: WidgetType; props: any; }
interface Column { id: string; widgets: Widget[]; }
interface Section { id: string; columns: Column[]; }

interface PageDoc {
  _id: string;
  title: string;
  slug: string;
  type: string;
  content: any;
  isPublished: boolean;
  isActive: boolean;
}

interface Project { _id: string; name: string; subdomain: string; }

export default function EditorV2({ params }: { params: { id: string; pageId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [page, setPage] = useState<PageDoc | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<{ sectionId?: string; columnId?: string; widgetId?: string }>({});
  const [activeTab, setActiveTab] = useState<'widgets' | 'props' | 'settings'>('widgets');
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const CONTENT_MAX = 1140; // largura do conteúdo
  const COL_GUTTER = 24;

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') { load(); }
  }, [status]);

  async function load() {
    try {
      const [pRes, pgRes] = await Promise.all([
        fetch(`/api/projects/${params.id}`),
        fetch(`/api/pages/${params.pageId}`)
      ]);
      if (pRes.ok) setProject(await pRes.json());
      if (pgRes.ok) {
        const data = await pgRes.json();
        setPage(data);
        // Se existir builder v2, usa; caso contrário inicia vazio
        const v2 = data.content?.sections as Section[] | undefined;
        setSections(Array.isArray(v2) ? v2 : []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function addSection(cols: number) {
    const section: Section = {
      id: `sec_${crypto.randomUUID()}`,
      columns: Array.from({ length: cols }).map(() => ({ id: `col_${crypto.randomUUID()}`, widgets: [] }))
    };
    setSections(prev => [...prev, section]);
    setSelected({ sectionId: section.id, columnId: section.columns[0].id });
    setHasUnsaved(true);
  }

  function addWidget(type: WidgetType) {
    if (!selected.columnId) return toast.error('Selecione uma coluna');
    const widget: Widget = { id: `w_${crypto.randomUUID()}`, type, props: getDefaultProps(type) };
    setSections(prev => prev.map(sec => sec.id !== selected.sectionId ? sec : {
      ...sec,
      columns: sec.columns.map(c => c.id !== selected.columnId ? c : { ...c, widgets: [...c.widgets, widget] })
    }));
    setSelected(sel => ({ ...sel, widgetId: widget.id }));
    setHasUnsaved(true);
  }

  function getDefaultProps(type: WidgetType) {
    switch (type) {
      case 'heading': return { text: 'Título', tag: 'h2', align: 'center', color: '#111', size: 36 };
      case 'text': return { text: 'Texto', align: 'center', color: '#333', size: 16 };
      case 'button': return { text: 'Botão', url: '#', align: 'center', bg: '#3b82f6', color: '#fff', radius: 8, padV: 12, padH: 24 };
      case 'image': return { src: '', alt: 'Imagem', align: 'center', width: 600 };
      case 'video': return { src: '', align: 'center', width: 720 };
      case 'spacer': return { height: 24 };
      case 'divider': return { color: '#e5e7eb', thickness: 1 };
      case 'html': return { html: '<p>HTML</p>' };
      case 'pixelhot': return { pixelId: '', purchaseValue: 0, currency: 'BRL' };
    }
  }

  function updateWidget(widgetId: string, patch: any) {
    setSections(prev => prev.map(sec => ({
      ...sec,
      columns: sec.columns.map(col => ({
        ...col,
        widgets: col.widgets.map(w => w.id === widgetId ? { ...w, props: { ...w.props, ...patch } } : w)
      }))
    })));
    setHasUnsaved(true);
  }

  function deleteWidget(widgetId: string) {
    setSections(prev => prev.map(sec => ({
      ...sec,
      columns: sec.columns.map(col => ({ ...col, widgets: col.widgets.filter(w => w.id !== widgetId) }))
    })));
    setSelected(sel => ({ sectionId: sel.sectionId, columnId: sel.columnId }));
    setHasUnsaved(true);
  }

  async function save() {
    if (!page) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          content: { builder: 'v2', sections }
        })
      });
      if (res.ok) { toast.success('Salvo'); setHasUnsaved(false); }
      else toast.error('Erro ao salvar');
    } catch(e) { console.error(e); toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  }

  // UI helpers
  const selectedWidget = (() => {
    if (!selected.widgetId) return null;
    for (const s of sections) for (const c of s.columns) {
      const w = c.widgets.find(x => x.id === selected.widgetId); if (w) return w;
    }
    return null;
  })();

  if (status === 'loading' || !session) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar Esquerda - Widgets */}
      <aside className="w-72 border-r border-gray-800 bg-gray-900 p-4">
        <h3 className="text-sm font-semibold mb-3">Seções</h3>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1,2,3,4].map(n => (
            <button key={n} onClick={() => addSection(n)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">{n} coluna{n>1?'s':''}</button>
          ))}
        </div>
        <h3 className="text-sm font-semibold mb-3">Widgets</h3>
        <div className="grid grid-cols-2 gap-2">
          {[{t:'heading',l:'Título'},{t:'text',l:'Texto'},{t:'button',l:'Botão'},{t:'image',l:'Imagem'},{t:'video',l:'Vídeo'},{t:'spacer',l:'Espaço'},{t:'divider',l:'Divisor'},{t:'html',l:'HTML'},{t:'pixelhot',l:'Pixel Hot'}].map(it => (
            <button key={it.t} onClick={() => addWidget(it.t as WidgetType)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">{it.l}</button>
          ))}
        </div>
      </aside>

      {/* Canvas */}
      <main className="flex-1 bg-gray-100 text-gray-900 overflow-auto">
        <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/projects/${params.id}`)} className="text-gray-300 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4"/> Voltar
            </button>
            {hasUnsaved && <span className="text-xs text-yellow-400">• Não salvo</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50 flex items-center gap-1"><Save className="w-4 h-4"/>Salvar</button>
            {page?.isPublished ? (
              <a target="_blank" href={`/site/${project?.subdomain}/${page?.slug}`} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm flex items-center gap-1"><Eye className="w-4 h-4"/>Preview</a>
            ) : null}
          </div>
        </div>

        <div className="p-8 flex justify-center">
          <div ref={canvasRef} className="bg-white rounded shadow w-full" style={{ maxWidth: CONTENT_MAX }}>
            {sections.length === 0 && (
              <div className="text-center text-gray-400 py-16">Adicione uma seção para começar</div>
            )}
            {sections.map(sec => (
              <div key={sec.id} className="px-6 py-8 border-b border-gray-200">
                <div className="grid" style={{ gridTemplateColumns: `repeat(${sec.columns.length}, 1fr)`, gap: COL_GUTTER }}>
                  {sec.columns.map(col => (
                    <div key={col.id} className={`min-h-[80px] p-3 rounded border ${selected.columnId===col.id? 'border-pink-500':'border-gray-200'} bg-gray-50`}
                         onClick={() => setSelected({ sectionId: sec.id, columnId: col.id })}>
                      {col.widgets.length===0 && (
                        <div className="text-xs text-gray-400 text-center">Arraste um widget aqui</div>
                      )}
                      {col.widgets.map(w => (
                        <div key={w.id} className={`relative group ${selected.widgetId===w.id?'outline outline-2 outline-pink-500':''} mb-4 last:mb-0`} onClick={(e)=>{e.stopPropagation(); setSelected({ sectionId: sec.id, columnId: col.id, widgetId: w.id });}}>
                          {/* Botão excluir */}
                          {selected.widgetId===w.id && (
                            <button onClick={(e)=>{e.stopPropagation(); deleteWidget(w.id);}} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><Trash2 className="w-3 h-3"/></button>
                          )}
                          {renderWidget(w)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Propriedades */}
      <aside className="w-80 border-l border-gray-800 bg-gray-900 p-4">
        <h3 className="text-sm font-semibold mb-3">Propriedades</h3>
        {!selectedWidget && <p className="text-xs text-gray-400">Selecione um widget</p>}
        {selectedWidget && (
          <div className="space-y-3 text-sm">
            {selectedWidget.type==='heading' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Texto</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.text} onChange={(e)=>updateWidget(selectedWidget.id,{text:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">Tamanho</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.size} onChange={(e)=>updateWidget(selectedWidget.id,{size:parseInt(e.target.value)||0})}/>
                <label className="block text-gray-400 text-xs mb-1">Cor</label>
                <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.color} onChange={(e)=>updateWidget(selectedWidget.id,{color:e.target.value})}/>
              </>
            )}
            {selectedWidget.type==='text' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Texto</label>
                <textarea rows={4} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.text} onChange={(e)=>updateWidget(selectedWidget.id,{text:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">Tamanho</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.size} onChange={(e)=>updateWidget(selectedWidget.id,{size:parseInt(e.target.value)||0})}/>
                <label className="block text-gray-400 text-xs mb-1">Cor</label>
                <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.color} onChange={(e)=>updateWidget(selectedWidget.id,{color:e.target.value})}/>
              </>
            )}
            {selectedWidget.type==='button' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Texto</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.text} onChange={(e)=>updateWidget(selectedWidget.id,{text:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">URL</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.url} onChange={(e)=>updateWidget(selectedWidget.id,{url:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">Cores</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-gray-500">Fundo</span>
                    <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.bg} onChange={(e)=>updateWidget(selectedWidget.id,{bg:e.target.value})}/>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Texto</span>
                    <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.color} onChange={(e)=>updateWidget(selectedWidget.id,{color:e.target.value})}/>
                  </div>
                </div>
              </>
            )}
            {selectedWidget.type==='spacer' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Altura</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.height} onChange={(e)=>updateWidget(selectedWidget.id,{height:parseInt(e.target.value)||0})}/>
              </>
            )}
            {selectedWidget.type==='divider' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Cor</label>
                <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.color} onChange={(e)=>updateWidget(selectedWidget.id,{color:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">Espessura</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.thickness} onChange={(e)=>updateWidget(selectedWidget.id,{thickness:parseInt(e.target.value)||1})}/>
              </>
            )}
            {selectedWidget.type==='html' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">HTML</label>
                <textarea rows={6} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.html} onChange={(e)=>updateWidget(selectedWidget.id,{html:e.target.value})}/>
              </>
            )}
            {selectedWidget.type==='pixelhot' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Pixel ID</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.pixelId} onChange={(e)=>updateWidget(selectedWidget.id,{pixelId:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">Valor Purchase</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.purchaseValue} onChange={(e)=>updateWidget(selectedWidget.id,{purchaseValue:parseFloat(e.target.value)||0})}/>
                <label className="block text-gray-400 text-xs mb-1">Moeda</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.currency} onChange={(e)=>updateWidget(selectedWidget.id,{currency:e.target.value})}/>
              </>
            )}
          </div>
        )}
      </aside>
    </div>
  );

  function renderWidget(w: Widget) {
    switch (w.type) {
      case 'heading': return <h2 style={{ textAlign:'center', color:w.props.color, fontSize:w.props.size }}>{w.props.text}</h2>;
      case 'text': return <p style={{ textAlign:'center', color:w.props.color, fontSize:w.props.size }}>{w.props.text}</p>;
      case 'button': return (
        <div className="flex justify-center">
          <a href={w.props.url} style={{ background:w.props.bg, color:w.props.color, borderRadius:w.props.radius, padding:`${w.props.padV}px ${w.props.padH}px` }}>
            {w.props.text}
          </a>
        </div>
      );
      case 'image': return (
        <div className="flex justify-center">
          {w.props.src ? <img src={w.props.src} alt={w.props.alt} style={{ maxWidth:w.props.width, width:'100%' }}/> : <div className="text-xs text-gray-400">Imagem sem fonte</div>}
        </div>
      );
      case 'video': return (
        <div className="flex justify-center">
          {w.props.src ? <video src={w.props.src} controls style={{ maxWidth:w.props.width, width:'100%' }}/> : <div className="text-xs text-gray-400">Vídeo sem fonte</div>}
        </div>
      );
      case 'spacer': return <div style={{ height:w.props.height }}/>; 
      case 'divider': return <hr style={{ borderColor:w.props.color, borderWidth:w.props.thickness, borderStyle:'solid' }}/>; 
      case 'html': return <div dangerouslySetInnerHTML={{ __html: w.props.html }} />;
      case 'pixelhot': return <div className="text-[11px] text-pink-600 bg-pink-100 rounded px-2 py-1 inline-block">Pixel Hot (oculto)</div>;
    }
  }
}

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

  // Proteção contra saída sem salvar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);


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

  // Upload de imagem para um elemento específico (Dropbox com fallback)
  const handleElementImageUpload = async (elementId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'sexyflow-images');
      if (session?.user?.id) formData.append('userId', session.user.id);

      const uploadResponse = await fetch('/api/upload/dropbox', {
        method: 'POST',
        body: formData,
      });
      const result = await uploadResponse.json();

      if (result.success && result.url) {
        updateElement(elementId, {
          content: {
            ...(elements.find((e) => e.id === elementId)?.content || {}),
            src: result.url
          }
        });
        toast.success('Imagem enviada com sucesso!');
      } else {
        // Fallback base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          updateElement(elementId, {
            content: {
              ...(elements.find((e) => e.id === elementId)?.content || {}),
              src: data
            }
          });
          toast.success('Imagem carregada localmente!');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro ao enviar imagem do elemento:', error);
      toast.error('Erro ao enviar imagem');
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
    const centerX = getCenterX(defaultSize.width);
    // Posicionar no fim da página respeitando espaçamentos fixos
    let nextY = TOP_PADDING;
    if (elements.length > 0) {
      const last = [...elements].sort((a, b) => a.position.y - b.position.y)[elements.length - 1];
      nextY = last.position.y + last.size.height + GAP;
    }
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: { x: centerX, y: nextY }, // Centralizado e empilhado verticalmente
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
    const centerX = getCenterX(defaultSize.width);
    // Sempre adicionar no final da pilha, independentemente do Y solto
    let nextY = TOP_PADDING;
    if (elements.length > 0) {
      const last = [...elements].sort((a, b) => a.position.y - b.position.y)[elements.length - 1];
      nextY = last.position.y + last.size.height + GAP;
    }
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: { x: centerX, y: nextY },
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
        const centerX = getCenterX(updated.size.width);
        return {
          ...updated,
          position: { ...updated.position, x: centerX }
        };
      }
      return el;
    });
    
    // Reorganizar elementos respeitando espaços após atualização (construção iterativa)
    const sortedElements = [...updatedElements].sort((a, b) => a.position.y - b.position.y);
    const finalElements: Element[] = [];
    sortedElements.forEach((el, index) => {
      const centerX = getCenterX(el.size.width);
      if (index === 0) {
        finalElements.push({ ...el, position: { x: centerX, y: TOP_PADDING } });
      } else {
        const prevEl = finalElements[index - 1];
        const newY = prevEl.position.y + prevEl.size.height + GAP;
        finalElements.push({ ...el, position: { x: centerX, y: newY } });
      }
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

    const centerX = getCenterX(draggedEl.size.width);

    // Atualizar somente o elemento arrastado (sem "empurrar" os demais em tempo real)
    const updated = elements.map((el) =>
      el.id === draggedElementId ? { ...el, position: { x: centerX, y: newY } } : el
    );

    setElements(updated);
    setHasUnsavedChanges(true);
  };

  const handleCanvasMouseUp = () => {
    if (draggedElementId) {
      // Ao soltar, alinhar verticalmente respeitando GAP fixo
      const sorted = [...elements].sort((a, b) => a.position.y - b.position.y);
      const finalElements: Element[] = [];

      let cursorY = TOP_PADDING;
      sorted.forEach((el, index) => {
        const centerX = getCenterX(el.size.width);
        const y = Math.max(0, cursorY);
        finalElements.push({ ...el, position: { x: centerX, y } });
        cursorY = y + el.size.height + GAP;
      });

      setElements(finalElements);
    }
    
    setDraggedElementId(null);
    setDragOffset(null);
  };

  // Calcular altura mínima do canvas baseada nos elementos
  const calculateCanvasHeight = () => {
    if (elements.length === 0) return 600; // Altura mínima padrão

    const sorted = [...elements].sort((a, b) => a.position.y - b.position.y);
    const last = sorted[sorted.length - 1];
    const bottom = last.position.y + last.size.height + GAP;
    return Math.max(600, bottom + BOTTOM_PADDING);
  };

  const renderElement = (element: Element) => {
    const isSelected = selectedElement === element.id;
    const isBeingDragged = draggedElementId === element.id;
    
    // X sempre centralizado baseado na largura do canvas
    const centerX = getCenterX(element.size.width);
    const actualX = isBeingDragged ? centerX : element.position.x;
    
    return (
      <div
        key={element.id}
        className={`absolute relative ${isSelected ? 'ring-2 ring-pink-500' : ''} ${isBeingDragged ? 'cursor-grabbing opacity-75' : 'cursor-ns-resize'}`}
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
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(element.id);
            }}
            title="Excluir"
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
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
          <div className="w-full h-full flex items-center justify-center">
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
          </div>
        )}
        
        {element.type === 'image' && (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={element.content?.src || '/placeholder.jpg'}
              alt={element.content?.alt || 'Imagem'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
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
              onClick={() => {
                if (hasUnsavedChanges) {
                  const confirmed = window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?');
                  if (!confirmed) return;
                }
                router.push(`/projects/${params.id}`);
              }}
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

              {/* Estrutura movida para painel lateral à direita */}
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

              {selectedElementData.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">URL da Imagem</label>
                    <input
                      type="text"
                      value={selectedElementData.content.src || ''}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        content: { ...selectedElementData.content, src: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleElementImageUpload(selectedElementData.id, file);
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Largura</label>
                      <input
                        type="number"
                        value={selectedElementData.size.width || 300}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          size: { ...selectedElementData.size, width: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Altura</label>
                      <input
                        type="number"
                        value={selectedElementData.size.height || 200}
                        onChange={(e) => updateElement(selectedElementData.id, {
                          size: { ...selectedElementData.size, height: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
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
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-white">Editor de Página</h2>
            <button
              onClick={() => setShowStructure((v) => !v)}
              className={`p-2 rounded-md border transition-colors ${showStructure ? 'bg-pink-600 border-pink-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
              title="Estrutura (lista de elementos)"
            >
              <Layout className="w-4 h-4" />
            </button>
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
              onClick={() => window.open(`/site/${project.subdomain}/${page.slug}`, '_blank')}
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
        {/* Painel de Estrutura (direita) */}
        {showStructure && (
          <div className="fixed inset-0 z-40" onClick={() => setShowStructure(false)}>
            <div className="absolute inset-0 bg-black/30"></div>
            <aside
              className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Estrutura</h3>
                <button
                  onClick={() => setShowStructure(false)}
                  className="p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {elements.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum elemento adicionado.</p>
              ) : (
                <div className="space-y-2">
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedElement === element.id 
                          ? 'bg-pink-500/10 border border-pink-500/20' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setSelectedElement(element.id);
                        setActiveTab('design');
                      }}
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
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

