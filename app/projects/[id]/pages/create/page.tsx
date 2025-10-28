'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus, Palette, FileText, Sparkles, Zap, Star, Crown } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  icon: any;
  color: string;
  isPremium: boolean;
}

const templates: Template[] = [
  {
    id: 'blank',
    name: 'Página em Branco',
    description: 'Comece do zero com total liberdade criativa',
    category: 'Básico',
    preview: '/templates/blank-preview.jpg',
    icon: FileText,
    color: 'bg-gray-500',
    isPremium: false
  },
  {
    id: 'landing-sales',
    name: 'Landing de Vendas',
    description: 'Página otimizada para conversão e vendas',
    category: 'Vendas',
    preview: '/templates/sales-preview.jpg',
    icon: Zap,
    color: 'bg-green-500',
    isPremium: false
  },
  {
    id: 'hot-niche',
    name: 'Nicho Hot',
    description: 'Template especializado para nichos adultos',
    category: 'Adulto',
    preview: '/templates/hot-preview.jpg',
    icon: Sparkles,
    color: 'bg-pink-500',
    isPremium: true
  },
  {
    id: 'fitness',
    name: 'Fitness & Saúde',
    description: 'Perfeito para coaches e produtos fitness',
    category: 'Fitness',
    preview: '/templates/fitness-preview.jpg',
    icon: Star,
    color: 'bg-blue-500',
    isPremium: true
  },
  {
    id: 'luxury',
    name: 'Luxo & Premium',
    description: 'Design elegante para produtos de alto valor',
    category: 'Luxo',
    preview: '/templates/luxury-preview.jpg',
    icon: Crown,
    color: 'bg-purple-500',
    isPremium: true
  }
];

export default function CreatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCreatePage = () => {
    if (!selectedTemplate) return;
    
    // Redirecionar para o editor com o template selecionado
    router.push(`/projects/${params.id}/pages/create/editor?template=${selectedTemplate}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${params.id}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Projeto
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Criar Nova Página
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Escolha um Template
          </h2>
          <p className="text-gray-600">
            Selecione um template para começar ou crie sua página do zero
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`relative bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'border-pink-500 ring-2 ring-pink-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                </div>
              )}

              {/* Template Preview */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full ${template.color} flex items-center justify-center`}>
                  <template.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                
                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <div className="flex items-center text-pink-600 text-sm font-medium">
                    <div className="w-2 h-2 bg-pink-600 rounded-full mr-2"></div>
                    Selecionado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push(`/projects/${params.id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleCreatePage}
            disabled={!selectedTemplate}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Página
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Dica:</strong> Você pode personalizar qualquer template após a criação
          </p>
        </div>
      </div>
    </div>
  );
}