'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Plus, 
  Settings, 
  Layout, 
  LogOut, 
  Crown,
  FileText,
  BarChart3,
  Shield,
  Home,
  Palette
} from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header/Navbar */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                SexyFlow
              </h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold rounded-full shadow-md">
                  <Crown className="h-3 w-3" />
                  ADMIN
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Início</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/admin/templates/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Template</span>
                  </button>
                </>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo, {session.user.name}! 👋
              </h2>
              <p className="text-gray-600">
                {isAdmin ? 'Você tem acesso total ao sistema como administrador.' : 'Gerencie suas páginas de vendas em um só lugar.'}
              </p>
            </div>
            <button
              onClick={() => router.push('/projects/create')}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Novo Projeto
            </button>
          </div>
        </div>

        {/* Quick Actions - Only for Admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => router.push('/admin')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-pink-400 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg group-hover:from-pink-200 group-hover:to-purple-200 transition-all">
                  <Shield className="h-8 w-8 text-pink-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Painel Admin</h3>
                  <p className="text-sm text-gray-600">Gerenciar sistema</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/templates/create')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-400 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                  <Palette className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Criar Template</h3>
                  <p className="text-sm text-gray-600">Editor visual</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/templates')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-green-400 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                  <Layout className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-600">Ver todos</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Projects Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Meus Projetos</h3>
            <span className="text-sm text-gray-500">{projects.length} projeto(s)</span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
                <FileText className="h-10 w-10 text-pink-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum projeto ainda
              </h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Crie seu primeiro projeto e comece a construir suas páginas de vendas de alto impacto!
              </p>
              <button
                onClick={() => router.push('/projects/create')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:scale-105 border border-gray-200 cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Layout className="h-6 w-6 text-pink-600" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Adicionar ação de configurações
                      }}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{project.description || 'Sem descrição'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BarChart3 className="h-3 w-3" />
                    <span>0 visualizações</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

