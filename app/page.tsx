'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Star, Crown, Phone, ArrowRight, Users, Zap, Shield } from 'lucide-react';
import { PLANS } from '@/lib/models/Plan';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está logado
    const currentUser = localStorage.getItem('currentUser');
    const isLoggedInUser = !!currentUser;
    setIsLoggedIn(isLoggedInUser);
    
    // Se usuário está logado, redirecionar para projetos
    if (isLoggedInUser) {
      router.push('/projects');
    }
  }, [router]);

  const handlePlanClick = (planName: string) => {
    if (!isLoggedIn) {
      alert('Você precisa fazer login primeiro para escolher um plano.');
      router.push('/login');
      return;
    }
    
    if (planName === 'ENTERPRISE') {
      window.open('https://wa.me/5531997783097?text=Olá, gostaria de conversar sobre o plano Enterprise do site SexyFlow', '_blank');
    } else {
      // Para planos STARTER e PRO, redirecionar para página de escolha de planos
      router.push('/choose-plan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Coração */}
                    <path d="M16 28C16 28 4 18 4 12C4 8 7 5 11 5C13 5 15 6 16 8C17 6 19 5 21 5C25 5 28 8 28 12C28 18 16 28 16 28Z" fill="#ec4899" stroke="#ec4899" strokeWidth="1"/>
                    {/* Rabo saindo de baixo, passando por dentro e saindo por fora */}
                    <path d="M16 28 Q12 24 8 20 Q6 16 10 14 Q14 12 16 16 Q18 20 22 18 Q26 16 24 20 Q20 24 16 28" stroke="#be185d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M16 26 Q13 22 10 19 Q8 17 11 16 Q14 15 16 18 Q18 21 21 19 Q24 17 22 19 Q19 22 16 26" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">SexyFlow</h1>
                <p className="text-sm text-gray-500">Crie páginas de vendas profissionais</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Crie Páginas de Vendas
              <span className="text-pink-600 animate-pulse" style={{animationDuration: '2s'}}> Profissionais</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Editor visual drag & drop, hospedagem inclusa, analytics e muito mais. 
              Tudo que você precisa para vender online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link
                href="/register"
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg"
              >
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce-x" />
              </Link>
              <Link
                href="/plans"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 border border-gray-300 hover:scale-105 hover:shadow-lg"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-xl text-gray-600">
              Ferramentas profissionais para criar, hospedar e analisar suas páginas de vendas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-pink-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Editor Visual</h3>
              <p className="text-gray-600">
                Crie páginas profissionais com nosso editor drag & drop intuitivo. 
                Sem necessidade de conhecimento técnico.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-blue-600 animate-bounce" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hospedagem Inclusa</h3>
              <p className="text-gray-600">
                Suas páginas ficam online instantaneamente. Hospedagem rápida e confiável 
                incluída em todos os planos.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-green-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Avançados</h3>
              <p className="text-gray-600">
                Acompanhe visitantes, vendas e conversões. Dados detalhados para 
                otimizar suas campanhas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-xl text-gray-600">
              Planos flexíveis para diferentes necessidades
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
                  onClick={() => handlePlanClick(plan.name)}
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de sucesso com o SexyFlow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900">Dread Kimber</h4>
                <p className="text-sm text-gray-600">Influencer</p>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">
                "Eu faturava 30k mês no Priv*** e depois que comecei a usar o sexyflow como mais um canal de vendas, aumentei o faturamento em 30%"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900">João Santos</h4>
                <p className="text-sm text-gray-600">Estrategista Digital</p>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">
                "Parei de usar Hosting** porque o sexyflow facilita demais as coisas, tudo centralizado em um lugar só!"
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900">Ana Costa</h4>
                <p className="text-sm text-gray-600">Autônoma</p>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">
                "Os templates do nicho hot facilitaram demais, ainda mais automatizando com o sistema de automação de chamadas de vídeo fakes."
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-gradient-to-r from-pink-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Números que falam por si</h3>
              <p className="text-pink-100">Resultados reais dos nossos clientes</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">82</div>
                <div className="text-pink-100">Clientes Ativos</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">492</div>
                <div className="text-pink-100">Páginas Criadas</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">+36%</div>
                <div className="text-pink-100">Aumento em Vendas</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-pink-100">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar a vender?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Crie sua primeira página de vendas em minutos
          </p>
          <Link
            href="/register"
            className="bg-white hover:bg-gray-50 text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            Criar Conta Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Coração */}
                    <path d="M16 28C16 28 4 18 4 12C4 8 7 5 11 5C13 5 15 6 16 8C17 6 19 5 21 5C25 5 28 8 28 12C28 18 16 28 16 28Z" fill="#ec4899" stroke="#ec4899" strokeWidth="1"/>
                    {/* Rabo saindo de baixo, passando por dentro e saindo por fora */}
                    <path d="M16 28 Q12 24 8 20 Q6 16 10 14 Q14 12 16 16 Q18 20 22 18 Q26 16 24 20 Q20 24 16 28" stroke="#be185d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M16 26 Q13 22 10 19 Q8 17 11 16 Q14 15 16 18 Q18 21 21 19 Q24 17 22 19 Q19 22 16 26" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold">SexyFlow</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma mais completa para criar páginas de vendas profissionais.
              </p>
            </div>
            
            {/* Produto */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#plans" className="hover:text-pink-400 transition-colors">Planos e Preços</a></li>
                <li><Link href="/features" className="hover:text-pink-400 transition-colors">Recursos</Link></li>
                <li><Link href="/templates" className="hover:text-pink-400 transition-colors">Templates</Link></li>
                <li><Link href="/demo" className="hover:text-pink-400 transition-colors">Demonstração</Link></li>
              </ul>
            </div>
            
            {/* Suporte */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-pink-400 transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/docs" className="hover:text-pink-400 transition-colors">Documentação</Link></li>
                <li><a href="https://wa.me/5531997783097" className="hover:text-pink-400 transition-colors">WhatsApp</a></li>
                <li><a href="mailto:suporte@sexyflow.com" className="hover:text-pink-400 transition-colors">Email</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-pink-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-pink-400 transition-colors">Política de Privacidade</Link></li>
                <li><Link href="/cookies" className="hover:text-pink-400 transition-colors">Política de Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-lg font-semibold mb-2 text-white">Fique por dentro das novidades</h3>
              <p className="text-gray-400 mb-4">Receba dicas de vendas e atualizações da plataforma</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Seu melhor email" 
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors">
                  Inscrever
                </button>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; 2024 SexyFlow. Todos os direitos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/terms" className="hover:text-pink-400 transition-colors">Termos</Link>
                <Link href="/privacy" className="hover:text-pink-400 transition-colors">Privacidade</Link>
                <Link href="/cookies" className="hover:text-pink-400 transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
