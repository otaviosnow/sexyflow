'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Eye, Save, Settings, Trash2, Type, X, Heading, AlignLeft, MousePointerClick, Image, Video, Square, Minus, Code, Flame, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// EDITOR V2 (mesmo sistema dos usuários) — Seções > Colunas > Widgets
type WidgetType = 'heading' | 'text' | 'button' | 'image' | 'video' | 'spacer' | 'divider' | 'html' | 'pixelhot';

interface Widget { id: string; type: WidgetType; props: any; }
interface Column { id: string; widgets: Widget[]; }
interface Section { id: string; columns: Column[]; }

interface TemplateDoc {
  _id: string;
  name: string;
  type?: string;
  description?: string;
  content: any;
  previewImage?: string;
  isActive?: boolean;
}

export default function VisualEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [template, setTemplate] = useState<TemplateDoc | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<{ sectionId?: string; columnId?: string; widgetId?: string }>({});
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
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    if (status === 'authenticated') { load(); }
  }, [status]);

  async function load() {
    try {
      const res = await fetch(`/api/admin/templates/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data);
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
      toast.error('Erro ao carregar template');
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
      if (!res.ok) {
        console.error('Erro ao buscar mídia:', res.status, res.statusText);
        toast.error('Erro ao carregar biblioteca');
        setMediaItems([]);
        return;
      }
      const data = await res.json();
      const items = data.items || [];
      setMediaItems(items);
    } catch(e) {
      console.error('❌ Erro ao carregar mídia:', e);
      toast.error('Erro ao carregar biblioteca');
      setMediaItems([]);
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
    if (!template) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/templates/${params.id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          content: { builder: 'v2', sections, background },
          type: template.type || 'presell',
          description: template.description || '',
          previewImage: template.previewImage || '',
          isActive: template.isActive !== undefined ? template.isActive : true
        })
      });
      if (res.ok) { 
        toast.success('Template salvo com sucesso!'); 
        setHasUnsaved(false);
        // Recarregar para garantir sincronização
        load();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erro ao salvar template');
      }
    } catch(e) { 
      console.error(e); 
      toast.error('Erro ao salvar template'); 
    }
    finally { 
      setSaving(false); 
    }
  }

  // UI helpers
  const selectedWidget = (() => {
    if (!selected.widgetId) return null;
    for (const s of sections) for (const c of s.columns) {
      const w = c.widgets.find(x => x.id === selected.widgetId); if (w) return w;
    }
    return null;
  })();

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar Esquerda - Alterna entre Widgets e Propriedades */}
      <aside className={`w-72 border-r border-gray-800 bg-gray-900 p-4 transition-all duration-300`}>
        {/* Header com botão de voltar quando propriedades estão visíveis */}
        {selectedWidget && (
          <div className="mb-4">
            <button
              onClick={() => setSelected({ sectionId: selected.sectionId, columnId: selected.columnId })}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-3"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar para Widgets
            </button>
            <h3 className="text-sm font-semibold">Propriedades</h3>
          </div>
        )}
        
        {/* Barra de Widgets - só mostra quando nenhum widget está selecionado */}
        {!selectedWidget && (
          <>
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
              <div className="mb-4 p-3 rounded border border-gray-800 bg-gray-800/40">
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
          </>
        )}

        {/* Barra de Propriedades - só mostra quando widget está selecionado */}
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
                {selectedWidget.props.src ? (
                  <>
                    <label className="block text-gray-400 text-xs mb-2">Preview</label>
                    <div className="mb-3 rounded border border-gray-700 overflow-hidden bg-gray-800">
                      <img 
                        src={selectedWidget.props.src} 
                        alt="Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW0gaW52w6FsaWRhPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={()=>openMediaPicker('image', { type:'widget', widgetId: selectedWidget!.id })}
                      className="w-full mb-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 hover:text-white transition-colors border border-gray-700"
                    >
                      Trocar Imagem
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={()=>openMediaPicker('image', { type:'widget', widgetId: selectedWidget!.id })}
                    className="w-full mb-3 px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-sm text-white transition-colors"
                  >
                    Selecionar Imagem
                  </button>
                )}
                <label className="block text-gray-400 text-xs mb-1">URL</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.src || ''} onChange={(e)=>updateWidget(selectedWidget.id,{src:e.target.value})}/>
                <div className="mt-2">
                  <span className="text-[11px] text-gray-500">Largura (px)</span>
                  <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={getR(selectedWidget as any,'width', selectedWidget.props.width || 600)} onChange={(e)=>updateWidgetResponsive(selectedWidget!.id,{width:parseInt(e.target.value)||0})}/>
                </div>
              </>
            )}
            {selectedWidget.type==='video' && (
              <>
                {selectedWidget.props.src ? (
                  <>
                    <label className="block text-gray-400 text-xs mb-2">Preview</label>
                    <div className="mb-3 rounded border border-gray-700 overflow-hidden bg-gray-800 aspect-video flex items-center justify-center">
                      <video 
                        src={selectedWidget.props.src} 
                        className="w-full h-full max-h-48 object-contain"
                        controls={false}
                        muted
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.currentTime = 1;
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message flex items-center justify-center h-full text-gray-500 text-sm';
                            errorDiv.textContent = 'Vídeo inválido';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={()=>openMediaPicker('video', { type:'widget', widgetId: selectedWidget!.id })}
                      className="w-full mb-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 hover:text-white transition-colors border border-gray-700"
                    >
                      Trocar Vídeo
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={()=>openMediaPicker('video', { type:'widget', widgetId: selectedWidget!.id })}
                    className="w-full mb-3 px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-sm text-white transition-colors"
                  >
                    Selecionar Vídeo
                  </button>
                )}
                <label className="block text-gray-400 text-xs mb-1">URL</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.src || ''} onChange={(e)=>updateWidget(selectedWidget.id,{src:e.target.value})}/>
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
                <label className="block text-gray-400 text-xs mb-1">Valor da Compra</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.purchaseValue} onChange={(e)=>updateWidget(selectedWidget.id,{purchaseValue:parseFloat(e.target.value)||0})}/>
                <label className="block text-gray-400 text-xs mb-1">Moeda</label>
                <input className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700" value={selectedWidget.props.currency} onChange={(e)=>updateWidget(selectedWidget.id,{currency:e.target.value})}/>
              </>
            )}
          </div>
        )}
      </aside>

      {/* Canvas */}
      <main className="flex-1 bg-gray-100 text-gray-900 overflow-auto">
        <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/templates')} className="text-gray-300 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4"/> Voltar
            </button>
            {hasUnsaved && <span className="text-xs text-yellow-400">• Não salvo</span>}
            <span className="text-sm text-gray-400">{template?.name || 'Template'}</span>
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <button onClick={() => setViewport('desktop')} className={`px-2 py-1 text-xs rounded ${viewport==='desktop'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Desktop</button>
              <button onClick={() => setViewport('tablet')} className={`px-2 py-1 text-xs rounded ${viewport==='tablet'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Tablet</button>
              <button onClick={() => setViewport('mobile')} className={`px-2 py-1 text-xs rounded ${viewport==='mobile'?'bg-pink-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Mobile</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50 flex items-center gap-1">
              <Save className="w-4 h-4"/>{saving ? 'Salvando...' : 'Salvar'}
            </button>
            <a target="_blank" href={`/admin/templates/${params.id}/preview`} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm flex items-center gap-1">
              <Eye className="w-4 h-4"/>Preview
            </a>
          </div>
        </div>

        <div className="p-8 flex justify-center" ref={previewOuterRef}>
          {(() => { const w = viewport==='desktop'? CONTENT_MAX : viewport==='tablet'? 768 : 390; return (
            <div style={{ width: w, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
              <div
                ref={canvasRef}
                className="rounded shadow w-full"
                style={{
                  minHeight: '800px', // Altura mínima inicial para garantir que imagens de fundo não sejam cortadas
                  // Altura cresce automaticamente conforme elementos são adicionados
                  background: background.type==='color' ? background.value : `url(${background.value})`,
                  backgroundSize: background.type==='image' ? 'cover' : undefined,
                  backgroundPosition: background.type==='image' ? 'center' : undefined,
                  backgroundRepeat: 'no-repeat',
                  backgroundAttachment: background.type==='image' ? 'fixed' : undefined // Mantém imagem fixa durante scroll
                }}
              >
                {sections.length === 0 && (
                  <div className="text-center text-gray-400 py-16 min-h-[600px] flex items-center justify-center">Adicione uma seção para começar</div>
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
                          className={`min-h-[80px] p-3 rounded border ${selected.columnId===col.id? 'border-pink-500':'border-gray-300 border-dashed'} ${draggingType? 'ring-2 ring-pink-300 ring-offset-2 ring-offset-transparent':''} bg-transparent hover:bg-gray-50/50 transition-colors`}
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
