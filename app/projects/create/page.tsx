'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Globe, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Projeto criado com sucesso!');
        router.push(`/projects/${data.project._id}`);
      } else if (response.status === 402) {
        toast.error('Você precisa de uma assinatura ativa para criar projetos');
        router.push('/pricing');
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-sexy-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Criar Novo Projeto
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Crie seu primeiro projeto
            </h2>
            <p className="text-gray-600">
              Cada usuário pode ter um projeto único com seu próprio subdomínio. 
              Exemplo: <span className="font-mono bg-gray-100 px-2 py-1 rounded">seunegocio.sexyflow.onrender.com</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Projeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Projeto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-20"
                  placeholder="seunegocio"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">.sexyflow.onrender.com</span>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Descreva seu projeto..."
              />
            </div>

            {/* Aviso importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Importante</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    O subdomínio não poderá ser alterado após a criação. 
                    Certifique-se de escolher um nome que represente bem seu negócio.
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={loading || subdomainAvailable === false || checkingSubdomain}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Criando Projeto...
                </>
              ) : (
                'Criar Projeto'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
