'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPlanStatus, setUserPlanStatus] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Tentando fazer login com:', formData.email);
      
      // Simular verificação de credenciais (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se usuário existe no localStorage (simulação)
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = existingUsers.find((u: any) => u.email === formData.email && u.password === formData.password);
      
      if (!user) {
        setError('Email ou senha incorretos');
        return;
      }

      console.log('✅ Login bem-sucedido! Redirecionando...');
      
      // Salvar usuário atual no localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        age: user.age,
        createdAt: user.createdAt
      }));
      
      // Verificar se usuário tem plano ativo
      const subscription = localStorage.getItem(`subscription_${user.id}`);
      if (subscription) {
        const subData = JSON.parse(subscription);
        if (subData.status === 'active') {
          // Usuário tem plano ativo - mostrar status e redirecionar
          setUserPlanStatus(`✅ Plano ativo detectado! Redirecionando para seus projetos...`);
          setTimeout(() => {
            router.push('/projects');
          }, 1500);
        } else {
          // Usuário tem plano mas não está ativo
          setUserPlanStatus(`⚠️ Seu plano está inativo. Redirecionando para renovação...`);
          setTimeout(() => {
            router.push('/choose-plan');
          }, 1500);
        }
      } else {
        // Usuário não tem plano
        setUserPlanStatus(`📋 Nenhum plano ativo. Redirecionando para escolha de planos...`);
        setTimeout(() => {
          router.push('/choose-plan');
        }, 1500);
      }
      
    } catch (error) {
      console.error('💥 Erro no login:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-2xl shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text text-transparent mb-3">
            SexyFlow
          </h1>
          <p className="text-gray-300 text-lg">
            Crie páginas de vendas profissionais
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Entrar na sua conta
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {userPlanStatus && (
            <div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl mb-6">
              {userPlanStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-white placeholder-gray-400"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-white placeholder-gray-400"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/25 hover:scale-105"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 SexyFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
