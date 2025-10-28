'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Globe, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);
    try {
      const response = await fetch('/api/projects/check-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain }),
      });

      const data = await response.json();
      setSubdomainAvailable(data.available);
    } catch (error) {
      console.error('Erro ao verificar subdomínio:', error);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, subdomain: cleanValue }));
    
    if (cleanValue.length >= 3) {
      checkSubdomainAvailability(cleanValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subdomain) {
      toast.error('Nome e subdomínio são obrigatórios');
      return;
    }

    if (subdomainAvailable === false) {
      toast.error('Este subdomínio já está em uso');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // NextAuth cuida da autenticação
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Projeto criado com sucesso!');
        router.push(`/projects/${data.project._id}`);
      } else if (response.status === 402) {
        toast.error('Você precisa escolher um plano primeiro');
        // Redirecionar direto para choose-plan (não pricing)
        router.push('/choose-plan');
      } else {
        toast.error(data.error || 'Erro ao criar projeto');
      }
    } catch (error) {
      toast.error('Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Projetos
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Criar Novo Projeto
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Crie seu primeiro projeto
            </h2>
            <p className="text-sm text-gray-600">
              Cada usuário pode ter um projeto único com seu próprio subdomínio. 
              Exemplo: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">seunegocio.sexyflow.onrender.com</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome do Projeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Projeto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="Ex: Meu Negócio Online"
                required
              />
            </div>

            {/* Subdomínio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdomínio *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 pr-20 text-sm"
                  placeholder="seunegocio"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-xs">.sexyflow.onrender.com</span>
                </div>
              </div>
              
              {/* Status do subdomínio */}
              <div className="mt-2 flex items-center space-x-2">
                {checkingSubdomain && (
                  <>
                    <Loader className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Verificando disponibilidade...</span>
                  </>
                )}
                {!checkingSubdomain && subdomainAvailable === true && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Subdomínio disponível</span>
                  </>
                )}
                {!checkingSubdomain && subdomainAvailable === false && (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Subdomínio já está em uso</span>
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Apenas letras minúsculas, números e hífens. 3-50 caracteres.
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="Descreva seu projeto..."
              />
            </div>

            {/* Aviso importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Importante</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    O subdomínio não poderá ser alterado após a criação. 
                    Certifique-se de escolher um nome que represente bem seu negócio.
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={loading || subdomainAvailable === false || checkingSubdomain || !formData.name || !formData.subdomain}
              className="w-full bg-pink-600 text-white py-2.5 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Criando Projeto...
                </>
              ) : subdomainAvailable === false ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Subdomínio Indisponível
                </>
              ) : checkingSubdomain ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                'Criar Projeto'
              )}
            </button>

            {/* Mensagem de erro para subdomínio em uso */}
            {subdomainAvailable === false && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Subdomínio Indisponível</h4>
                    <p className="text-xs text-red-700 mt-1">
                      O subdomínio <span className="font-mono bg-red-100 px-1 rounded">{formData.subdomain}</span> já está em uso. 
                      Escolha outro subdomínio para continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
