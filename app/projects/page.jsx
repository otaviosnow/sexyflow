'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadProjects()
    }
  }, [session])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (response.ok) {
        setProjects(data.projects || [])
      } else {
        console.error('Erro ao carregar projetos:', data.error)
        setProjects([])
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          subdomain: subdomain,
          description: `Projeto ${projectName}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Adicionar o novo projeto à lista
        setProjects([data.project, ...projects])
        setShowCreateModal(false)
        setProjectName('')
        setSubdomain('')
        setError('')
      } else {
        setError(data.error || 'Erro ao criar projeto')
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Tem certeza que deseja deletar o projeto "${projectName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setDeletingId(projectId)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remover o projeto da lista
        setProjects(projects.filter(p => p.id !== projectId && p._id !== projectId))
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao deletar projeto')
      }
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-light-text text-xl">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <header className="bg-white border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-accent-pink rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-light-text">SexyFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-light-text-secondary">Olá, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="text-light-text-secondary hover:text-light-text transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-light-text">Meus Projetos</h2>
            <p className="text-light-text-secondary mt-1">Cada projeto é um subdomínio onde você pode criar páginas</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-accent-pink text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            + Novo Projeto
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectId = project.id || project._id
            const isDeleting = deletingId === projectId
            
            return (
              <div key={projectId} className={`bg-white border border-light-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isDeleting ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-light-text mb-1">{project.name}</h3>
                    <p className="text-sm text-light-text-secondary line-clamp-2">{project.subdomain}.sexyflow.com.br</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button 
                      onClick={() => window.open(`https://${project.subdomain}.sexyflow.com.br`, '_blank')}
                      className="p-2 text-light-text-secondary hover:text-light-text transition-colors"
                      title="Visualizar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => router.push(`/pages?project=${projectId}`)}
                      className="p-2 text-light-text-secondary hover:text-accent-pink transition-colors"
                      title="Gerenciar páginas"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(projectId, project.name)}
                      disabled={isDeleting}
                      className="p-2 text-light-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Deletar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-light-text-secondary">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {project.isPublished && (
                    <div className="flex items-center gap-1 text-accent-green">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                      </svg>
                      <span>Publicado</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-light-bg rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-light-border">
                <svg className="h-10 w-10 text-light-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-light-text mb-3">Você ainda não tem projetos</h3>
              <p className="text-light-text-secondary mb-8">
                Crie seu primeiro projeto (subdomínio) e comece a construir páginas incríveis dentro dele.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-accent-pink text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Criar Primeiro Projeto
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Criar Projeto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-light-text">Novo Projeto</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-light-text-secondary hover:text-light-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
                  placeholder="Ex: Meu Site"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Subdomínio
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-4 py-3 bg-light-bg border border-light-border rounded-l-lg text-light-text placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
                    placeholder="meusite"
                  />
                  <span className="px-4 py-3 bg-light-bg border border-l-0 border-light-border rounded-r-lg text-light-text-secondary text-sm">
                    .sexyflow.com.br
                  </span>
                </div>
                <p className="text-xs text-light-text-secondary mt-2">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setError('')
                  }}
                  className="flex-1 px-4 py-3 bg-light-bg text-light-text rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !projectName || !subdomain}
                  className="flex-1 px-4 py-3 bg-accent-pink text-white rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Criando...' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
