'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Check, Star, Crown, Phone } from 'lucide-react';
import { PLANS, getPlanByNameAndBilling } from '@/lib/models/Plan';

export default function ChoosePlanPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    // Verificar se usuário está autenticado
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Verificar se já tem assinatura ativa
      checkSubscription();
    }
  }, [status, router]);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/check');
      if (response.ok) {
        const data = await response.json();
        if (data.hasActiveSubscription) {
          // Já tem plano, redirecionar para projetos
          router.push('/projects');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
    }
    setIsLoading(false);
  };

  const handlePlanSelection = async (planName: 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    if (!session) return;

    const plan = getPlanByNameAndBilling(planName, billingCycle);
    if (!plan) return;

    if (planName === 'ENTERPRISE') {
      // Plano Enterprise - abrir WhatsApp
      window.open('https://wa.me/5531997783097?text=Olá, gostaria de conversar sobre o plano Enterprise do SexyFlow', '_blank');
      return;
    }

    // Para planos STARTER e PRO, redirecionar para checkout/pagamento
    try {
      // Dados do pagamento
      const paymentData = {
        userId: session.user.id,
        planId: plan._id,
        planName: plan.name,
        billingCycle: plan.billingCycle,
        amount: plan.price,
        currency: 'BRL',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Salvar pagamento pendente
      localStorage.setItem(`pending_payment_${session.user.id}`, JSON.stringify(paymentData));

      // Redirecionar para checkout/pagamento
      router.push(`/payment/checkout?planId=${plan._id}`);
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro no processamento do pagamento. Tente novamente.');
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'STARTER':
        return <Star className="w-6 h-6" />;
      case 'PRO':
        return <Crown className="w-6 h-6" />;
      case 'ENTERPRISE':
        return <Phone className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'STARTER':
        return 'from-blue-500 to-blue-600';
      case 'PRO':
        return 'from-green-500 to-green-600';
      case 'ENTERPRISE':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Agrupar planos por nome
  const planGroups = ['STARTER', 'PRO', 'ENTERPRISE'].map(name => {
    const monthlyPlan = getPlanByNameAndBilling(name as 'STARTER' | 'PRO' | 'ENTERPRISE', 'monthly');
    const yearlyPlan = getPlanByNameAndBilling(name as 'STARTER' | 'PRO' | 'ENTERPRISE', 'yearly');
    return { name, monthlyPlan, yearlyPlan };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img src="/logo-sxflow.svg" alt="Logo" className="h-8 w-auto" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">SexyFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Olá, {session?.user?.name}</span>
              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push('/');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Selecione o plano ideal para suas necessidades e comece a criar suas páginas de vendas profissionais
            </p>

            {/* Billing Cycle Toggle */}
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
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {planGroups.map(({ name, monthlyPlan, yearlyPlan }) => {
              const plan = billingCycle === 'monthly' ? monthlyPlan : yearlyPlan;
              if (!plan) return null;

              const monthlyPrice = plan.monthlyPrice;
              const yearlySavings = monthlyPrice * 2; // Economia de 2 meses

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-4 ${
                    plan.name === 'PRO'
                      ? 'border-green-500 bg-green-50 scale-105'
                      : plan.name === 'ENTERPRISE'
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    {plan.name === 'PRO' && (
                      <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block">
                        90% das pessoas escolhem
                      </div>
                    )}
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(plan.name)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.displayName}
                    </h3>
                    {plan.name === 'ENTERPRISE' ? (
                      <p className="text-lg text-gray-600">Contato Direto</p>
                    ) : (
                      <div>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          {billingCycle === 'yearly' && (
                            <span className="text-gray-600 ml-2 text-sm">/ano</span>
                          )}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              R$ {(plan.price / 12).toFixed(2).replace('.', ',')} /mês
                            </p>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              Economize R$ {yearlySavings.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        )}
                        {billingCycle === 'monthly' && (
                          <span className="text-gray-600 text-sm">/mês</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Plan Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">
                        {plan.features.subdomains === -1 
                          ? 'Subdomínios ilimitados' 
                          : `${plan.features.subdomains} subdomínio(s)`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">
                        {plan.features.pagesPerSubdomain === -1 
                          ? 'Páginas ilimitadas' 
                          : `${plan.features.pagesPerSubdomain} páginas por subdomínio`
                        }
                      </span>
                    </div>
                    
                    {plan.features.customDomain && (
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">Domínio customizado</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">
                        {plan.features.photos === -1 
                          ? 'Fotos ilimitadas' 
                          : `${plan.features.photos} fotos`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">
                        {plan.features.videos === -1 
                          ? 'Vídeos ilimitados' 
                          : `${plan.features.videos} vídeos`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Analytics básicos</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">
                        Suporte via {plan.features.support === 'email' ? 'email' : 
                        plan.features.support === 'whatsapp' ? 'WhatsApp' : 'telefone'}
                      </span>
                    </div>
                    
                    {plan.features.templates && (
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">Templates premium</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Button */}
                  <button
                    onClick={() => handlePlanSelection(plan.name)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      plan.name === 'ENTERPRISE'
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/50'
                        : plan.name === 'PRO'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.name === 'ENTERPRISE' 
                      ? 'Falar no WhatsApp' 
                      : billingCycle === 'yearly'
                      ? 'Assinar Anual'
                      : 'Assinar Mensal'
                    }
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              Precisa de ajuda para escolher?{' '}
              <a 
                href="https://wa.me/5531997783097" 
                className="text-red-600 hover:text-red-700 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fale conosco no WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
