'use client';

import { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Plano Mensal',
      price: isAnnual ? 97 : 97,
      originalPrice: null,
      period: 'mês',
      description: 'Perfeito para começar',
      features: [
        '1 projeto único',
        '5 páginas por mês',
        'Subdomínio personalizado',
        'Editor visual drag & drop',
        'Hospedagem automática',
        'Analytics básicos',
        'Suporte por email'
      ],
      popular: false,
      cta: 'Começar Agora'
    },
    {
      id: 'annual',
      name: 'Plano Anual',
      price: isAnnual ? 970 : 970,
      originalPrice: isAnnual ? 1164 : 1164,
      period: 'ano',
      description: 'Economize 2 meses',
      features: [
        '1 projeto único',
        '10 páginas por ano',
        'Subdomínio personalizado',
        'Editor visual drag & drop',
        'Hospedagem automática',
        'Analytics avançados',
        'Suporte prioritário',
        'Domínio customizado'
      ],
      popular: true,
      cta: 'Escolher Plano Anual'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Planos que cabem no seu bolso
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Escolha o plano ideal para suas necessidades
            </p>
            
            {/* Toggle */}
            <div className="flex items-center justify-center space-x-6 mb-10">
              <span className={`text-lg ${!isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>
                Mensal
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                    isAnnual ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>
                Anual
              </span>
              {isAnnual && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30">
                  <Zap className="w-4 h-4 mr-2" />
                  2 meses grátis
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                  <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    R$ {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2 text-xl">/{plan.period}</span>
                </div>
                
                {plan.originalPrice && (
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl text-gray-500 line-through">
                      R$ {plan.originalPrice}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30">
                      Economia de R$ {plan.originalPrice - plan.price}
                    </span>
                  </div>
                )}
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
