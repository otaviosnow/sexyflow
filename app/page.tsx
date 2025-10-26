'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SexyFlow</h1>
                <p className="text-sm text-cyan-300">Crie páginas incríveis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300">
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Crie Páginas
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {' '}Futurísticas
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Editor visual drag & drop, hospedagem inclusa, analytics avançados. 
              Tudo que você precisa para dominar o digital.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/register" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Começar Grátis
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
            <Link href="#pricing" className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Ver Planos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Tecnologia do Futuro</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">Ferramentas avançadas para criar experiências digitais únicas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Editor Visual</h3>
              <p className="text-white/70 leading-relaxed">Interface drag & drop com IA integrada. Crie páginas profissionais em minutos.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Hospedagem Quântica</h3>
              <p className="text-white/70 leading-relaxed">Servidores de última geração com CDN global. Velocidade e segurança máximas.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Analytics Neural</h3>
              <p className="text-white/70 leading-relaxed">IA que analisa comportamento e otimiza conversões automaticamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Planos Futurísticos</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">Escolha o plano que se adapta ao seu nível de inovação</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plano Starter */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <div className="text-4xl font-bold text-cyan-400 mb-2">R$ 29</div>
                <p className="text-white/70">/mês</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  5 Páginas
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Editor Básico
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Hospedagem Inclusa
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Suporte Email
                </li>
              </ul>
              <Link href="/register" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 block text-center">
                Começar Agora
              </Link>
            </div>

            {/* Plano Pro */}
            <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-md border-2 border-purple-400 p-8 rounded-2xl hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300 transform scale-105">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                  Mais Popular
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-purple-400 mb-2">R$ 97</div>
                <p className="text-white/70">/mês</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Páginas Ilimitadas
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Editor Avançado + IA
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Domínio Personalizado
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Analytics Avançados
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Suporte Prioritário
                </li>
              </ul>
              <Link href="/register" className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 block text-center">
                Escolher Pro
              </Link>
            </div>

            {/* Plano Enterprise */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">R$ 197</div>
                <p className="text-white/70">/mês</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Tudo do Pro +
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  White Label
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  API Completa
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Suporte 24/7
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Gerente Dedicado
                </li>
              </ul>
              <Link href="/register" className="w-full bg-gradient-to-r from-green-500 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-cyan-700 transition-all duration-300 block text-center">
                Contatar Vendas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12">
            <h2 className="text-5xl font-bold text-white mb-6">Pronto para o Futuro?</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Junte-se a milhares de inovadores que já transformaram suas ideias em realidade digital
            </p>
            <Link href="/register" className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Começar Jornada Futurística
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h3 className="text-2xl font-bold text-white">SexyFlow</h3>
            </div>
            <p className="text-white/60 mb-6">&copy; 2025 SexyFlow. Todos os direitos reservados.</p>
            <div className="flex justify-center space-x-6">
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Termos</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Privacidade</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Suporte</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
