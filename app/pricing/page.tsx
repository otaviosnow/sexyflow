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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-sexy-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Planos que cabem no seu bolso
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Escolha o plano ideal para suas necessidades
            </p>
            
            {/* Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Mensal
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Anual
              </span>
              {isAnnual && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  2 meses grátis
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-red-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-red-600 text-white">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    R$ {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                
                {plan.originalPrice && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg text-gray-400 line-through">
                      R$ {plan.originalPrice}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Economia de R$ {plan.originalPrice - plan.price}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                O que acontece se eu não renovar minha assinatura?
              </h3>
              <p className="text-gray-600">
                Você terá 7 dias para renovar após o vencimento. Após esse período, 
                seu projeto, subdomínio e páginas serão excluídos permanentemente.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Posso alterar meu subdomínio depois?
              </h3>
              <p className="text-gray-600">
                Não, o subdomínio não pode ser alterado após a criação. 
                Certifique-se de escolher um nome que represente bem seu negócio.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quantas páginas posso criar?
              </h3>
              <p className="text-gray-600">
                No plano mensal: 5 páginas por mês. No plano anual: 10 páginas por ano. 
                Páginas antigas não são excluídas, apenas o limite de criação.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Posso usar meu próprio domínio?
              </h3>
              <p className="text-gray-600">
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
