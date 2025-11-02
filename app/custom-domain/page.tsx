'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Globe, 
  Check, 
  X, 
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomDomain {
  _id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  projectId: string;
  createdAt: string;
  verifiedAt?: string;
}

export default function CustomDomainPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      loadDomains();
    }
  }, [status, session, router]);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/custom-domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error('Digite um domínio válido');
      return;
    }

    try {
      setAddingDomain(true);
      const response = await fetch('/api/custom-domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (response.ok) {
        toast.success('Domínio adicionado com sucesso!');
        setNewDomain('');
        await loadDomains();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao adicionar domínio');
      }
    } catch (error) {
      console.error('Erro ao adicionar domínio:', error);
      toast.error('Erro ao adicionar domínio');
    } finally {
      setAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      setVerifying(domainId);
      const response = await fetch(`/api/custom-domains/${domainId}/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Verificação iniciada!');
        await loadDomains();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao verificar domínio');
      }
    } catch (error) {
      console.error('Erro ao verificar domínio:', error);
      toast.error('Erro ao verificar domínio');
    } finally {
      setVerifying(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Tem certeza que deseja remover este domínio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-domains/${domainId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Domínio removido com sucesso!');
        await loadDomains();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover domínio');
      }
    } catch (error) {
      console.error('Erro ao remover domínio:', error);
      toast.error('Erro ao remover domínio');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verificado';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(220, 38, 38, 0.2)' }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(236, 72, 153, 0.2)', animationDelay: '1s' }}></div>
        </div>
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-red-200 text-lg font-medium">Carregando domínios...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(220, 38, 38, 0.2)' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(236, 72, 153, 0.2)', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(168, 85, 247, 0.1)', animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <div 
        className="relative sticky top-0 z-10"
        style={{ 
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(236, 72, 153, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center space-x-2 text-pink-300 hover:text-white transition-all p-2.5 rounded-xl hover:bg-pink-500/20 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">Voltar</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/50">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-red-500 bg-clip-text text-transparent">
                    Domínio Próprio
                  </h1>
                  <p className="text-pink-300/70 text-sm">Conecte seu próprio domínio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Adicionar Domínio */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '2rem',
            marginBottom: '2rem'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Conectar Domínio
            </h2>
          </div>
          
          <p className="text-pink-200/70 mb-6">
            Conecte seu próprio domínio para ter uma URL personalizada para seu projeto.
          </p>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="exemplo.com"
                className="w-full px-4 py-3 bg-slate-900/50 border border-pink-500/30 rounded-xl text-pink-100 placeholder-pink-400/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-slate-900/70 transition-all"
              />
            </div>
            <button
              onClick={handleAddDomain}
              disabled={addingDomain || !newDomain.trim()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg shadow-red-500/50"
            >
              {addingDomain ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {addingDomain ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </div>

        {/* Instruções */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-300 mb-2">Como conectar seu domínio</h3>
              <ol className="text-sm text-blue-200 space-y-2 list-decimal list-inside">
                <li>Adicione seu domínio acima</li>
                <li>Configure os registros DNS conforme instruções</li>
                <li>Verifique a conexão</li>
                <li>Seu domínio estará ativo em até 24 horas</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Lista de Domínios */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '2rem'
          }}
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Meus Domínios
          </h2>

          {domains.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full mb-6">
                <Globe className="h-10 w-10 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Nenhum domínio conectado</h3>
              <p className="text-pink-300/70">Adicione seu primeiro domínio personalizado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain._id}
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-100">{domain.domain}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                          {domain.status === 'verified' && <Check className="h-3 w-3" />}
                          {domain.status === 'pending' && <RefreshCw className="h-3 w-3" />}
                          {domain.status === 'failed' && <X className="h-3 w-3" />}
                          {getStatusText(domain.status)}
                        </span>
                      </div>
                      
                      {domain.status === 'pending' && (
                        <div
                          style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '0.75rem'
                          }}
                        >
                          <h4 className="font-medium text-yellow-300 mb-2">Configuração DNS necessária</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-yellow-200">Tipo: CNAME</span>
                              <button
                                onClick={() => copyToClipboard(`www.${domain.domain}`)}
                                className="text-yellow-300 hover:text-yellow-100 flex items-center gap-1 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                                Copiar
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-yellow-200">Valor: sexyflow.onrender.com</span>
                              <button
                                onClick={() => copyToClipboard('sexyflow.onrender.com')}
                                className="text-yellow-300 hover:text-yellow-100 flex items-center gap-1 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                                Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-gray-400">
                        Adicionado em {new Date(domain.createdAt).toLocaleDateString('pt-BR')}
                        {domain.verifiedAt && (
                          <span> • Verificado em {new Date(domain.verifiedAt).toLocaleDateString('pt-BR')}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {domain.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyDomain(domain._id)}
                          disabled={verifying === domain._id}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-1 transition-colors shadow-lg"
                        >
                          {verifying === domain._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Verificar
                        </button>
                      )}
                      
                      {domain.status === 'verified' && (
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1 transition-colors shadow-lg"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visitar
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteDomain(domain._id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1 transition-colors shadow-lg"
                      >
                        <X className="h-3 w-3" />
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
