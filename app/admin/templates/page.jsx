'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates')
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (templateId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        setTemplates(templates.map(t => 
          t.id === templateId ? { ...t, isActive: !currentStatus } : t
        ))
      }
    } catch (error) {
      console.error('Erro ao atualizar template:', error)
    }
  }

  const handleDelete = async (templateId, templateName) => {
    if (!confirm(`Tem certeza que deseja deletar o template "${templateName}"?`)) {
      return
    }

    setDeletingId(templateId)

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId))
      } else {
        alert('Erro ao deletar template')
      }
    } catch (error) {
      console.error('Erro ao deletar template:', error)
      alert('Erro ao deletar template')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-light-text">Carregando templates...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-light-text mb-2">Templates</h1>
          <p className="text-light-text-secondary">Gerencie os templates disponíveis para os usuários</p>
        </div>
        <Link
          href="/admin/templates/create"
          className="bg-accent-pink text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          + Criar Template
        </Link>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-light-border p-12 text-center">
          <div className="w-16 h-16 bg-light-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-light-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-light-text mb-2">Nenhum template criado</h3>
          <p className="text-light-text-secondary mb-6">Crie seu primeiro template para os usuários</p>
          <Link
            href="/admin/templates/create"
            className="inline-block bg-accent-pink text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Criar Primeiro Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-light-border overflow-hidden hover:shadow-lg transition-all">
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 flex items-center justify-center">
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-light-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-light-text mb-1">{template.name}</h3>
                    <p className="text-sm text-light-text-secondary line-clamp-2">{template.description || 'Sem descrição'}</p>
                  </div>
                </div>

                {/* Status e Stats */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    template.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {template.isActive ? '✓ Ativo' : '✗ Inativo'}
                  </span>
                  <span className="text-xs text-light-text-secondary">
                    {template.usageCount || 0} usos
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
                    className="flex-1 px-3 py-2 bg-light-bg text-light-text rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(template.id, template.isActive)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      template.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {template.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(template.id, template.name)}
                    disabled={deletingId === template.id}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === template.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

