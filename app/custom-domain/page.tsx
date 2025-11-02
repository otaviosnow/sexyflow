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

  const [hasPermission, setHasPermission] = useState(true);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/custom-domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
        setHasPermission(true);
      } else if (response.status === 403) {
        const error = await response.json();
        setHasPermission(false);
        setDomains([]);
        console.log('Plano não permite domínio customizado:', error);
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
        if (response.status === 403) {
          toast.error(error.error || 'Seu plano não permite domínio customizado. Faça upgrade para PRO ou ENTERPRISE.', {
            duration: 5000
          });
          setHasPermission(false);
        } else {
          toast.error(error.error || 'Erro ao adicionar domínio');
        }
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Minimalista */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Domínio Próprio</h1>
              <p className="text-sm text-gray-500 mt-1">Conecte seu domínio personalizado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerta de Permissão */}
        {!hasPermission && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-900 font-medium mb-1">
                  Domínio customizado não está disponível no seu plano atual
                </p>
                <p className="text-sm text-yellow-800">
                  Faça upgrade para o plano <strong>PRO</strong> ou <strong>ENTERPRISE</strong> para usar domínios customizados.
                </p>
                <button
                  onClick={() => router.push('/choose-plan')}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Ver Planos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Adição */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="exemplo.com"
                disabled={!hasPermission}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleAddDomain}
              disabled={addingDomain || !newDomain.trim() || !hasPermission}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {addingDomain ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </div>

        {/* Instruções Simples */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Como conectar:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Adicione seu domínio acima</li>
                <li>Configure um registro CNAME apontando www.{'{'}domínio{'}'} para sexyflow.onrender.com</li>
                <li>Clique em "Verificar" após a configuração</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Lista de Domínios */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meus Domínios</h2>
          </div>

          {domains.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum domínio conectado</h3>
              <p className="text-gray-500">Adicione seu primeiro domínio acima</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {domains.map((domain) => (
                <div key={domain._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{domain.domain}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(domain.status)}`}>
                          {domain.status === 'verified' && <Check className="h-3 w-3" />}
                          {domain.status === 'pending' && <RefreshCw className="h-3 w-3" />}
                          {domain.status === 'failed' && <X className="h-3 w-3" />}
                          {getStatusText(domain.status)}
                        </span>
                      </div>
                      
                      {domain.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3 mb-3">
                          <p className="text-sm text-yellow-900 font-medium mb-3">Configuração DNS necessária:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between bg-white rounded p-2">
                              <div>
                                <span className="text-gray-500 text-xs">Nome:</span>
                                <span className="text-gray-900 font-mono ml-2">www.{domain.domain}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(`www.${domain.domain}`)}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between bg-white rounded p-2">
                              <div>
                                <span className="text-gray-500 text-xs">Tipo:</span>
                                <span className="text-gray-900 ml-2">CNAME</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between bg-white rounded p-2">
                              <div>
                                <span className="text-gray-500 text-xs">Valor:</span>
                                <span className="text-gray-900 font-mono ml-2">sexyflow.onrender.com</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard('sexyflow.onrender.com')}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-gray-500">
                        Adicionado em {new Date(domain.createdAt).toLocaleDateString('pt-BR')}
                        {domain.verifiedAt && (
                          <span> • Verificado em {new Date(domain.verifiedAt).toLocaleDateString('pt-BR')}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      {domain.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyDomain(domain._id)}
                          disabled={verifying === domain._id}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                        >
                          {verifying === domain._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            'Verificar'
                          )}
                        </button>
                      )}
                      
                      {domain.status === 'verified' && (
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visitar
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteDomain(domain._id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                      >
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