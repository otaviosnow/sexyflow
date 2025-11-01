'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Copy, 
  Trash2, 
  Download,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Folder,
  Eye,
  Link,
  ArrowLeft
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

export default function MediaLibrary() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      loadMediaFiles();
    }
  }, [status, router]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      // Sempre carregar da API (que busca do Dropbox)
      const response = await fetch('/api/media/list');
      if (response.ok) {
        const data = await response.json();
        // Converter formato da API para formato do componente
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
      } else {
        const errorText = await response.text();
        console.error('Erro ao carregar arquivos:', response.status, errorText);
        setMediaFiles([]);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      setMediaFiles([]);
    } finally {
      setLoading(false);
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
        
        // Validar tipo de arquivo
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

        // Validar tamanho (150MB máximo para Dropbox)
        const maxSize = 150 * 1024 * 1024;
        if (file.size > maxSize) {
          setUploadProgress(prev => prev.map(p => 
            p.id === uploadId 
              ? { ...p, status: 'error' as const, error: 'Arquivo muito grande (máx 150MB)' }
              : p
          ));
          return null;
        }

        // Criar FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'library');
        if (session?.user?.id) {
          formData.append('userId', session.user.id);
        }

        // Fazer upload com rastreamento de progresso usando XMLHttpRequest
        return new Promise<MediaFile | null>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Rastrear progresso
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

          // Sucesso
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

                  // Remover da lista após 2 segundos
                  setTimeout(() => {
                    setUploadProgress(prev => prev.filter(p => p.id !== uploadId));
                  }, 2000);

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
              // Erro HTTP
              let errorMsg = `Erro HTTP ${xhr.status}`;
              try {
                const errorData = JSON.parse(xhr.responseText);
                errorMsg = errorData.error || errorMsg;
              } catch (e) {
                // Manter mensagem padrão
              }
              setUploadProgress(prev => prev.map(p => 
                p.id === uploadId 
                  ? { ...p, status: 'error' as const, error: errorMsg }
                  : p
              ));
              reject(new Error(errorMsg));
            }
          });

          // Erro
          xhr.addEventListener('error', () => {
            let errorMsg = 'Erro de rede ao fazer upload';
            try {
              const response = xhr.responseText;
              if (response) {
                const errorData = JSON.parse(response);
                errorMsg = errorData.error || errorMsg;
              }
            } catch (e) {
              // Manter mensagem padrão
            }
            setUploadProgress(prev => prev.map(p => 
              p.id === uploadId 
                ? { ...p, status: 'error' as const, error: errorMsg }
                : p
            ));
            reject(new Error(errorMsg));
          });

          // Abortar
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
      
      // Recarregar arquivos da API após todos os uploads
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isLocalDev && typeof window !== 'undefined') {
        const existingFiles = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        const updatedFiles = existingFiles.filter((file: MediaFile) => file.id !== fileId);
        localStorage.setItem('mediaLibrary', JSON.stringify(updatedFiles));
        setMediaFiles(updatedFiles);
      } else {
        const response = await fetch(`/api/media/${fileId}`, { method: 'DELETE' });
        if (response.ok) {
          loadMediaFiles();
        }
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Voltar</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Mídia</h1>
                <p className="text-gray-600 mt-1">
                  Gerencie suas imagens e vídeos para usar nas páginas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{uploading ? 'Enviando...' : 'Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar arquivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todos</option>
                <option value="image">Imagens</option>
                <option value="video">Vídeos</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barras de Progresso de Upload */}
        {uploadProgress.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviando arquivos...</h2>
            <div className="space-y-4">
              {uploadProgress.map((progress) => (
                <div key={progress.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {progress.status === 'completed' ? (
                        <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : progress.status === 'error' ? (
                        <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate flex-1">
                        {progress.fileName}
                      </span>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                        {progress.status === 'completed' ? 'Concluído' : progress.status === 'error' ? 'Erro' : `${progress.progress}%`}
                      </span>
                    </div>
                    {progress.status === 'error' && (
                      <button
                        onClick={() => setUploadProgress(prev => prev.filter(p => p.id !== progress.id))}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Fechar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        progress.status === 'completed' 
                          ? 'bg-green-500' 
                          : progress.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.status === 'error' && progress.error && (
                    <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Arquivos */}
        {filteredFiles.length === 0 && uploadProgress.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo na biblioteca'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Tente ajustar os filtros de busca'
                : 'Faça upload de suas primeiras imagens e vídeos'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Fazer Upload</span>
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredFiles.map((file) => (
              <div key={file.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {viewMode === 'grid' ? (
                  /* Vista em Grid */
                  <>
                    <div className="aspect-video bg-gray-100 relative">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate mb-2">{file.name}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          <span className="text-xs">Copiar Link</span>
                        </button>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Vista em Lista */
                  <div className="flex items-center p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Video className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        <span className="capitalize">{file.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copiar Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
