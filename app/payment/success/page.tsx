'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { PaymentService } from '@/lib/services/PaymentService';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const userId = searchParams.get('user_id');
        
        // Se não há parâmetros, verificar se há pagamento pendente no localStorage
        if (!paymentId || !userId) {
          const currentUser = localStorage.getItem('currentUser');
          if (!currentUser) {
            router.push('/');
            return;
          }
          
          const userData = JSON.parse(currentUser);
          const pendingPayment = localStorage.getItem(`pending_payment_${userData.id}`);
          
          if (pendingPayment) {
            // Simular pagamento aprovado
            const paymentData = JSON.parse(pendingPayment);
            
            // Criar assinatura ativa
            const subscription = {
              _id: `sub-${Date.now()}`,
              userId: userData.id,
              planId: paymentData.planId,
              status: 'active',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              paymentId: `payment-${Date.now()}`,
              amount: paymentData.amount,
              currency: 'BRL',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Salvar assinatura
            localStorage.setItem(`subscription_${userData.id}`, JSON.stringify(subscription));
            
            // Remover pagamento pendente
            localStorage.removeItem(`pending_payment_${userData.id}`);
            
            setPaymentStatus('approved');
            setSubscription(subscription);
            setIsLoading(false);
            
            // Redirecionar após 3 segundos
            setTimeout(() => {
              router.push('/projects');
            }, 3000);
            return;
          }
        }

        // Verificar status do pagamento (código original)
        const status = await PaymentService.checkPaymentStatus(paymentId);
        setPaymentStatus(status.status);
        
        if (status.subscription) {
          setSubscription(status.subscription);
        }

        // Limpar pagamento pendente
        PaymentService.clearPendingPayment(userId);
        
        // Verificar se usuário está logado
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
          // Usuário logado - redirecionar para dashboard após 3 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          // Usuário não logado - redirecionar para login após 3 segundos
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        setPaymentStatus('error');
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams, router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Erro no Pagamento</h2>
            <p className="text-gray-600 mb-8">
              Ocorreu um erro ao processar seu pagamento. Tente novamente.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/plans')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Ícone de Sucesso */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Pagamento Aprovado!
          </h2>
          
          {/* Mensagem */}
          <p className="text-gray-600 mb-8">
            Sua assinatura foi ativada com sucesso. Agora você pode acessar todos os recursos do seu plano.
          </p>
          
          {/* Aviso de redirecionamento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Redirecionamento Automático
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Você será redirecionado automaticamente em alguns segundos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes da Assinatura */}
          {subscription && (
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalhes da Assinatura
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-medium">{subscription.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium">R$ {subscription.amount?.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Ativo</span>
                </div>
                {subscription.nextBillingDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Próxima cobrança:</span>
                    <span className="font-medium">
                      {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="space-y-4">
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <span>Acessar Dashboard</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Home className="mr-2 h-5 w-5" />
              <span>Voltar ao Início</span>
            </button>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Você receberá um email de confirmação em breve.
            </p>
            <p className="mt-2">
              Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
