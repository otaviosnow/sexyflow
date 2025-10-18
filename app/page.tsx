'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Zap, Target, BarChart3, Users, CheckCircle, Star, ArrowRight, Play, Shield, Globe, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('monthly');

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Criação Automática',
      description: 'Crie páginas profissionais em minutos com nossos templates otimizados para conversão.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Editor Visual',
      description: 'Personalize cada elemento com nosso editor drag & drop intuitivo e poderoso.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Avançado',
      description: 'Acompanhe visitas, cliques e conversões em tempo real para maximizar suas vendas.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Hospedagem Automática',
      description: 'Suas páginas ficam online automaticamente com subdomínio próprio ou domínio customizado.',
      color: 'from-purple-500 to-pink-500'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-indigo-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 animate-fade-in-up">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl shadow-lg animate-pulse-slow">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                SexyFlow
              </span>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in-up delay-200">
              <Link
                href="/auth/login"
                className="text-slate-700 hover:text-red-600 font-semibold transition-all duration-300 hover:scale-105"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 animate-fade-in-up">
              Automatize suas{' '}
              <span className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-pulse-slow">
                vendas
              </span>{' '}
              no nicho hot
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Crie páginas de vendas profissionais em minutos com templates otimizados, 
              editor visual avançado e hospedagem automática. Feito especialmente para o nicho adulto/hot.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-400">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-10 py-4 rounded-xl text-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-red-500/25 hover:scale-105 inline-flex items-center justify-center"
              >
                Começar Grátis Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button className="border-2 border-red-500 text-red-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 animate-fade-in-up">
              Por que escolher o{' '}
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                SexyFlow?
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Tudo que você precisa para dominar suas vendas no nicho hot
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`text-center p-8 rounded-2xl bg-white shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up delay-${(index + 1) * 100}`}
              >
                <div className={`bg-gradient-to-r ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 animate-fade-in-up">
              Planos que cabem no seu{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                bolso
              </span>
            </h2>
            <p className="text-xl text-slate-600 animate-fade-in-up delay-200">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="flex justify-center mb-12 animate-fade-in-up delay-300">
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'monthly'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-red-600'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setActiveTab('yearly')}
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'yearly'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-red-600'
                }`}
              >
                Anual <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full ml-2 font-semibold">2 meses grátis</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <div className={`bg-white rounded-3xl shadow-2xl p-10 border-2 transition-all duration-500 animate-slide-in-left ${
              activeTab === 'monthly' ? 'border-red-500 scale-105 shadow-red-500/25' : 'border-slate-200 hover:border-red-300'
            }`}>
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Plano Mensal</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  R$ 97<span className="text-2xl text-slate-500">/mês</span>
                </div>
                <p className="text-slate-600 text-lg">Perfeito para começar</p>
              </div>

              <ul className="space-y-5 mb-10">
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">5 páginas por mês</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Editor visual drag & drop</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Hospedagem automática</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Analytics básicos</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Suporte por email</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Escolher Plano Mensal
              </button>
            </div>

            {/* Plano Anual */}
            <div className={`bg-white rounded-3xl shadow-2xl p-10 border-2 transition-all duration-500 animate-slide-in-right relative ${
              activeTab === 'yearly' ? 'border-red-500 scale-105 shadow-red-500/25' : 'border-slate-200 hover:border-red-300'
            }`}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-bounce-slow">
                  Mais Popular
                </span>
              </div>

              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Plano Anual</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  R$ 970<span className="text-2xl text-slate-500">/ano</span>
                </div>
                <p className="text-slate-600 text-lg">Economize 2 meses</p>
              </div>

              <ul className="space-y-5 mb-10">
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">10 páginas por ano</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Editor visual drag & drop</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Hospedagem automática</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Analytics avançados</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Suporte prioritário</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="font-medium">Domínio customizado</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
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
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 animate-fade-in-up">
              O que nossos{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                clientes
              </span>{' '}
              dizem
            </h2>
            <p className="text-xl text-slate-600 animate-fade-in-up delay-200">
              Resultados reais de pessoas reais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-700 italic text-lg leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 animate-fade-in-up">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-red-100 mb-12 animate-fade-in-up delay-200">
            Junte-se a centenas de empreendedores que já estão lucrando mais com o SexyFlow
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-red-600 px-10 py-4 rounded-xl text-xl font-bold hover:bg-red-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 inline-flex items-center animate-fade-in-up delay-400"
          >
            Começar Agora Grátis
            <ArrowRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SexyFlow</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                A plataforma definitiva para automatizar suas vendas no nicho hot. 
                Crie páginas profissionais em minutos e maximize suas conversões.
              </p>
            </div>
            
            <div className="animate-fade-in-up delay-200">
              <h3 className="text-xl font-bold mb-6 text-white">Recursos</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-400" />
                  Editor Visual
                </li>
                <li className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-blue-400" />
                  Hospedagem Automática
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                  Analytics Avançado
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-pink-400" />
                  Suporte Dedicado
                </li>
              </ul>
            </div>
            
            <div className="animate-fade-in-up delay-300">
              <h3 className="text-xl font-bold mb-6 text-white">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors duration-300">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors duration-300">
                    Termos de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400 mb-4">
              © 2025 SexyFlow. Todos os direitos reservados.
            </p>
            <p className="text-sm text-slate-500 max-w-4xl mx-auto leading-relaxed">
              <strong className="text-slate-400">Aviso Legal:</strong> Nós da SexyFlow não nos responsabilizamos pelas páginas criadas pelos usuários, 
              nós somente fornecemos o sistema para que possam usar para criação individual.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}