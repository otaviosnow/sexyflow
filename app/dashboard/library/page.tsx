'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Copy, 
  Trash2, 
  Search,
  Grid,
  List,
  Plus,
  Folder,
  Eye,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  size: number;
  uploadedAt: string;
  tags?: string[];
}

interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

// Cache removido - sempre buscar diretamente do Dropbox

export default function MediaLibrary() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadMediaFiles();
    }
  }, [status, router]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      // Sempre buscar diretamente do Dropbox (via API)
      const response = await fetch('/api/media/list');
      if (response.ok) {
        const data = await response.json();
        const files: MediaFile[] = (data.items || []).map((item: any) => ({
          id: item.path || item.name, // path_lower do Dropbox (ex: /library/users/{userId}/arquivo.png)
          name: item.name,
          type: item.kind === 'image' ? 'image' as const : 'video' as const,
          url: item.url, // URL do Dropbox
          size: item.size || 0,
          uploadedAt: item.uploadedAt || new Date().toISOString(),
          tags: item.tags || []
        }));
        setMediaFiles(files);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      setMediaFiles([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    const fileArray = Array.from(files);
    
    // Inicializar barras de progresso
    const initialProgress: UploadProgress[] = fileArray.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    setUploadProgress(initialProgress);

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        const uploadId = initialProgress[index].id;
        
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          setUploadProgress(prev => prev.map(p => 
            p.id === uploadId 
              ? { ...p, status: 'error' as const, error: 'Tipo de arquivo não permitido' }
              : p
          ));
          return null;
        }

        const maxSize = 150 * 1024 * 1024;
        if (file.size > maxSize) {
          setUploadProgress(prev => prev.map(p => 
            p.id === uploadId 
              ? { ...p, status: 'error' as const, error: 'Arquivo muito grande (máx 150MB)' }
              : p
          ));
          return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'library');
        if (session?.user?.id) {
          formData.append('userId', session.user.id);
        }

        return new Promise<MediaFile | null>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(prev => prev.map(p => 
                p.id === uploadId 
                  ? { ...p, progress: percentComplete }
                  : p
              ));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                
                if (result.success && result.url) {
                  setUploadProgress(prev => prev.map(p => 
                    p.id === uploadId 
                      ? { ...p, progress: 100, status: 'completed' as const, url: result.url }
                      : p
                  ));

                  setTimeout(() => {
                    setUploadProgress(prev => prev.filter(p => p.id !== uploadId));
                  }, 3000);

                  resolve({
                    id: result.path || result.fileName,
                    name: result.fileName || file.name,
                    type: isImage ? 'image' as const : 'video' as const,
                    url: result.url,
                    thumbnail: isImage ? result.url : undefined,
                    size: result.size || file.size,
                    uploadedAt: new Date().toISOString(),
                    tags: []
                  });
                } else {
                  throw new Error(result.error || 'Erro ao obter URL');
                }
              } catch (e) {
                const errorMsg = e instanceof Error ? e.message : 'Erro ao processar resposta';
                setUploadProgress(prev => prev.map(p => 
                  p.id === uploadId 
                    ? { ...p, status: 'error' as const, error: errorMsg }
                    : p
                ));
                reject(new Error(errorMsg));
              }
            } else {
              let errorMsg = `Erro HTTP ${xhr.status}`;
              try {
                const errorData = JSON.parse(xhr.responseText);
                errorMsg = errorData.error || errorMsg;
              } catch (e) {}
              setUploadProgress(prev => prev.map(p => 
                p.id === uploadId 
                  ? { ...p, status: 'error' as const, error: errorMsg }
                  : p
              ));
              reject(new Error(errorMsg));
            }
          });

          xhr.addEventListener('error', () => {
            let errorMsg = 'Erro de rede ao fazer upload';
            try {
              const response = xhr.responseText;
              if (response) {
                const errorData = JSON.parse(response);
                errorMsg = errorData.error || errorMsg;
              }
            } catch (e) {}
            setUploadProgress(prev => prev.map(p => 
              p.id === uploadId 
                ? { ...p, status: 'error' as const, error: errorMsg }
                : p
            ));
            reject(new Error(errorMsg));
          });

          xhr.addEventListener('abort', () => {
            setUploadProgress(prev => prev.map(p => 
              p.id === uploadId 
                ? { ...p, status: 'error' as const, error: 'Upload cancelado' }
                : p
            ));
            reject(new Error('Upload cancelado'));
          });

          xhr.open('POST', '/api/upload/dropbox');
          xhr.send(formData);
        });
      });

      await Promise.all(uploadPromises);
      
      // Limpar cache e recarregar
      setTimeout(() => {
        loadMediaFiles();
      }, 1000);
      
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Você pode adicionar um toast aqui
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.')) return;

    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
    
    setDeletingFiles(prev => new Set(prev).add(path));

    try {
      const response = await fetch('/api/upload/dropbox', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      if (response.ok) {
        setMediaFiles(prev => prev.filter(file => file.id !== filePath && file.id !== path));
        
        setTimeout(() => {
          loadMediaFiles();
        }, 500);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir arquivo do Dropbox');
        loadMediaFiles();
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      alert('Erro ao excluir arquivo. Tente novamente.');
      loadMediaFiles();
    } finally {
      setDeletingFiles(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (status === 'loading' || initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)]"></div>
        <div className="flex flex-col items-center space-y-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
          <p className="text-purple-200 text-lg font-medium">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Tech */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 shadow-2xl shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-purple-300 hover:text-white transition-all p-2.5 rounded-xl hover:bg-purple-500/20 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">Voltar</span>
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center space-x-2">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                  <span>Biblioteca Digital</span>
                </h1>
                <p className="text-purple-300/70 text-sm mt-1 flex items-center space-x-2">
                  <Zap className="h-3 w-3" />
                  <span>Seu acervo de mídias em nuvem</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center space-x-2">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
                )}
                <span>{uploading ? 'Enviando...' : 'Upload'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress Bars Tech */}
        {uploadProgress.length > 0 && (
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center space-x-2">
                <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                <span>Transferência em Progresso</span>
              </h2>
              <span className="text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">{uploadProgress.length} arquivo(s)</span>
            </div>
            <div className="space-y-4">
              {uploadProgress.map((progress) => (
                <div key={progress.id} className="space-y-3 p-5 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 transition-all border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {progress.status === 'completed' ? (
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-green-400/50">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : progress.status === 'error' ? (
                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-red-400/50">
                          <XCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span className="text-sm font-medium text-purple-100 truncate flex-1">
                        {progress.fileName}
                      </span>
                      <span className="text-sm font-bold text-purple-300 whitespace-nowrap ml-3 bg-purple-500/20 px-2.5 py-1 rounded-lg">
                        {progress.status === 'completed' ? '100%' : progress.status === 'error' ? 'Erro' : `${progress.progress}%`}
                      </span>
                    </div>
                    {progress.status === 'error' && (
                      <button
                        onClick={() => setUploadProgress(prev => prev.filter(p => p.id !== progress.id))}
                        className="ml-3 p-2 text-purple-300 hover:text-white rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Fechar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden border border-purple-500/20">
                    <div
                      className={`h-full transition-all duration-500 ease-out rounded-full ${
                        progress.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50' 
                          : progress.status === 'error'
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-lg shadow-purple-500/50 animate-pulse'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.status === 'error' && progress.error && (
                    <p className="text-xs text-red-400 mt-1 ml-9">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters Tech */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-purple-500/30 rounded-xl text-purple-100 placeholder-purple-400/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-slate-900/70 transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3.5 bg-slate-900/50 border border-purple-500/30 rounded-xl text-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-slate-900/70 transition-all cursor-pointer"
              >
                <option value="all" className="bg-slate-800">Todos</option>
                <option value="image" className="bg-slate-800">Imagens</option>
                <option value="video" className="bg-slate-800">Vídeos</option>
              </select>
              <div className="flex items-center space-x-2 bg-slate-900/50 rounded-xl p-1 border border-purple-500/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Tech */}
        {loading && mediaFiles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
          </div>
        ) : filteredFiles.length === 0 && uploadProgress.length === 0 ? (
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                <Folder className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                {searchQuery ? 'Nenhum arquivo encontrado' : 'Biblioteca vazia'}
              </h3>
              <p className="text-purple-300/70 mb-8">
                {searchQuery 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece fazendo upload de suas primeiras mídias'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 font-semibold"
                >
                  <Plus className="h-5 w-5" />
                  <span>Fazer Upload</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredFiles.map((file) => (
              <div 
                key={file.id} 
                className="group relative bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-500/30 overflow-hidden hover:border-purple-500/60 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-gradient-to-br from-slate-900 to-purple-900 relative overflow-hidden">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-20 w-20 text-purple-400/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 right-4">
                          <button
                            onClick={() => deleteFile(file.id)}
                            disabled={deletingFiles.has(file.id) || deletingFiles.has(`/${file.id}`)}
                            className="p-3 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-all backdrop-blur-sm disabled:opacity-50 shadow-lg"
                            title="Excluir arquivo"
                          >
                            {deletingFiles.has(file.id) || deletingFiles.has(`/${file.id}`) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-800/50">
                      <h3 className="font-semibold text-purple-100 truncate mb-3 text-sm">{file.name}</h3>
                      <div className="flex items-center justify-between text-xs text-purple-300/70 mb-4">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl transition-all text-xs font-medium border border-purple-500/30"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar</span>
                        </button>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl transition-all border border-purple-500/30"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center p-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl flex items-center justify-center mr-5 overflow-hidden flex-shrink-0 border border-purple-500/30">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Video className="h-10 w-10 text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 mr-5">
                      <h3 className="font-semibold text-purple-100 truncate">{file.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-purple-300/70 mt-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span className="capitalize">{file.type === 'image' ? 'Imagem' : 'Vídeo'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2.5 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-xl transition-all border border-purple-500/30"
                        title="Copiar Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2.5 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-xl transition-all border border-purple-500/30"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        disabled={deletingFiles.has(file.id) || deletingFiles.has(`/${file.id}`)}
                        className="p-2.5 text-purple-300 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/30 disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingFiles.has(file.id) || deletingFiles.has(`/${file.id}`) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input de Upload (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}