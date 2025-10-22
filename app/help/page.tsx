'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, MessageCircle, FileText, Video, Mail } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "Como criar minha primeira página?",
      answer: "É muito simples! Após fazer login, clique em 'Criar Nova Página' e escolha um template. Use o editor visual para personalizar sua página."
    },
    {
      question: "Posso usar meu próprio domínio?",
      answer: "Sim! Nos planos PRO e Enterprise você pode conectar seu próprio domínio. Temos um tutorial completo para te ajudar."
    },
    {
      question: "Como funciona o sistema de pagamentos?",
      answer: "Integramos com a Cakto para processar pagamentos de forma segura. Você recebe os pagamentos diretamente na sua conta."
    },
    {
      question: "Posso cancelar minha assinatura?",
      answer: "Sim, você pode cancelar a qualquer momento. Não há taxas de cancelamento, mas não oferecemos reembolso por cancelamento antecipado."
    },
    {
      question: "Como funciona o suporte?",
      answer: "Oferecemos suporte por email, WhatsApp e telefone dependendo do seu plano. Respondemos em até 24 horas."
    },
    {
      question: "Posso editar minhas páginas depois de publicadas?",
      answer: "Claro! Você pode editar suas páginas a qualquer momento. As alterações são aplicadas instantaneamente."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar para o site
              </Link>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 28C16 28 4 18 4 12C4 8 7 5 11 5C13 5 15 6 16 8C17 6 19 5 21 5C25 5 28 8 28 12C28 18 16 28 16 28Z" fill="#ec4899" stroke="#ec4899" strokeWidth="1"/>
                  <path d="M16 28 Q12 24 8 20 Q6 16 10 14 Q14 12 16 16 Q18 20 22 18 Q26 16 24 20 Q20 24 16 28" stroke="#be185d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M16 26 Q13 22 10 19 Q8 17 11 16 Q14 15 16 18 Q18 21 21 19 Q24 17 22 19 Q19 22 16 26" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">SexyFlow</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Central de Ajuda
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Encontre respostas para suas dúvidas e aprenda a usar o SexyFlow como um profissional.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Digite sua dúvida aqui..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Como podemos ajudar?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <MessageCircle className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chat ao Vivo</h3>
              <p className="text-gray-600 mb-6">Converse conosco em tempo real para resolver suas dúvidas rapidamente.</p>
              <a href="https://wa.me/5531997783097" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block">
                Iniciar Chat
              </a>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <FileText className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Documentação</h3>
              <p className="text-gray-600 mb-6">Guias detalhados e tutoriais para usar todas as funcionalidades.</p>
              <Link href="/docs" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block">
                Ver Documentação
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <Video className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tutoriais em Vídeo</h3>
              <p className="text-gray-600 mb-6">Aprenda visualmente com nossos tutoriais em vídeo.</p>
              <Link href="/tutorials" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block">
                Ver Tutoriais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Entre em contato conosco e teremos prazer em ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5531997783097" className="bg-white hover:bg-gray-50 text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
            <a href="mailto:suporte@sexyflow.com" className="bg-pink-700 hover:bg-pink-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2" />
              Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
