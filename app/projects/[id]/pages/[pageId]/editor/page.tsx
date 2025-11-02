'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Eye, Globe, Layout, Palette, Save, Settings, Trash2, Type, X, Heading, AlignLeft, MousePointerClick, Image, Video, Square, Minus, Code, Flame } from 'lucide-react';
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
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  const [viewport, setViewport] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const previewOuterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [background, setBackground] = useState<{ type: 'color' | 'image'; value: string }>({ type: 'color', value: '#ffffff' });
  const [mediaPicker, setMediaPicker] = useState<{ open: boolean; kind: 'image' | 'video'; target: { type: 'background' } | { type: 'widget'; widgetId: string } }>(() => ({ open: false, kind: 'image', target: { type: 'background' } }));
  const [mediaItems, setMediaItems] = useState<Array<{ url: string; name: string; kind: string }>>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

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
        const bg = data.content?.background as any;
        if (bg && (bg.type === 'color' || bg.type === 'image')) {
          setBackground({ type: bg.type, value: bg.value || bg.image || '#ffffff' });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Ajuste de escala para caber na tela
  useEffect(() => {
    function recompute() {
      const el = previewOuterRef.current;
      if (!el) return;
      const avail = el.offsetWidth;
      const target = viewport === 'desktop' ? CONTENT_MAX : viewport === 'tablet' ? 768 : 390;
      const factor = Math.min(1, avail / target);
      setScale(factor);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [viewport]);

  // Helpers de propriedades responsivas
  function getR(w: Widget, key: string, fallback?: any) {
    const r = w.props?._r?.[viewport]?.[key];
    return r !== undefined ? r : (w.props?.[key] !== undefined ? w.props[key] : fallback);
  }

  function updateWidgetResponsive(widgetId: string, patch: Record<string, any>) {
    setSections(prev => prev.map(sec => ({
      ...sec,
      columns: sec.columns.map(col => ({
        ...col,
        widgets: col.widgets.map(w => {
          if (w.id !== widgetId) return w;
          const current = w.props?._r?.[viewport] || {};
          const nextR = {
            ...(w.props?._r || {}),
            [viewport]: { ...current, ...patch }
          };
          return { ...w, props: { ...w.props, _r: nextR } };
        })
      }))
    })));
    setHasUnsaved(true);
  }

  function openMediaPicker(kind: 'image' | 'video', target: { type: 'background' } | { type: 'widget'; widgetId: string }) {
    setMediaPicker({ open: true, kind, target });
    loadMedia(kind);
  }

  async function loadMedia(kind: 'image' | 'video') {
    try {
      setMediaLoading(true);
      const res = await fetch(`/api/media/list?type=${kind}`);
      const data = await res.json();
      setMediaItems(data.items || []);
    } catch(e) {
      console.error(e);
    } finally {
      setMediaLoading(false);
    }
  }

  function handlePickMedia(url: string) {
    const t = mediaPicker.target;
    if (t.type === 'background') {
      setBackground({ type: 'image', value: url });
      setHasUnsaved(true);
    } else {
      // widget
      updateWidget(t.widgetId, { src: url });
    }
    setMediaPicker(prev => ({ ...prev, open: false }));
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

  function addWidgetToColumn(sectionId: string, columnId: string, type: WidgetType) {
    const widget: Widget = { id: `w_${crypto.randomUUID()}`, type, props: getDefaultProps(type) };
    setSections(prev => prev.map(sec => sec.id !== sectionId ? sec : {
      ...sec,
      columns: sec.columns.map(c => c.id !== columnId ? c : { ...c, widgets: [...c.widgets, widget] })
    }));
    setSelected({ sectionId, columnId, widgetId: widget.id });
    setHasUnsaved(true);
  }

  function deleteSection(sectionId: string) {
    const confirmed = window.confirm('Excluir esta seção? Os widgets dentro dela serão removidos.');
    if (!confirmed) return;
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setSelected(sel => sel.sectionId === sectionId ? {} : sel);
    setHasUnsaved(true);
  }

  function getDefaultProps(type: WidgetType) {
    switch (type) {
      case 'heading': return { text: 'Título', tag: 'h2', align: 'center', color: '#111', size: 36 };
      case 'text': return { text: 'Texto', align: 'center', color: '#333', size: 16 };
      case 'button': return { text: 'Botão', url: '#', align: 'center', bg: '#3b82f6', color: '#fff', radius: 8, padV: 12, padH: 24, width: 200, height: 48 };
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
          content: { builder: 'v2', sections, background }
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Seções</h3>
          <button
            onClick={() => setShowBgSettings(v => !v)}
            className={`p-1.5 rounded border text-xs ${showBgSettings? 'bg-pink-600 border-pink-500 text-white':'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
            title="Fundo da página"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        {showBgSettings && (
          <div className="mb-4 p-3 rounded border border-gray-800 bg-gray-850 bg-gray-800/40">
            <div className="text-xs text-gray-400 mb-2">Fundo da página</div>
            <div className="flex gap-2 mb-3">
              <button onClick={()=>{setBackground(b=>({ ...b, type:'color' })); setHasUnsaved(true);}} className={`px-2 py-1 rounded text-xs ${background.type==='color'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Cor</button>
              <button onClick={()=>{setBackground(b=>({ ...b, type:'image' })); setHasUnsaved(true);}} className={`px-2 py-1 rounded text-xs ${background.type==='image'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Imagem</button>
            </div>
            {background.type==='color' ? (
              <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={background.value} onChange={(e)=>{setBackground({ type:'color', value: e.target.value }); setHasUnsaved(true);}} />
            ) : (
              <div className="space-y-2">
                <input placeholder="https://..." className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm" value={background.value} onChange={(e)=>{setBackground({ type:'image', value: e.target.value }); setHasUnsaved(true);}} />
                <button type="button" onClick={()=>openMediaPicker('image', { type:'background' })} className="text-[11px] text-pink-400 hover:underline">Abrir Biblioteca</button>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1,2,3,4].map(n => (
            <button key={n} onClick={() => addSection(n)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">{n} coluna{n>1?'s':''}</button>
          ))}
        </div>
        <h3 className="text-sm font-semibold mb-3">Widgets</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            {t:'heading',l:'Título', icon: Heading},
            {t:'text',l:'Texto', icon: AlignLeft},
            {t:'button',l:'Botão', icon: MousePointerClick},
            {t:'image',l:'Imagem', icon: Image},
            {t:'video',l:'Vídeo', icon: Video},
            {t:'spacer',l:'Espaço', icon: Square},
            {t:'divider',l:'Divisor', icon: Minus},
            {t:'html',l:'HTML', icon: Code},
            {t:'pixelhot',l:'Pixel Hot', icon: Flame}
          ].map(it => (
            <button
              key={it.t}
              draggable
              onDragStart={(e) => { setDraggingType(it.t as WidgetType); e.dataTransfer.setData('widgetType', String(it.t)); e.dataTransfer.effectAllowed = 'copy'; }}
              onDragEnd={() => setDraggingType(null)}
              onClick={() => addWidget(it.t as WidgetType)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm cursor-grab active:cursor-grabbing flex items-center gap-2 justify-center"
              title="Arraste para uma coluna ou clique para adicionar"
            >
              {it.icon && <it.icon className="w-4 h-4" />}
              <span>{it.l}</span>
            </button>
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
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <button onClick={() => setViewport('desktop')} className={`px-2 py-1 text-xs rounded ${viewport==='desktop'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Desktop</button>
              <button onClick={() => setViewport('tablet')} className={`px-2 py-1 text-xs rounded ${viewport==='tablet'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Tablet</button>
              <button onClick={() => setViewport('mobile')} className={`px-2 py-1 text-xs rounded ${viewport==='mobile'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Mobile</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50 flex items-center gap-1"><Save className="w-4 h-4"/>Salvar</button>
            {page?.isPublished ? (
              <a target="_blank" href={`/site/${project?.subdomain}/${page?.slug}`} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm flex items-center gap-1"><Eye className="w-4 h-4"/>Preview</a>
            ) : null}
          </div>
        </div>

        <div className="p-8 flex justify-center" ref={previewOuterRef}>
          {(() => { const w = viewport==='desktop'? CONTENT_MAX : viewport==='tablet'? 768 : 390; return (
            <div style={{ width: w, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
              <div
                ref={canvasRef}
                className="rounded shadow w-full"
                style={{
                  background: background.type==='color' ? background.value : `url(${background.value})`,
                  backgroundSize: background.type==='image' ? 'cover' : undefined,
                  backgroundPosition: background.type==='image' ? 'center' : undefined,
                  backgroundRepeat: 'no-repeat'
                }}
              >
            {sections.length === 0 && (
              <div className="text-center text-gray-400 py-16">Adicione uma seção para começar</div>
            )}
            {sections.map(sec => (
              <div key={sec.id} className="px-6 py-8 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Seção</span>
                      <button
                        onClick={() => deleteSection(sec.id)}
                        className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                        title="Excluir seção"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir seção
                      </button>
                    </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${sec.columns.length}, 1fr)`, gap: COL_GUTTER }}>
                  {sec.columns.map(col => (
                    <div
                      key={col.id}
                      className={`min-h-[80px] p-3 rounded border ${selected.columnId===col.id? 'border-pink-500':'border-gray-200'} ${draggingType? 'ring-2 ring-pink-300 ring-offset-2 ring-offset-gray-50':''} bg-gray-50`}
                      onClick={() => setSelected({ sectionId: sec.id, columnId: col.id })}
                      onDragOver={(e) => { if (draggingType) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } }}
                      onDrop={(e) => {
                        const t = e.dataTransfer.getData('widgetType') as WidgetType;
                        if (t) addWidgetToColumn(sec.id, col.id, t);
                        setDraggingType(null);
                      }}
                    >
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
          )})()}
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
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any, 'size', 36)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{size:parseInt(e.target.value)||0})}/>
                <label className="block text-gray-400 text-xs mb-1">Cor</label>
                <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.color} onChange={(e)=>updateWidget(selectedWidget.id,{color:e.target.value})}/>
              </>
            )}
            {selectedWidget.type==='text' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">Texto</label>
                <textarea rows={4} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.text} onChange={(e)=>updateWidget(selectedWidget.id,{text:e.target.value})}/>
                <label className="block text-gray-400 text-xs mb-1">Tamanho</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any, 'size', 16)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{size:parseInt(e.target.value)||0})}/>
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-[11px] text-gray-500">Largura (px)</span>
                    <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'width', selectedWidget.props.width || 0)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{width:parseInt(e.target.value)||0})}/>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Altura (px)</span>
                    <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'height', selectedWidget.props.height || 0)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{height:parseInt(e.target.value)||0})}/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-[11px] text-gray-500">Padding Vertical</span>
                    <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'padV', selectedWidget.props.padV || 0)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{padV:parseInt(e.target.value)||0})}/>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Padding Horizontal</span>
                    <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'padH', selectedWidget.props.padH || 0)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{padH:parseInt(e.target.value)||0})}/>
                  </div>
                </div>
              </>
            )}

            {selectedWidget.type==='image' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">URL</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.src || ''} onChange={(e)=>updateWidget(selectedWidget.id,{src:e.target.value})}/>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                  <button type="button" onClick={()=>openMediaPicker('image', { type:'widget', widgetId: selectedWidget!.id })} className="text-pink-400 hover:underline">Abrir Biblioteca</button>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] text-gray-500">Largura (px)</span>
                  <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'width', selectedWidget.props.width || 600)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{width:parseInt(e.target.value)||0})}/>
                </div>
              </>
            )}

            {selectedWidget.type==='video' && (
              <>
                <label className="block text-gray-400 text-xs mb-1">URL</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.src || ''} onChange={(e)=>updateWidget(selectedWidget.id,{src:e.target.value})}/>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                  <button type="button" onClick={()=>openMediaPicker('video', { type:'widget', widgetId: selectedWidget!.id })} className="text-pink-400 hover:underline">Abrir Biblioteca</button>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] text-gray-500">Largura (px)</span>
                  <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'width', selectedWidget.props.width || 720)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{width:parseInt(e.target.value)||0})}/>
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
      {/* Media Picker Modal */}
      {mediaPicker.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setMediaPicker(p=>({ ...p, open:false }))}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[80vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-sm font-medium">Biblioteca ({mediaPicker.kind === 'image' ? 'Imagens' : 'Vídeos'})</div>
              <button className="text-xs px-2 py-1 rounded bg-gray-100" onClick={()=>setMediaPicker(p=>({ ...p, open:false }))}>Fechar</button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(80vh - 48px)' }}>
              {mediaLoading ? (
                <div className="text-gray-500 text-sm">Carregando...</div>
              ) : mediaItems.length === 0 ? (
                <div className="text-gray-500 text-sm">Nenhum arquivo encontrado.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaItems.map((it, idx) => (
                    <button key={idx} onClick={()=>handlePickMedia(it.url)} className="group bg-gray-50 rounded border overflow-hidden text-left">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        {mediaPicker.kind==='image' ? (
                          <img src={it.url} alt={it.name} className="w-full h-full object-cover group-hover:opacity-90" />
                        ) : (
                          <video src={it.url} className="w-full h-full object-cover group-hover:opacity-90" />
                        )}
                      </div>
                      <div className="px-2 py-1 text-[11px] text-gray-700 truncate" title={it.name}>{it.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderWidget(w: Widget) {
    switch (w.type) {
      case 'heading': return <h2 style={{ textAlign:'center', color:w.props.color, fontSize:getR(w, 'size', 36) }}>{w.props.text}</h2>;
      case 'text': return <p style={{ textAlign:'center', color:w.props.color, fontSize:getR(w, 'size', 16) }}>{w.props.text}</p>;
      case 'button': return (
        <div className="flex justify-center">
          <a
            href={w.props.url}
            style={{
              background:w.props.bg,
              color:w.props.color,
              borderRadius:w.props.radius,
              padding:`${getR(w,'padV', w.props.padV)}px ${getR(w,'padH', w.props.padH)}px`,
              width: getR(w,'width', w.props.width),
              height: getR(w,'height', w.props.height),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {w.props.text}
          </a>
        </div>
      );
      case 'image': return (
        <div className="flex justify-center">
          {w.props.src ? <img src={w.props.src} alt={w.props.alt} style={{ maxWidth:getR(w,'width', w.props.width), width:'100%' }}/> : <div className="text-xs text-gray-400">Imagem sem fonte</div>}
        </div>
      );
      case 'video': return (
        <div className="flex justify-center">
          {w.props.src ? <video src={w.props.src} controls style={{ maxWidth:getR(w,'width', w.props.width), width:'100%' }}/> : <div className="text-xs text-gray-400">Vídeo sem fonte</div>}
        </div>
      );
      case 'spacer': return <div style={{ height:w.props.height }}/>; 
      case 'divider': return <hr style={{ borderColor:w.props.color, borderWidth:w.props.thickness, borderStyle:'solid' }}/>; 
      case 'html': return <div dangerouslySetInnerHTML={{ __html: w.props.html }} />;
      case 'pixelhot': return <div className="text-[11px] text-pink-600 bg-pink-100 rounded px-2 py-1 inline-block">Pixel Hot (oculto)</div>;
    }
  }
}
 

