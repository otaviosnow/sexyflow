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

export default function MediaLibrary() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
      // Em modo de desenvolvimento, carregar do localStorage
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isLocalDev && typeof window !== 'undefined') {
        const storedFiles = localStorage.getItem('mediaLibrary');
        if (storedFiles) {
          const files = JSON.parse(storedFiles);
          setMediaFiles(files);
        }
      } else {
        // Modo produção - carregar da API
        const response = await fetch('/api/media');
        if (response.ok) {
          const files = await response.json();
          setMediaFiles(files);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo de arquivo
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          throw new Error('Apenas imagens e vídeos são permitidos');
        }

        // Validar tamanho (10MB para imagens, 100MB para vídeos)
        const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`Arquivo muito grande. Máximo: ${isImage ? '10MB' : '100MB'}`);
        }

        // Simular upload (em produção, enviaria para servidor)
        const fileUrl = URL.createObjectURL(file);
        const thumbnail = isImage ? fileUrl : undefined;

        const newFile: MediaFile = {
          id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: isImage ? 'image' : 'video',
          url: fileUrl,
          thumbnail,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          tags: []
        };

        return newFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Salvar no localStorage em modo de desenvolvimento
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      if (isLocalDev && typeof window !== 'undefined') {
        const existingFiles = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        const updatedFiles = [...existingFiles, ...uploadedFiles];
        localStorage.setItem('mediaLibrary', JSON.stringify(updatedFiles));
        setMediaFiles(updatedFiles);
      } else {
        // Modo produção - salvar via API
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadedFiles)
        });
        
        if (response.ok) {
          loadMediaFiles();
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro no upload: ' + (error as Error).message);
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

        {/* Lista de Arquivos */}
        {filteredFiles.length === 0 ? (
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
