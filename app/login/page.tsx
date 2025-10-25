'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Verificar se já está logado
  useEffect(() => {
    getSession().then(session => {
      if (session) {
        console.log('🔍 Já está logado:', session);
        router.push('/projects');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Tentando fazer login com:', formData.email);
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('📋 Resultado do login:', result);

      if (result?.error) {
        console.error('❌ Erro no login:', result.error);
        setError('Email ou senha incorretos');
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido!');
        console.log('Token salvo:', result);
        
        // Aguardar um pouco para garantir que a sessão seja criada
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se a sessão foi criada
        const session = await getSession();
        console.log('🔍 Sessão após login:', session);
        
        if (session) {
          console.log('✅ Sessão criada! Redirecionando...');
          window.location.href = '/projects';
        } else {
          console.error('❌ Sessão não foi criada!');
          setError('Erro ao criar sessão. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" className="text-pink-600">
                  {/* Coração principal */}
                  <path d="M16 28 Q12 24 8 20 Q6 16 10 14 Q14 12 16 16 Q18 20 22 18 Q26 16 24 20 Q20 24 16 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  {/* Rabo saindo de baixo, passando por dentro e saindo por fora */}
                  <path d="M16 28 Q12 24 8 20 Q6 16 10 14 Q14 12 16 16 Q18 20 22 18 Q26 16 24 20 Q20 24 16 28" stroke="#be185d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M16 26 Q13 22 10 19 Q8 17 11 16 Q14 15 16 18 Q18 21 21 19 Q24 17 22 19 Q19 22 16 26" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SexyFlow</h1>
          <p className="text-gray-600 mt-2">Crie páginas de vendas profissionais</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Entrar na sua conta</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Link para Registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="text-pink-600 hover:text-pink-500 font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © 2024 SexyFlow. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}