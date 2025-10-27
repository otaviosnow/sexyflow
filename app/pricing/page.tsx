'use client';

import { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      id: 'starter',
      name: 'STARTER',
      price: 97,
      period: 'mês',
      description: 'Perfeito para começar',
      features: [
        '3 páginas de vendas',
        'Subdomínio personalizado',
        'Editor visual drag & drop',
        'Templates profissionais',
        'Hospedagem automática',
        'Analytics básicos',
        'Suporte por email'
      ],
      popular: false,
      cta: 'Começar Agora',
      highlight: false
    },
    {
      id: 'pro',
      name: 'PRO',
      price: 197,
      period: 'mês',
      description: 'Mais recursos e controle',
      features: [
        '8 páginas de vendas',
        'Subdomínio personalizado',
        'Editor visual drag & drop',
        'Templates premium',
        'Hospedagem automática',
        'Analytics avançados',
        'Relatórios detalhados',
        'Suporte prioritário por email'
      ],
      popular: true,
      cta: 'Escolher PRO',
      highlight: true
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      price: null,
      period: '',
      description: 'Solução personalizada',
      features: [
        'Páginas ilimitadas',
        'Domínio customizado',
        'Editor visual avançado',
        'Templates exclusivos',
        'Hospedagem dedicada',
        'Analytics empresarial',
        'API de integração',
        'Suporte prioritário WhatsApp',
        'Gerente de conta dedicado'
      ],
      popular: false,
      cta: 'Contato',
      highlight: false,
      isEnterprise: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Escolha o plano perfeito para você
            </h1>
            <p className="text-xl text-gray-300">
              Crie páginas de vendas profissionais com nosso editor visual drag & drop
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-700/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <Star className="h-4 w-4 mr-2" />
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {plan.name}
                </h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <span className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                        R$ {plan.price}
                      </span>
                      <span className="text-gray-400 ml-2 text-xl">/{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Sob Consulta
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 shadow-lg hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/25'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-16">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                O que acontece se eu não renovar minha assinatura?
              </h3>
              <p className="text-gray-300">
                Você terá 7 dias para renovar após o vencimento. Após esse período, 
                seu projeto, subdomínio e páginas serão excluídos permanentemente.
              </p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                Posso alterar meu subdomínio depois?
              </h3>
              <p className="text-gray-300">
                Não, o subdomínio não pode ser alterado após a criação. 
                Certifique-se de escolher um nome que represente bem seu negócio.
              </p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                Quantas páginas posso criar?
              </h3>
              <p className="text-gray-300">
                No plano mensal: 5 páginas por mês. No plano anual: 10 páginas por ano. 
                Páginas antigas não são excluídas, apenas o limite de criação.
              </p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                Posso usar meu próprio domínio?
              </h3>
              <p className="text-gray-300">
                Sim! No plano anual você pode configurar seu próprio domínio personalizado 
                (ex: seunegocio.com) em vez do subdomínio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
