'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Layout,
  Plus,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Crown,
  Palette,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    templates: 0,
    users: 0,
    projects: 0
  });

  useEffect(() => {
    console.log('🔍 Admin page - Status:', status);
    console.log('🔍 Admin page - Session:', session);
    console.log('🔍 Admin page - User role:', session?.user?.role);
    
    if (status === 'loading') return;

    if (!session) {
      console.log('❌ Admin page - Sem sessão, redirecionando para login');
      router.push('/login');
      return;
    }

    console.log('🔍 Admin page - Verificando role:', session.user.role);
    if (session.user.role !== 'ADMIN') {
      console.log('❌ Admin page - Role não é ADMIN, redirecionando para projects');
      router.push('/projects');
      return;
    }

    console.log('✅ Admin page - Acesso autorizado, carregando estatísticas');
    // Carregar estatísticas
    loadStats();
  }, [session, status, router]);

  const loadStats = async () => {
    try {
      // Carregar número de templates
      const templatesRes = await fetch('/api/admin/templates');
      if (templatesRes.ok) {
        const templates = await templatesRes.json();
        setStats(prev => ({ ...prev, templates: templates.length }));
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Painel Admin</h1>
                  <p className="text-xs text-gray-400">SexyFlow</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full">
                <Crown className="h-3 w-3" />
                ADMIN
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {session.user.name}
          </h2>
          <p className="text-gray-400">
            Gerencie templates, usuários e todo o sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-pink-500" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.templates}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Templates Criados</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.users}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Usuários Ativos</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.projects}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Projetos Ativos</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/admin/templates')}
              className="group bg-gray-900 border border-gray-800 hover:border-pink-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-pink-500/10 group-hover:bg-pink-500/20 rounded-lg transition-colors">
                  <Layout className="h-8 w-8 text-pink-500" />
                </div>
                <span className="text-gray-500 group-hover:text-pink-500 transition-colors">→</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Gerenciar Templates</h4>
              <p className="text-sm text-gray-400">Ver, editar e excluir templates existentes</p>
            </button>

            <button
              onClick={() => router.push('/admin/templates/create')}
              className="group bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-lg transition-colors">
                  <Plus className="h-8 w-8 text-blue-500" />
                </div>
                <span className="text-gray-500 group-hover:text-blue-500 transition-colors">→</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Criar Novo Template</h4>
              <p className="text-sm text-gray-400">Adicionar um novo template ao sistema</p>
            </button>

            <button
              onClick={() => router.push('/admin/users')}
              className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-lg transition-colors">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <span className="text-gray-500 group-hover:text-purple-500 transition-colors">→</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Gerenciar Usuários</h4>
              <p className="text-sm text-gray-400">Ver e gerenciar todos os usuários</p>
            </button>

            <button
              onClick={() => router.push('/admin/settings')}
              className="group bg-gray-900 border border-gray-800 hover:border-green-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/10 group-hover:bg-green-500/20 rounded-lg transition-colors">
                  <Settings className="h-8 w-8 text-green-500" />
                </div>
                <span className="text-gray-500 group-hover:text-green-500 transition-colors">→</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Configurações</h4>
              <p className="text-sm text-gray-400">Configurações gerais do sistema</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Atividade Recente</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-center text-gray-500 py-8">
              Nenhuma atividade recente para mostrar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

