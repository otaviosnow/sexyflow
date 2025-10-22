'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, Crown, Phone, ArrowRight } from 'lucide-react';
import { PLANS } from '@/lib/models/Plan';

export default function ChoosePlanPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(user);
    setCurrentUser(userData);

    // Verificar se já tem plano ativo
    const subscription = localStorage.getItem(`subscription_${userData.id}`);
    if (subscription) {
      // Já tem plano, redirecionar para projetos
      router.push('/projects');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handlePlanSelection = async (planId: string) => {
    if (!currentUser) return;

    if (planId === 'plan-enterprise') {
      // Plano Enterprise - abrir WhatsApp
      window.open('https://wa.me/5531997783097?text=Olá, gostaria de conversar sobre o plano Enterprise do SexyFlow', '_blank');
      return;
    }

    // Para planos STARTER e PRO, redirecionar para Cakto
    try {
      const amount = planId === 'plan-starter' ? 29.90 : 47.00;
      const planName = planId === 'plan-starter' ? 'STARTER' : 'PRO';
      
      // Dados do pagamento
      const paymentData = {
        userId: currentUser.id,
        planId: planId,
        amount: amount,
        currency: 'BRL',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Salvar pagamento pendente
      localStorage.setItem(`pending_payment_${currentUser.id}`, JSON.stringify(paymentData));

      // Simular processo de pagamento (substituir pela integração real da Cakto)
      alert(`Redirecionando para pagamento do ${planName}...\nValor: R$ ${amount.toFixed(2).replace('.', ',')}\n\nEm um ambiente real, você seria redirecionado para o gateway de pagamento da Cakto.`);
      
      // Simular pagamento aprovado após 2 segundos
      setTimeout(() => {
        // Criar assinatura ativa
        const subscription = {
          _id: `sub-${Date.now()}`,
          userId: currentUser.id,
          planId: planId,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          paymentId: `payment-${Date.now()}`,
          amount: amount,
          currency: 'BRL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Salvar assinatura
        localStorage.setItem(`subscription_${currentUser.id}`, JSON.stringify(subscription));
        
        // Remover pagamento pendente
        localStorage.removeItem(`pending_payment_${currentUser.id}`);

        // Redirecionar para projetos
        router.push('/projects');
      }, 2000);

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
        return 'from-pink-500 to-pink-600';
      case 'ENTERPRISE':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">SexyFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Olá, {currentUser?.name}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para suas necessidades e comece a criar suas páginas de vendas profissionais
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-4 ${
                plan.name === 'PRO'
                  ? 'border-pink-500 bg-pink-50 scale-105'
                  : plan.name === 'ENTERPRISE'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Plan Header */}
              <div className="text-center mb-8">
                {plan.name === 'PRO' && (
                  <div className="bg-pink-100 text-pink-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block">
                    90% das pessoas escolhem
                  </div>
                )}
                <div className="flex justify-center mb-4">
                  {plan.name === 'STARTER' && <Star className="w-6 h-6 text-blue-500" />}
                  {plan.name === 'PRO' && <Crown className="w-6 h-6 text-purple-500" />}
                  {plan.name === 'ENTERPRISE' && <Phone className="w-6 h-6 text-green-500" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.displayName}
                </h3>
                {plan.name === 'ENTERPRISE' ? (
                  <p className="text-lg text-gray-600">Contato Direto</p>
                ) : (
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-600 ml-2">/mês</span>
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
                onClick={() => handlePlanSelection(plan._id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  plan.name === 'ENTERPRISE'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : plan.name === 'PRO'
                    ? 'bg-pink-600 hover:bg-pink-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {plan.name === 'ENTERPRISE' 
                  ? 'Falar no WhatsApp' 
                  : 'Escolher Plano'
                }
              </button>
            </div>
          ))}
        </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              Precisa de ajuda para escolher?{' '}
              <a 
                href="https://wa.me/5531997783097" 
                className="text-pink-600 hover:text-pink-700 font-medium"
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
