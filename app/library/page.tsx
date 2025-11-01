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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchItems();
  }, [status, filter]);

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
      if (data.success) { toast.success('Enviado'); fetchItems(); }
      else toast.error('Falha no upload');
    } catch(e) { console.error(e); toast.error('Erro no upload'); }
    finally { setUploading(false); (e.target as any).value=''; }
  }

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="px-3 py-2 border rounded text-sm bg-white flex items-center gap-1"><ArrowLeft className="w-4 h-4"/>Voltar ao editor</button>
            <h1 className="text-xl font-semibold text-gray-900">Biblioteca</h1>
          </div>
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e)=>setFilter(e.target.value as any)} className="px-3 py-2 border rounded text-sm">
              <option value="all">Todos</option>
              <option value="image">Imagens</option>
              <option value="video">Vídeos</option>
            </select>
            <button onClick={fetchItems} className="px-3 py-2 border rounded text-sm bg-white flex items-center gap-1"><RefreshCcw className="w-4 h-4"/>Atualizar</button>
            <label className="px-3 py-2 bg-pink-600 text-white rounded text-sm cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4"/> Upload
              <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">Nenhum arquivo</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(it => (
              <div key={it.path} className="bg-white border rounded overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                  {it.kind==='image' ? (
                    <img src={it.url} alt={it.name} className="w-full h-full object-cover" />
                  ) : it.kind==='video' ? (
                    <video src={it.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-xs p-4 break-all">{it.name}</div>
                  )}
                </div>
                <div className="p-2 flex items-center justify-between">
                  <div className="text-xs text-gray-700 truncate" title={it.name}>{it.name}</div>
                  <button onClick={() => { navigator.clipboard.writeText(it.url); toast.success('URL copiada'); }} title="Copiar URL" className="p-1 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4 text-gray-600"/>
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


