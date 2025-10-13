'use client';

import { useState } from 'react';
import { CreditCard, User, Mail, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentFormProps {
  planName: 'monthly' | 'annual';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ planName, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do cliente
    name: '',
    email: '',
    document: '', // CPF
    
    // Dados do cartão
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holderName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          customerData: {
            name: formData.name,
            email: formData.email,
            document: formData.document
          },
          paymentMethod: {
            type: 'credit_card',
            card: {
              number: formData.cardNumber.replace(/\s/g, ''),
              exp_month: parseInt(formData.expMonth),
              exp_year: parseInt(formData.expYear),
              cvc: formData.cvc,
              holder_name: formData.holderName
            }
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Assinatura criada com sucesso!');
        onSuccess();
      } else {
        toast.error(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Finalizar Assinatura
        </h3>
        <p className="text-gray-600">
          Plano {planName === 'monthly' ? 'Mensal' : 'Anual'} - R$ {planName === 'monthly' ? '97' : '970'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Dados Pessoais
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF *
            </label>
            <input
              type="text"
              value={formData.document}
              onChange={(e) => setFormData(prev => ({ ...prev, document: formatCPF(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>
        </div>

        {/* Dados do Cartão */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Dados do Cartão
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Cartão *
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês *
              </label>
              <input
                type="text"
                value={formData.expMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, expMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="MM"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano *
              </label>
              <input
                type="text"
                value={formData.expYear}
                onChange={(e) => setFormData(prev => ({ ...prev, expYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="AAAA"
                maxLength={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVC *
              </label>
              <input
                type="text"
                value={formData.cvc}
                onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="000"
                maxLength={3}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome no Cartão *
            </label>
            <input
              type="text"
              value={formData.holderName}
              onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nome como está no cartão"
              required
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              'Finalizar Pagamento'
            )}
          </button>
        </div>

        {/* Segurança */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Pagamento seguro processado pela Cakto
          </p>
        </div>
      </form>
    </div>
  );
}
