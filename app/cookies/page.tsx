'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Cookies</h1>
          
          <div className="prose max-w-none text-gray-700">
            <h2>O que são cookies?</h2>
            <p>Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita nosso site. Eles nos ajudam a melhorar sua experiência e fornecer funcionalidades personalizadas.</p>
            
            <h2>Como utilizamos cookies</h2>
            <p>Utilizamos cookies para:</p>
            <ul>
              <li>Manter sua sessão ativa</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar como você usa nosso site</li>
              <li>Melhorar a funcionalidade do site</li>
            </ul>
            
            <h2>Tipos de cookies que utilizamos</h2>
            <p><strong>Cookies essenciais:</strong> Necessários para o funcionamento básico do site.</p>
            <p><strong>Cookies de análise:</strong> Nos ajudam a entender como os visitantes interagem com o site.</p>
            <p><strong>Cookies de funcionalidade:</strong> Permitem que o site lembre suas escolhas.</p>
            
            <h2>Como gerenciar cookies</h2>
            <p>Você pode controlar e/ou deletar cookies como desejar. Você pode deletar todos os cookies que já estão no seu computador e pode configurar a maioria dos navegadores para impedir que sejam colocados.</p>
            
            <h2>Contato</h2>
            <p>Se você tiver dúvidas sobre nossa política de cookies, entre em contato conosco:</p>
            <p>Email: privacidade@sexyflow.com</p>
            <p>WhatsApp: (31) 99778-3097</p>
          </div>
        </div>
      </div>
    </div>
  );
}
