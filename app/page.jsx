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
    <div className="min-h-screen bg-light-bg text-light-text">
      {/* Header */}
      <header className="bg-white border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-accent-pink rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-light-text">SexyFlow</h1>
                  <p className="text-sm text-light-text-secondary">Crie páginas de vendas profissionais</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-light-text hover:text-accent-pink transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/register" 
                className="bg-accent-pink text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-light-text mb-6">
              Crie Páginas de Vendas{' '}
              <span className="text-accent-pink animate-pulse-slow" style={{ textShadow: '0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)' }}>
                Profissionais
              </span>
            </h1>
            <p className="text-xl text-light-text-secondary mb-8 max-w-3xl mx-auto">
              Editor visual drag & drop, hospedagem inclusa, analytics e muito mais. 
              Tudo que você precisa para vender online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-accent-pink text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-pink-600 transition-colors flex items-center justify-center"
              >
                Começar Grátis
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                href="/pricing" 
                className="border border-light-border text-light-text px-8 py-4 rounded-lg text-lg font-medium hover:bg-light-surface transition-colors"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-light-surface py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-light-text mb-4">
                Tudo que você precisa para vender online
              </h2>
              <p className="text-light-text-secondary max-w-2xl mx-auto">
                Ferramentas profissionais para criar, hospedar e analisar suas páginas de vendas
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Editor Visual */}
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-light-text mb-3">
                  Editor Visual
                </h3>
                <p className="text-light-text-secondary">
                  Crie páginas profissionais com nosso editor drag & drop intuitivo. 
                  Sem necessidade de conhecimento técnico.
                </p>
              </div>

              {/* Hospedagem Inclusa */}
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '1s' }}>
                  <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-light-text mb-3">
                  Hospedagem Inclusa
                </h3>
                <p className="text-light-text-secondary">
                  Suas páginas ficam online instantaneamente. 
                  Hospedagem rápida e confiável incluída em todos os planos.
                </p>
              </div>

              {/* Analytics Avançados */}
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '2s' }}>
                  <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-light-text mb-3">
                  Analytics Avançados
                </h3>
                <p className="text-light-text-secondary">
                  Acompanhe visitantes, vendas e conversões. 
                  Dados detalhados para otimizar suas campanhas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-light-text mb-4">
                Escolha seu plano
              </h2>
              <p className="text-light-text-secondary max-w-2xl mx-auto">
                Planos simples e transparentes para todos os tamanhos de negócio
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Plano Starter */}
              <div className="bg-white p-8 rounded-xl border border-light-border">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-light-text mb-2">Plano Starter</h3>
                  <div className="text-3xl font-bold text-light-text">
                    R$ 29,90<span className="text-lg text-light-text-secondary">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 subdomínio(s)
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 páginas por subdomínio
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    10 fotos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    10 vídeos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics básicos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Suporte via email
                  </li>
                </ul>
                <Link 
                  href="/register" 
                  className="w-full bg-light-text text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors block text-center"
                >
                  Escolher Plano
                </Link>
              </div>

              {/* Plano Pro */}
              <div className="bg-white p-8 rounded-xl border-2 border-accent-pink relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent-pink text-white px-4 py-1 rounded-full text-sm font-medium">
                    90% das pessoas escolhem
                  </span>
                </div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-light-text mb-2">Plano Pro</h3>
                  <div className="text-3xl font-bold text-light-text">
                    R$ 47,00<span className="text-lg text-light-text-secondary">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 subdomínio(s)
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    8 páginas por subdomínio
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Domínio customizado
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    30 fotos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    20 vídeos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics básicos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Suporte via WhatsApp
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Templates premium
                  </li>
                </ul>
                <Link 
                  href="/register" 
                  className="w-full bg-accent-pink text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors block text-center"
                >
                  Escolher Plano
                </Link>
              </div>

              {/* Plano Enterprise */}
              <div className="bg-white p-8 rounded-xl border border-light-border">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-light-text mb-2">Plano Enterprise</h3>
                  <div className="text-3xl font-bold text-light-text">
                    Contato Direto
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Subdomínios ilimitados
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Páginas ilimitadas
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Domínio customizado
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Fotos ilimitadas
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vídeos ilimitados
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics básicos
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Suporte via telefone
                  </li>
                  <li className="flex items-center text-light-text-secondary">
                    <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Templates premium
                  </li>
                </ul>
                <Link 
                  href="/contact" 
                  className="w-full bg-accent-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors block text-center"
                >
                  Falar no WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-light-surface py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-light-text mb-4">
                O que nossos clientes dizem
              </h2>
              <p className="text-light-text-secondary max-w-2xl mx-auto">
                Histórias reais de sucesso de quem usa o SexyFlow
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-xl border border-light-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-pink/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent-pink font-bold text-lg">D</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-light-text">Dread Kimber</h4>
                    <p className="text-sm text-light-text-secondary">Influencer</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-light-text-secondary">
                  "Eu faturava 30k mês no Priv*** e depois que comecei a usar o sexyflow como mais um canal de vendas, aumentei o faturamento em 30%"
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-xl border border-light-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent-blue font-bold text-lg">J</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-light-text">João Santos</h4>
                    <p className="text-sm text-light-text-secondary">Estrategista Digital</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-light-text-secondary">
                  "Parei de usar Hosting** porque o sexyflow facilita demais as coisas, tudo centralizado em um lugar só!"
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-xl border border-light-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent-green font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-light-text">Ana Costa</h4>
                    <p className="text-sm text-light-text-secondary">Autônoma</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-light-text-secondary">
                  "Os templates do nicho hot facilitaram demais, ainda mais automatizando com o sistema de automação de chamadas de vídeo fakes."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-light-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-accent-pink rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-light-text">SexyFlow</h3>
                </div>
                <p className="text-light-text-secondary">
                  Crie páginas de vendas profissionais sem complicação
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-light-text mb-4">Produto</h4>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-light-text-secondary hover:text-light-text transition-colors">Recursos</Link></li>
                  <li><Link href="/pricing" className="text-light-text-secondary hover:text-light-text transition-colors">Preços</Link></li>
                  <li><Link href="/templates" className="text-light-text-secondary hover:text-light-text transition-colors">Templates</Link></li>
                  <li><Link href="/demo" className="text-light-text-secondary hover:text-light-text transition-colors">Demo</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-light-text mb-4">Suporte</h4>
                <ul className="space-y-2">
                  <li><Link href="/help" className="text-light-text-secondary hover:text-light-text transition-colors">Ajuda</Link></li>
                  <li><Link href="/contact" className="text-light-text-secondary hover:text-light-text transition-colors">Contato</Link></li>
                  <li><Link href="/docs" className="text-light-text-secondary hover:text-light-text transition-colors">Documentação</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-light-text mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-light-text-secondary hover:text-light-text transition-colors">Privacidade</Link></li>
                  <li><Link href="/terms" className="text-light-text-secondary hover:text-light-text transition-colors">Termos</Link></li>
                  <li><Link href="/cookies" className="text-light-text-secondary hover:text-light-text transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-light-border mt-8 pt-8 text-center">
              <p className="text-light-text-secondary">
                © 2024 SexyFlow. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}