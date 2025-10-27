'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Layout,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  type: string;
  description?: string;
  previewImage?: string;
  isActive: boolean;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/projects');
      return;
    }

    loadTemplates();
  }, [session, status, router]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates');
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        console.error('Erro ao carregar templates');
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingId(templateId);
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover template da lista
        setTemplates(templates.filter(t => t._id !== templateId));
        alert('Template excluído com sucesso!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao excluir template');
      }
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      alert('Erro ao excluir template. Verifique a conexão.');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Painel
              </button>
              <h1 className="text-2xl font-bold text-white">
                Gerenciar Templates
              </h1>
            </div>
            <button
              onClick={() => router.push('/admin/templates/create')}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Criar Novo Template
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/10 rounded-full mb-4">
              <FileText className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum template criado
            </h3>
            <p className="text-gray-400 mb-6">
              Crie seu primeiro template para começar a construir páginas incríveis!
            </p>
            <button
              onClick={() => router.push('/admin/templates/create')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Criar Primeiro Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template._id}
                className="bg-gray-900 border border-gray-800 hover:border-pink-500/50 rounded-xl transition-all overflow-hidden group"
              >
                {/* Preview Image */}
                <div className="aspect-video bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center border-b border-gray-800">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Layout className="h-12 w-12 text-pink-500" />
                  )}
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {template.name}
                      </h3>
                      <span className="inline-block text-xs font-medium text-pink-400 bg-pink-500/10 px-2 py-1 rounded">
                        {template.type.toUpperCase()}
                      </span>
                    </div>
                    {!template.isActive && (
                      <div title="Template inativo">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Criado por: {template.createdBy?.name || 'Desconhecido'}</p>
                    <p>Em: {new Date(template.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/templates/${template._id}/visual-editor`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      title="Visualizar/Editar"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(template._id)}
                      disabled={deletingId === template._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir"
                    >
                      {deletingId === template._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

