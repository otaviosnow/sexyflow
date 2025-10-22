'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Globe, Settings, Eye, Edit, Trash2, Crown, Star, Phone } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive';
  pages: number;
  maxPages: number;
  createdAt: string;
}

interface UserPlan {
  name: string;
  displayName: string;
  features: {
    subdomains: number;
    pagesPerSubdomain: number;
    customDomain: boolean;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(currentUser);
    setUser(userData);

    // Carregar plano do usuário
    const subscription = localStorage.getItem(`subscription_${userData.id}`);
    if (subscription) {
      const subData = JSON.parse(subscription);
      // Simular dados do plano baseado no ID
      const planData = {
        'plan-starter': {
          name: 'STARTER',
          displayName: 'Plano Starter',
          features: { subdomains: 1, pagesPerSubdomain: 3, customDomain: false }
        },
        'plan-pro': {
          name: 'PRO',
          displayName: 'Plano Pro',
          features: { subdomains: 3, pagesPerSubdomain: 8, customDomain: true }
        },
        'plan-enterprise': {
          name: 'ENTERPRISE',
          displayName: 'Plano Enterprise',
          features: { subdomains: -1, pagesPerSubdomain: -1, customDomain: true }
        }
      };
      setUserPlan(planData[subData.planId as keyof typeof planData] || planData['plan-starter']);
    } else {
      // Se chegou até aqui sem plano, algo deu errado - redirecionar para escolha
      console.warn('Usuário sem plano chegou na página de projetos');
      router.push('/choose-plan');
      return;
    }

    // Carregar projetos do usuário
    const userProjects = localStorage.getItem(`projects_${userData.id}`);
    if (userProjects) {
      setProjects(JSON.parse(userProjects));
    }

    setIsLoading(false);
  }, [router]);

  const createNewProject = () => {
    if (!userPlan) return;

    const currentProjects = projects.length;
    const maxProjects = userPlan.features.subdomains === -1 ? 999 : userPlan.features.subdomains;

    if (currentProjects >= maxProjects) {
      alert(`Você atingiu o limite de ${maxProjects} projeto(s) para o seu plano ${userPlan.displayName}.`);
      return;
    }

    // Abrir modal de criação de projeto
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Criar Novo Projeto</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nome do Projeto
            </label>
            <input 
              type="text" 
              id="projectName" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Ex: Meu Site de Vendas"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Subdomínio
            </label>
            <div class="flex">
              <input 
                type="text" 
                id="subdomain" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="meusite"
              />
              <span class="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                .sexyflow.com
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Apenas letras, números e hífens. Mínimo 3 caracteres.
            </p>
          </div>
          
          ${userPlan.features.customDomain ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Domínio Customizado (Opcional)
            </label>
            <input 
              type="text" 
              id="customDomain" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Ex: meusite.com.br"
            />
            <p class="text-xs text-gray-500 mt-1">
              Se preenchido, será usado em vez do subdomínio.
            </p>
          </div>
          ` : ''}
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button 
            id="cancelBtn"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            id="createBtn"
            class="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Criar Projeto
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const projectNameInput = modal.querySelector('#projectName') as HTMLInputElement;
    const subdomainInput = modal.querySelector('#subdomain') as HTMLInputElement;
    const customDomainInput = modal.querySelector('#customDomain') as HTMLInputElement;
    const cancelBtn = modal.querySelector('#cancelBtn');
    const createBtn = modal.querySelector('#createBtn');

    const validateSubdomain = (subdomain: string) => {
      if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
        return 'Subdomínio deve conter apenas letras, números e hífen';
      }
      if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
        return 'Subdomínio não pode começar ou terminar com hífen';
      }
      if (subdomain.length < 3) {
        return 'Subdomínio deve ter pelo menos 3 caracteres';
      }
      return null;
    };

    const validateCustomDomain = (domain: string) => {
      if (!domain) return null;
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,})$/;
      if (!domainRegex.test(domain)) {
        return 'Domínio inválido';
      }
      return null;
    };

    createBtn?.addEventListener('click', () => {
      const projectName = projectNameInput.value.trim();
      const subdomain = subdomainInput.value.trim().toLowerCase();
      const customDomain = customDomainInput?.value.trim();

      if (!projectName) {
        alert('Nome do projeto é obrigatório');
        return;
      }

      if (!subdomain) {
        alert('Subdomínio é obrigatório');
        return;
      }

      const subdomainError = validateSubdomain(subdomain);
      if (subdomainError) {
        alert(subdomainError);
        return;
      }

      if (customDomain) {
        const domainError = validateCustomDomain(customDomain);
        if (domainError) {
          alert(domainError);
          return;
        }
      }

      // Verificar se subdomínio já existe
      const existingProject = projects.find(p => p.subdomain === subdomain);
      if (existingProject) {
        alert('Este subdomínio já está em uso');
        return;
      }

      // Criar projeto
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: projectName,
        subdomain: subdomain,
        status: 'active',
        pages: 0,
        maxPages: userPlan.features.pagesPerSubdomain === -1 ? 999 : userPlan.features.pagesPerSubdomain,
        createdAt: new Date().toISOString()
      };

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem(`projects_${user!.id}`, JSON.stringify(updatedProjects));

      document.body.removeChild(modal);
    });

    cancelBtn?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const enterProject = (project: Project) => {
    // Salvar projeto atual na sessão
    localStorage.setItem('currentProject', JSON.stringify(project));
    // Redirecionar para dashboard do projeto
    router.push(`/dashboard?project=${project.id}`);
  };

  const getPlanIcon = () => {
    if (!userPlan) return <Star className="w-5 h-5" />;
    
    switch (userPlan.name) {
      case 'STARTER':
        return <Star className="w-5 h-5" />;
      case 'PRO':
        return <Crown className="w-5 h-5" />;
      case 'ENTERPRISE':
        return <Phone className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getPlanColor = () => {
    if (!userPlan) return 'text-gray-500';
    
    switch (userPlan.name) {
      case 'STARTER':
        return 'text-blue-500';
      case 'PRO':
        return 'text-pink-500';
      case 'ENTERPRISE':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">SexyFlow</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Plano do usuário */}
              {userPlan && (
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  {getPlanIcon()}
                  <span className={`font-medium ${getPlanColor()}`}>
                    {userPlan.displayName}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  router.push('/');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name || 'Usuário'}! 👋
          </h2>
          <p className="text-gray-600">
            Gerencie seus projetos e crie páginas de vendas profissionais
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projetos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Páginas Criadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((total, project) => total + project.pages, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Settings className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Limite do Plano</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userPlan?.features.subdomains === -1 ? '∞' : userPlan?.features.subdomains || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Seus Projetos</h3>
              <button
                onClick={createNewProject}
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </button>
            </div>
          </div>

          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum projeto criado ainda
                </h3>
                <p className="text-gray-500 mb-6">
                  Crie seu primeiro projeto para começar a criar páginas de vendas
                </p>
                <button
                  onClick={createNewProject}
                  className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Projeto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-500">{project.subdomain}.sexyflow.com</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Páginas</span>
                        <span>{project.pages}/{project.maxPages === 999 ? '∞' : project.maxPages}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-600 h-2 rounded-full" 
                          style={{ 
                            width: `${project.maxPages === 999 ? 0 : (project.pages / project.maxPages) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => enterProject(project)}
                        className="flex-1 bg-pink-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                      >
                        Entrar
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
