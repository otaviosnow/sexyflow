'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  Users,
  FileText,
  Palette,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  type: string;
  description?: string;
  previewImage?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'users' | 'settings'>('templates');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Verificar se é admin
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        // Tentar carregar do localStorage primeiro
        if (typeof window !== 'undefined') {
          const storedTemplates = localStorage.getItem('mockTemplates');
          if (storedTemplates) {
            try {
              const templates = JSON.parse(storedTemplates);
              setTemplates(templates);
              setLoading(false);
              return;
            } catch (error) {
              console.error('Erro ao carregar templates do localStorage:', error);
            }
          }
        }
        fetchTemplates();
      }
    }
  }, [status, session, router]);

  // Recarregar templates quando a página ganha foco (volta da edição)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Página ganhou foco, recarregando templates...');
      if (typeof window !== 'undefined') {
        // Primeiro, tentar carregar templates individuais do localStorage
        const templateKeys = Object.keys(localStorage).filter(key => key.startsWith('template_'));
        console.log('🔑 Chaves de templates encontradas:', templateKeys);
        
        if (templateKeys.length > 0) {
          const updatedTemplates = templates.map(template => {
            const templateKey = `template_${template._id}`;
            const savedData = localStorage.getItem(templateKey);
            
            if (savedData) {
              try {
                const savedTemplate = JSON.parse(savedData);
                console.log(`📝 Template ${template._id} atualizado:`, savedTemplate.name);
                return {
                  ...template,
                  name: savedTemplate.name,
                  type: savedTemplate.type || template.type,
                  description: savedTemplate.description || template.description,
                  updatedAt: savedTemplate.updatedAt || template.createdAt
                };
              } catch (error) {
                console.error(`Erro ao carregar template ${template._id}:`, error);
                return template;
              }
            }
            return template;
          });
          
          console.log('🔄 Templates atualizados:', updatedTemplates);
          setTemplates(updatedTemplates);
          
          // Salvar lista atualizada no localStorage
          localStorage.setItem('mockTemplates', JSON.stringify(updatedTemplates));
        } else {
          // Fallback: carregar do mockTemplates
          const storedTemplates = localStorage.getItem('mockTemplates');
          if (storedTemplates) {
            try {
              const templates = JSON.parse(storedTemplates);
              console.log('📋 Templates carregados do localStorage:', templates);
              setTemplates(templates);
            } catch (error) {
              console.error('Erro ao recarregar templates:', error);
            }
          }
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [templates]);

  const fetchTemplates = async () => {
    try {
      // Em modo de desenvolvimento, carregar do localStorage primeiro
      const isLocalDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isLocalDev && typeof window !== 'undefined') {
        const storedTemplates = localStorage.getItem('mockTemplates');
        if (storedTemplates) {
          try {
            const templates = JSON.parse(storedTemplates);
            setTemplates(templates);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Erro ao carregar templates do localStorage:', error);
          }
        }
      }

      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        
        // Salvar no localStorage para persistência local
        if (typeof window !== 'undefined') {
          localStorage.setItem('mockTemplates', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover do localStorage em desenvolvimento local
        if (typeof window !== 'undefined') {
          const storedTemplates = JSON.parse(localStorage.getItem('mockTemplates') || '[]');
          const updatedTemplates = storedTemplates.filter((template: any) => template._id !== id);
          localStorage.setItem('mockTemplates', JSON.stringify(updatedTemplates));
        }
        
        // Atualizar a lista local
        setTemplates(prev => prev.filter(template => template._id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  };

  const toggleTemplateStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      presell: 'Presell',
      preview: 'Prévia',
      'post-sale-x': 'Pós-venda X',
      delivery: 'Entrega',
      'post-sale-y': 'Pós-venda Y'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      presell: 'bg-red-100 text-red-800',
      preview: 'bg-blue-100 text-blue-800',
      'post-sale-x': 'bg-green-100 text-green-800',
      delivery: 'bg-yellow-100 text-yellow-800',
      'post-sale-y': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">SexyFlow</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Templates</h2>
                <p className="text-gray-600 mt-1">
                  Crie e edite templates responsivos para diferentes tipos de páginas
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/templates/create')}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Template</span>
              </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Preview Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {template.previewImage ? (
                      <img 
                        src={template.previewImage} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <span className="text-sm">Sem preview</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {template.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                          {getTypeLabel(template.type)}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleTemplateStatus(template._id, template.isActive)}
                        className={`p-1.5 rounded-full transition-colors ${
                          template.isActive 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={template.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <div className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </button>
                    </div>

                    {template.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    {/* Responsive Indicators */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Smartphone className="h-3 w-3" />
                        <span>Mobile</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Tablet className="h-3 w-3" />
                        <span>Tablet</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Monitor className="h-3 w-3" />
                        <span>Desktop</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/templates/${template._id}/visual-editor`)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Editor Visual"
                        >
                          <Palette className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/templates/${template._id}/edit`)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar Código"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/templates/${template._id}/preview`)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => deleteTemplate(template._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template criado</h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro template responsivo
                </p>
                <button
                  onClick={() => router.push('/admin/templates/create')}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Criar Primeiro Template</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gerenciar Usuários</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações do Sistema</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
}
