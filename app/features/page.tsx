'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Shield, Users, BarChart3, Palette, Globe, Smartphone } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-pink-600" />,
      title: "Editor Visual Drag & Drop",
      description: "Crie páginas profissionais sem conhecimento técnico. Interface intuitiva e fácil de usar."
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-600" />,
      title: "Hospedagem Inclusa",
      description: "Suas páginas ficam online instantaneamente. Hospedagem rápida e confiável incluída."
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "Analytics Avançados",
      description: "Acompanhe visitantes, vendas e conversões. Dados detalhados para otimizar suas campanhas."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-pink-600" />,
      title: "Relatórios Detalhados",
      description: "Visualize o desempenho das suas páginas com gráficos e métricas em tempo real."
    },
    {
      icon: <Palette className="w-8 h-8 text-pink-600" />,
      title: "Templates Profissionais",
      description: "Dezenas de templates prontos para diferentes nichos e necessidades."
    },
    {
      icon: <Globe className="w-8 h-8 text-pink-600" />,
      title: "Domínios Customizados",
      description: "Use seu próprio domínio ou subdomínio personalizado para maior credibilidade."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-pink-600" />,
      title: "Design Responsivo",
      description: "Suas páginas se adaptam perfeitamente a qualquer dispositivo."
    }
  ];

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
            Recursos do SexyFlow
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tudo que você precisa para criar páginas de vendas profissionais e aumentar suas conversões.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Crie sua primeira página de vendas em minutos
          </p>
          <Link
            href="/plans"
            className="bg-white hover:bg-gray-50 text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            Escolher Plano
          </Link>
        </div>
      </section>
    </div>
  );
}
