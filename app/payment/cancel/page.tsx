'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { PaymentService } from '@/lib/services/PaymentService';

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Limpar pagamento pendente se existir
    const userId = searchParams.get('user_id');
    if (userId) {
      PaymentService.clearPendingPayment(userId);
    }
  }, [searchParams]);

  const handleTryAgain = () => {
    router.push('/plans');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Ícone de Cancelamento */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Pagamento Cancelado
          </h2>
          
          {/* Mensagem */}
          <p className="text-gray-600 mb-8">
            Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.
          </p>

          {/* Informações */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Sem cobrança realizada
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Você pode tentar novamente a qualquer momento. Seus dados estão seguros.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-4">
            <button
              onClick={handleTryAgain}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <span>Tentar Novamente</span>
              <ArrowLeft className="ml-2 h-5 w-5" />
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
              Precisa de ajuda? Entre em contato conosco:
            </p>
            <p className="mt-2">
              <strong>WhatsApp:</strong> (31) 99778-3097
            </p>
            <p>
              <strong>Email:</strong> suporte@sexyflow.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
