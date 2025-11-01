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
  Loader2
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

const CACHE_KEY = 'mediaLibrary_cache';
const CACHE_TIMESTAMP_KEY = 'mediaLibrary_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadMediaFiles(true);
    }
  }, [status, router]);

  const loadMediaFiles = async (useCache = false) => {
    // Carregar do cache primeiro se disponível
    if (useCache && typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < CACHE_DURATION) {
          try {
            const files = JSON.parse(cached);
            setMediaFiles(files);
            setInitialLoad(false);
            // Atualizar em background
            setTimeout(() => loadMediaFiles(false), 100);
            return;
          } catch (e) {
            // Cache inválido, continuar com API
          }
        }
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/media/list');
      if (response.ok) {
        const data = await response.json();
        const files: MediaFile[] = (data.items || []).map((item: any) => ({
          id: item.path || item.name,
          name: item.name,
          type: item.kind === 'image' ? 'image' as const : 'video' as const,
          url: item.url,
          size: item.size || 0,
          uploadedAt: item.uploadedAt || new Date().toISOString(),
          tags: item.tags || []
        }));
        setMediaFiles(files);
        
        // Salvar no cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(files));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
      
      setTimeout(() => {
        loadMediaFiles(false);
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
    // Reset input
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

  const deleteFile = async (fileId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      const response = await fetch(`/api/media/${fileId}`, { method: 'DELETE' });
      if (response.ok) {
        // Limpar cache e recarregar
        if (typeof window !== 'undefined') {
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        }
        loadMediaFiles(false);
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="text-gray-600 text-sm">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Moderno */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all p-2 rounded-xl hover:bg-gray-100/80"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">Voltar</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Biblioteca
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Gerencie suas mídias
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
              <span className="font-medium">{uploading ? 'Enviando...' : 'Upload'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barras de Progresso Modernas */}
        {uploadProgress.length > 0 && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                <span>Enviando arquivos</span>
              </h2>
              <span className="text-sm text-gray-500">{uploadProgress.length} arquivo(s)</span>
            </div>
            <div className="space-y-4">
              {uploadProgress.map((progress) => (
                <div key={progress.id} className="space-y-2 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {progress.status === 'completed' ? (
                        <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-green-500" />
                      ) : progress.status === 'error' ? (
                        <XCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
                      ) : (
                        <Loader2 className="flex-shrink-0 w-5 h-5 text-red-600 animate-spin" />
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate flex-1">
                        {progress.fileName}
                      </span>
                      <span className="text-sm font-semibold text-gray-600 whitespace-nowrap ml-3">
                        {progress.status === 'completed' ? '100%' : progress.status === 'error' ? 'Erro' : `${progress.progress}%`}
                      </span>
                    </div>
                    {progress.status === 'error' && (
                      <button
                        onClick={() => setUploadProgress(prev => prev.filter(p => p.id !== progress.id))}
                        className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Fechar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out rounded-full ${
                        progress.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                          : progress.status === 'error'
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : 'bg-gradient-to-r from-red-600 to-red-700'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.status === 'error' && progress.error && (
                    <p className="text-xs text-red-600 mt-1 ml-8">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros Modernos */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="image">Imagens</option>
                <option value="video">Vídeos</option>
              </select>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Arquivos Moderno */}
        {loading && mediaFiles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : filteredFiles.length === 0 && uploadProgress.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Folder className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Nenhum arquivo encontrado' : 'Biblioteca vazia'}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchQuery 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece fazendo upload de suas primeiras mídias'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                className="group bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 right-3">
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-all backdrop-blur-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 truncate mb-2 text-sm">{file.name}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all text-xs font-medium"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar</span>
                        </button>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center p-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4 overflow-hidden flex-shrink-0">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1.5">
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
                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                        title="Copiar Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
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