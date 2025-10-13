'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Zap, Target, BarChart3, Users, CheckCircle, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('monthly');

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Criação Automática',
      description: 'Crie páginas profissionais em minutos com nossos templates otimizados para conversão.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Editor Visual',
      description: 'Personalize cada elemento com nosso editor drag & drop intuitivo e poderoso.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics Avançado',
      description: 'Acompanhe visitas, cliques e conversões em tempo real para maximizar suas vendas.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Hospedagem Automática',
      description: 'Suas páginas ficam online automaticamente com subdomínio próprio ou domínio customizado.'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      avatar: 'M',
      text: 'O SexyFlow revolucionou minhas vendas! Em 30 dias aumentei minha conversão em 300%.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      avatar: 'A',
      text: 'Finalmente uma plataforma feita para o nicho hot. Templates perfeitos e resultados incríveis!',
      rating: 5
    },
    {
      name: 'Julia Santos',
      avatar: 'J',
      text: 'Interface linda e funcionalidades que realmente funcionam. Recomendo para qualquer pessoa do nicho.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-600 to-sexy-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-sexy font-bold text-dark-900">SexyFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-dark-600 hover:text-primary-600 font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-primary-600 to-sexy-600 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-700 hover:to-sexy-700 transition-all"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-white to-sexy-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-sexy font-bold text-dark-900 mb-6">
              Automatize suas{' '}
              <span className="bg-gradient-to-r from-primary-600 to-sexy-600 bg-clip-text text-transparent">
                vendas
              </span>{' '}
              no nicho hot
            </h1>
            <p className="text-xl text-dark-600 mb-8 max-w-3xl mx-auto">
              Crie páginas de vendas profissionais em minutos com templates otimizados, 
              editor visual avançado e hospedagem automática. Feito especialmente para o nicho adulto/hot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-primary-600 to-sexy-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-primary-700 hover:to-sexy-700 transition-all shadow-lg hover:shadow-xl"
              >
                Começar Grátis Agora
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <button className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-600 hover:text-white transition-all">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-sexy font-bold text-dark-900 mb-4">
              Por que escolher o SexyFlow?
            </h2>
            <p className="text-xl text-dark-600">
              Tudo que você precisa para dominar suas vendas no nicho hot
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-primary-100 to-sexy-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-dark-900 mb-3">{feature.title}</h3>
                <p className="text-dark-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-sexy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-sexy font-bold text-dark-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-dark-600">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-lg shadow-sm">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-dark-600 hover:text-primary-600'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setActiveTab('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'yearly'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-dark-600 hover:text-primary-600'
                }`}
              >
                Anual <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">2 meses grátis</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Mensal */}
            <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 transition-all ${
              activeTab === 'monthly' ? 'border-primary-600 scale-105' : 'border-gray-200'
            }`}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-dark-900 mb-2">Plano Mensal</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  R$ 97<span className="text-lg text-dark-500">/mês</span>
                </div>
                <p className="text-dark-600">Perfeito para começar</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>5 páginas por mês</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Editor visual drag & drop</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Hospedagem automática</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics básicos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte por email</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-primary-600 to-sexy-600 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-sexy-700 transition-all">
                Escolher Plano Mensal
              </button>
            </div>

            {/* Plano Anual */}
            <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 transition-all relative ${
              activeTab === 'yearly' ? 'border-primary-600 scale-105' : 'border-gray-200'
            }`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-sexy-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-dark-900 mb-2">Plano Anual</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  R$ 970<span className="text-lg text-dark-500">/ano</span>
                </div>
                <p className="text-dark-600">Economize 2 meses</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 páginas por ano</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Editor visual drag & drop</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Hospedagem automática</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics avançados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Domínio customizado</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-primary-600 to-sexy-600 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-sexy-700 transition-all">
                Escolher Plano Anual
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-sexy font-bold text-dark-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-dark-600">
              Resultados reais de pessoas reais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-red-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-primary-100 to-sexy-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-900">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-dark-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-sexy-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-sexy font-bold text-white mb-6">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Junte-se a centenas de empreendedores que já estão lucrando mais com o SexyFlow
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center"
          >
            Começar Agora Grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-primary-600 to-sexy-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-sexy font-bold">SexyFlow</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-dark-400 mb-2">
                © 2024 SexyFlow. Todos os direitos reservados.
              </p>
              <p className="text-dark-500 text-sm">
                Automatize suas vendas no nicho hot
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
