'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Camera, Mail, Folder, FileText } from 'lucide-react';

interface ProfileData {
  email: string;
  name: string;
  avatarUrl: string;
  projectsCount: number;
  pagesCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      load();
    }
  }, [status]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: base64 })
        });
        setData((d) => (d ? { ...d, avatarUrl: base64 } : d));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!session || !data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 py-4">
            <button onClick={() => router.push('/projects')} className="text-gray-600 hover:text-gray-900 text-sm flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos Projetos
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Perfil</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
        {/* Card Avatar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 mb-4">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover border" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border text-gray-400 text-3xl">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full p-2 cursor-pointer shadow">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} disabled={uploading} />
              </label>
            </div>
            <p className="text-lg font-semibold text-gray-900">{session.user?.name}</p>
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
              <Mail className="w-4 h-4" />
              <span>{data.email}</span>
            </div>
          </div>
        </div>

        {/* Card Estatísticas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Resumo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 bg-gray-50 flex items-center gap-3">
              <div className="p-2 rounded bg-white border">
                <Folder className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{data.projectsCount}</p>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-gray-50 flex items-center gap-3">
              <div className="p-2 rounded bg-white border">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Páginas</p>
                <p className="text-2xl font-bold text-gray-900">{data.pagesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


