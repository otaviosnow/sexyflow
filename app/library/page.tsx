'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, Video as VideoIcon, Copy, RefreshCcw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Array<{ name: string; url: string; path: string; kind: 'image'|'video'|'file' }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'image'|'video'>('all');
  const [uploading, setUploading] = useState(false);

  // Forçar fundo escuro - ANTES de qualquer return
  useEffect(() => {
    document.body.style.background = '#0f172a';
    document.body.style.color = '#ffffff';
    document.documentElement.style.background = '#0f172a';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
      document.documentElement.style.background = '';
    };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchItems();
  }, [status, filter]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('dropbox_code');
    if (code) {
      toast.success('Código recebido! Veja abaixo.');
      console.log('🔑 DROPBOX CODE:', code);
      // Limpar URL
      window.history.replaceState({}, '', '/library');
    }
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch(`/api/media/list?type=${filter==='all'?'':filter}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'library');
      if (session?.user?.id) form.append('userId', session.user.id);
      const res = await fetch('/api/upload/dropbox', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.success) { toast.success('Enviado'); fetchItems(); }
      else toast.error(`Falha no upload: ${data?.error || 'erro desconhecido'}`);
    } catch(e) { console.error(e); toast.error('Erro no upload'); }
    finally { setUploading(false); (e.target as any).value=''; }
  }

  if (status === 'loading') return null;

  return (
    <div 
      className="min-h-screen relative" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
        minHeight: '100vh',
        width: '100%',
        overflowY: 'auto',
        zIndex: 1
      }}
    >
      <div className="max-w-5xl mx-auto p-6" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex items-center justify-between mb-6" style={{ 
          background: 'rgba(15, 23, 42, 0.8)', 
          backdropFilter: 'blur(12px)', 
          padding: '1.5rem', 
          borderRadius: '1rem', 
          border: '1px solid rgba(147, 51, 234, 0.3)'
        }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              style={{ 
                padding: '0.5rem 1rem', 
                border: '1px solid rgba(236, 72, 153, 0.3)', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem', 
                background: 'rgba(30, 41, 59, 0.9)', 
                color: '#e9d5ff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowLeft className="w-4 h-4"/>Voltar ao editor
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e9d5ff' }}>Biblioteca</h1>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filter} 
              onChange={(e)=>setFilter(e.target.value as any)} 
              style={{ 
                padding: '0.5rem 1rem', 
                border: '1px solid rgba(236, 72, 153, 0.3)', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem',
                background: 'rgba(30, 41, 59, 0.9)',
                color: '#e9d5ff'
              }}
            >
              <option value="all" style={{ background: '#1e293b' }}>Todos</option>
              <option value="image" style={{ background: '#1e293b' }}>Imagens</option>
              <option value="video" style={{ background: '#1e293b' }}>Vídeos</option>
            </select>
            <button 
              onClick={fetchItems} 
              style={{ 
                padding: '0.5rem 1rem', 
                border: '1px solid rgba(236, 72, 153, 0.3)', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem', 
                background: 'rgba(30, 41, 59, 0.9)', 
                color: '#e9d5ff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCcw className="w-4 h-4"/>Atualizar
            </button>
            <label style={{ 
              padding: '0.5rem 1rem', 
              background: 'linear-gradient(to right, #dc2626, #ec4899)', 
              color: 'white', 
              borderRadius: '0.5rem', 
              fontSize: '0.875rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem'
            }}>
              <Upload className="w-4 h-4"/> Upload
              <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dropbox_code') && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-900 mb-2">✅ Código OAuth recebido!</p>
            <p className="text-xs text-blue-700 mb-2">Copie o código abaixo e use no curl para gerar o refresh_token:</p>
            <code className="block p-2 bg-white border rounded text-xs font-mono break-all">
              {new URLSearchParams(window.location.search).get('dropbox_code')}
            </code>
          </div>
        )}

        {loading ? (
          <div style={{ color: '#c084fc', textAlign: 'center', padding: '3rem' }}>Carregando...</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#c084fc', textAlign: 'center', padding: '3rem' }}>Nenhum arquivo</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(it => (
              <div 
                key={it.path} 
                style={{ 
                  background: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(236, 72, 153, 0.3)', 
                  borderRadius: '0.75rem', 
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(236, 72, 153, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="aspect-video flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0f172a, #581c87)' }}>
                  {it.kind==='image' ? (
                    <img src={it.url} alt={it.name} className="w-full h-full object-cover" />
                  ) : it.kind==='video' ? (
                    <video src={it.url} className="w-full h-full object-cover" />
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '1rem', wordBreak: 'break-all' }}>{it.name}</div>
                  )}
                </div>
                <div className="p-2 flex items-center justify-between">
                  <div style={{ fontSize: '0.75rem', color: '#e9d5ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.name}>{it.name}</div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(it.url); toast.success('URL copiada'); }} 
                    title="Copiar URL" 
                    style={{ 
                      padding: '0.25rem', 
                      borderRadius: '0.25rem',
                      color: '#c084fc'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Copy className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


