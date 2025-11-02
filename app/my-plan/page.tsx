'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  X, 
  Star,
  Phone,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PLANS, getPlanByNameAndBilling } from '@/lib/models/Plan';

interface Subscription {
  _id: string;
  planId: string;
  realPlanName?: 'STARTER' | 'PRO' | 'ENTERPRISE';
  billingCycle?: 'monthly' | 'yearly';
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export default function MyPlanPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
        // Se a subscription tem billingCycle, usar ele como padrão
        if (data.billingCycle) {
          setBillingCycle(data.billingCycle);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    if (!subscription || planName === 'ENTERPRISE') {
      if (planName === 'ENTERPRISE') {
        window.open('https://wa.me/5531997783097?text=Olá, gostaria de conversar sobre o plano Enterprise do SexyFlow', '_blank');
        return;
      }
      return;
    }

    try {
      setUpgrading(true);
      const plan = getPlanByNameAndBilling(planName, billingCycle);
      if (!plan) {
        toast.error('Plano não encontrado');
        return;
      }

      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: plan._id }),
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

  const handleDowngrade = async (planName: 'STARTER' | 'PRO') => {
    if (!subscription) return;

    try {
      setUpgrading(true);
      const plan = getPlanByNameAndBilling(planName, billingCycle);
      if (!plan) {
        toast.error('Plano não encontrado');
        return;
      }

      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: plan._id }),
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
    if (!subscription?.realPlanName) return null;
    const cycle = subscription.billingCycle || 'monthly';
    return getPlanByNameAndBilling(subscription.realPlanName, cycle);
  };

  const getPlanIcon = (planName: 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    switch (planName) {
      case 'STARTER': return <Star className="h-5 w-5" />;
      case 'PRO': return <Crown className="h-5 w-5" />;
      case 'ENTERPRISE': return <Phone className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatFeatures = (plan: typeof PLANS[0]) => {
    const features: string[] = [];
    
    if (plan.features.subdomains === -1) {
      features.push('Subdomínios ilimitados');
    } else {
      features.push(`${plan.features.subdomains} subdomínio(s)`);
    }

    if (plan.features.pagesPerSubdomain === -1) {
      features.push('Páginas ilimitadas');
    } else {
      features.push(`${plan.features.pagesPerSubdomain} páginas por subdomínio`);
    }

    if (plan.features.customDomain) {
      features.push('Domínio customizado');
    }

    if (plan.features.photos === -1) {
      features.push('Fotos ilimitadas');
    } else {
      features.push(`${plan.features.photos} fotos`);
    }

    if (plan.features.videos === -1) {
      features.push('Vídeos ilimitados');
    } else {
      features.push(`${plan.features.videos} vídeos`);
    }

    features.push('Analytics básicos');

    if (plan.features.support === 'email') {
      features.push('Suporte via email');
    } else if (plan.features.support === 'whatsapp') {
      features.push('Suporte via WhatsApp');
    } else if (plan.features.support === 'phone') {
      features.push('Suporte via telefone');
    }

    if (plan.features.templates) {
      features.push('Templates premium');
    }

    return features;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPlan = getCurrentPlan();
  const planGroups = ['STARTER', 'PRO', 'ENTERPRISE'].map(name => {
    const monthlyPlan = getPlanByNameAndBilling(name as 'STARTER' | 'PRO' | 'ENTERPRISE', 'monthly');
    const yearlyPlan = getPlanByNameAndBilling(name as 'STARTER' | 'PRO' | 'ENTERPRISE', 'yearly');
    return { name, monthlyPlan, yearlyPlan };
  });

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
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                  {getPlanIcon(currentPlan.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentPlan.displayName}</h3>
                  <p className="text-gray-600">
                    {currentPlan.billingCycle === 'yearly' 
                      ? `R$ ${(currentPlan.price / 12).toFixed(2).replace('.', ',')}/mês (Anual)`
                      : `R$ ${currentPlan.price.toFixed(2).replace('.', ',')}/mês`
                    }
                  </p>
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
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors"
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

            {/* Toggle Billing Cycle (apenas para Starter e Pro) */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Mensal
              </span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  billingCycle === 'yearly' ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Anual
              </span>
              {billingCycle === 'yearly' && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                  Economize 2 meses
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planGroups.map(({ name, monthlyPlan, yearlyPlan }) => {
                const plan = billingCycle === 'monthly' ? monthlyPlan : yearlyPlan;
                if (!plan) return null;

                const isCurrentPlan = currentPlan?.name === plan.name && 
                                     (currentPlan?.billingCycle === plan.billingCycle || 
                                      (currentPlan?.billingCycle === 'monthly' && plan.billingCycle === 'yearly') ||
                                      (currentPlan?.billingCycle === 'yearly' && plan.billingCycle === 'monthly'));
                
                const currentPlanObj = currentPlan ? getPlanByNameAndBilling(currentPlan.name, currentPlan.billingCycle || 'monthly') : null;
                const isUpgrade = currentPlanObj && plan.price > currentPlanObj.price;
                const isDowngrade = currentPlanObj && plan.price < currentPlanObj.price;
                const features = formatFeatures(plan);
                const monthlyPrice = plan.monthlyPrice;
                const yearlySavings = monthlyPrice * 2;

                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-lg border-2 p-6 ${
                      isCurrentPlan
                        ? 'border-pink-500 bg-pink-50'
                        : plan.name === 'PRO'
                        ? 'border-green-500 bg-green-50'
                        : plan.name === 'ENTERPRISE'
                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.name === 'PRO' && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          90% das pessoas escolhem
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-3">
                        <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Plano Atual
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-4">
                        {getPlanIcon(plan.name)}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{plan.displayName}</h3>
                      {plan.name === 'ENTERPRISE' ? (
                        <p className="text-lg text-gray-600 mt-2">Contato Direto</p>
                      ) : billingCycle === 'yearly' ? (
                        <div className="mt-2">
                          {/* Destacar valor mensal equivalente */}
                          <div className="flex items-baseline justify-center">
                            <span className="text-3xl font-bold text-gray-900">
                              R$ {(plan.price / 12).toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-gray-600 ml-2">/mês</span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-500">
                              R$ {plan.price.toFixed(2).replace('.', ',')} /ano
                            </p>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              Economize R$ {yearlySavings.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-center mt-2">
                          <span className="text-3xl font-bold text-gray-900">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-gray-600 ml-2">/mês</span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {!isCurrentPlan && (
                      <button
                        onClick={() => {
                          if (plan.name === 'ENTERPRISE') {
                            handleUpgrade('ENTERPRISE');
                          } else if (isUpgrade) {
                            handleUpgrade(plan.name);
                          } else {
                            handleDowngrade(plan.name);
                          }
                        }}
                        disabled={upgrading}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          plan.name === 'ENTERPRISE'
                            ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                            : isUpgrade
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {upgrading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processando...
                          </div>
                        ) : plan.name === 'ENTERPRISE' ? (
                          'Falar no WhatsApp'
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
