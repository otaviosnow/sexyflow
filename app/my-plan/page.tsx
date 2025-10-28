'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  X, 
  Zap,
  Star,
  Building,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Subscription {
  _id: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    projects: number;
    pages: number;
    storage: string;
  };
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29.90,
    features: [
      '1 Projeto',
      'Páginas ilimitadas',
      'Templates básicos',
      'Suporte por email',
      'Subdomínio personalizado'
    ],
    limits: {
      projects: 1,
      pages: -1,
      storage: '1GB'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59.90,
    features: [
      '3 Projetos',
      'Páginas ilimitadas',
      'Todos os templates',
      'Suporte prioritário',
      'Subdomínio personalizado',
      'Analytics avançado'
    ],
    limits: {
      projects: 3,
      pages: -1,
      storage: '5GB'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.90,
    features: [
      'Projetos ilimitados',
      'Páginas ilimitadas',
      'Todos os templates',
      'Suporte dedicado',
      'Subdomínio personalizado',
      'Analytics avançado',
      'API personalizada'
    ],
    limits: {
      projects: -1,
      pages: -1,
      storage: '20GB'
    }
  }
];

export default function MyPlanPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      loadSubscription();
    }
  }, [status, session, router]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!subscription) return;

    try {
      setUpgrading(true);
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        toast.success('Upgrade realizado com sucesso!');
        await loadSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao fazer upgrade');
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      toast.error('Erro ao fazer upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  const handleDowngrade = async (planId: string) => {
    if (!subscription) return;

    try {
      setUpgrading(true);
      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        toast.success('Downgrade realizado com sucesso!');
        await loadSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao fazer downgrade');
      }
    } catch (error) {
      console.error('Erro ao fazer downgrade:', error);
      toast.error('Erro ao fazer downgrade');
    } finally {
      setUpgrading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return plans.find(plan => plan.id === subscription.planId);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap className="h-5 w-5" />;
      case 'pro': return <Star className="h-5 w-5" />;
      case 'enterprise': return <Building className="h-5 w-5" />;
      default: return <Crown className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Meu Plano
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plano Atual */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              subscription?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {subscription?.status === 'active' ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
            </div>
          </div>

          {currentPlan ? (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white">
                  {getPlanIcon(currentPlan.id)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
                  <p className="text-gray-600">R$ {currentPlan.price.toFixed(2)}/mês</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Projetos</h4>
                  <p className="text-2xl font-bold text-pink-600">
                    {currentPlan.limits.projects === -1 ? '∞' : currentPlan.limits.projects}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Páginas</h4>
                  <p className="text-2xl font-bold text-pink-600">
                    {currentPlan.limits.pages === -1 ? '∞' : currentPlan.limits.pages}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Armazenamento</h4>
                  <p className="text-2xl font-bold text-pink-600">{currentPlan.limits.storage}</p>
                </div>
              </div>

              {subscription && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informações da Assinatura</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Próxima cobrança:</span>
                      <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium capitalize">{subscription.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano ativo</h3>
              <p className="text-gray-600 mb-4">Escolha um plano para começar a usar o SexyFlow</p>
              <button
                onClick={() => router.push('/choose-plan')}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Escolher Plano
              </button>
            </div>
          )}
        </div>

        {/* Outros Planos */}
        {currentPlan && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Outros Planos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan.id;
                const isUpgrade = plan.price > currentPlan.price;
                const isDowngrade = plan.price < currentPlan.price;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border-2 p-6 ${
                      isCurrentPlan
                        ? 'border-pink-500 bg-pink-50'
                        : plan.popular
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Mais Popular
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Plano Atual
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getPlanIcon(plan.id)}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        R$ {plan.price.toFixed(2)}
                        <span className="text-sm font-normal text-gray-600">/mês</span>
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {!isCurrentPlan && (
                      <button
                        onClick={() => isUpgrade ? handleUpgrade(plan.id) : handleDowngrade(plan.id)}
                        disabled={upgrading}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          isUpgrade
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {upgrading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processando...
                          </div>
                        ) : isUpgrade ? (
                          'Fazer Upgrade'
                        ) : (
                          'Fazer Downgrade'
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
