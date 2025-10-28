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
  Palette,
  HelpCircle,
  User,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // Redirecionar admins para painel admin
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin');
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      loadProjects();
    }
  }, [status, session, router]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/projects',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100'
    },
    {
      label: 'Páginas',
      icon: FileText,
      path: projects.length > 0 ? `/projects/${projects[0]._id}` : '/projects/create',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      label: 'Templates',
      icon: Palette,
      path: '/choose-plan',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      label: 'Meu Plano',
      icon: Crown,
      path: '/choose-plan',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100'
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: projects.length > 0 ? `/projects/${projects[0]._id}` : '/projects/create',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100'
    },
    {
      label: 'Perfil',
      icon: User,
      path: '/projects',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      label: 'Ajuda',
      icon: HelpCircle,
      path: 'https://wa.me/5531997783097',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      external: true
    }
  ];

      return (
        <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 28C16 28 4 18 4 12C4 8 7 5 11 5C13 5 15 6 16 8C17 6 19 5 21 5C25 5 28 8 28 12C28 18 16 28 16 28Z" fill="#ec4899" stroke="#ec4899" strokeWidth="1"/>
                <path d="M16 28 Q12 24 8 20 Q6 16 10 14 Q14 12 16 16 Q18 20 22 18 Q26 16 24 20 Q20 24 16 28" stroke="#be185d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M16 26 Q13 22 10 19 Q8 17 11 16 Q14 15 16 18 Q18 21 21 19 Q24 17 22 19 Q19 22 16 26" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">SexyFlow</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-sm">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.external) {
                  window.open(item.path, '_blank');
                } else {
                  router.push(item.path);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                item.external 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-pink-600 to-purple-600">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Layout className="h-6 w-6" />
                SexyFlow
              </h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.external) {
                      window.open(item.path, '_blank');
                    } else {
                      router.push(item.path);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${item.hoverColor} ${item.bgColor} hover:shadow-md`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className={`text-sm font-medium ${item.color}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-all text-red-600 hover:shadow-md"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              SexyFlow
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Bem-vindo, {session.user.name}!
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isAdmin ? 'Você tem acesso total ao sistema como administrador.' : 'Gerencie suas páginas de vendas em um só lugar.'}
                  </p>
                </div>
                {!isAdmin && (
                  <button
                    onClick={() => router.push('/projects/create')}
                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Projeto
                  </button>
                )}
              </div>
            </div>

          {/* Projects Section - Only for non-admin users */}
          {!isAdmin && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Meus Projetos</h3>
                <span className="text-sm text-gray-500">{projects.length} projeto(s)</span>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum projeto ainda
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                    Crie seu primeiro projeto e comece a construir suas páginas de vendas de alto impacto!
                  </p>
                  <button
                    onClick={() => router.push('/projects/create')}
                    className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Projeto
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/projects/${project._id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white rounded border">
                          <Layout className="h-4 w-4 text-gray-600" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${project._id}`);
                          }}
                          className="p-1 hover:bg-white rounded transition-colors"
                        >
                          <Settings className="h-3 w-3 text-gray-400" />
                        </button>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{project.description || 'Sem descrição'}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {project.subdomain}.sexyflow.onrender.com
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BarChart3 className="h-3 w-3" />
                        <span>0 visualizações</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

