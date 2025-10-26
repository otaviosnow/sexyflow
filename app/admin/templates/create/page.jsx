'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Importar GrapesJS apenas no cliente
const GrapesJSEditor = dynamic(() => import('@/components/GrapesJSEditor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Carregando editor...</p></div>
})

export default function CreateTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('landing-page')
  const [isActive, setIsActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editorData, setEditorData] = useState(null)

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Nome do template é obrigatório')
      return
    }

    // Salvar dados do editor
    if (typeof window !== 'undefined' && window.saveGrapesJS) {
      window.saveGrapesJS()
    }

    // Aguardar um pouco para garantir que o editor salvou
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!editorData) {
      alert('Aguarde o editor carregar ou adicione conteúdo')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          category,
          isActive,
          html: editorData.html || '',
          css: editorData.css || '',
          gjsData: editorData.gjsData || {}
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Template criado com sucesso!')
        router.push('/admin/templates')
      } else {
        alert(data.error || 'Erro ao criar template')
      }
    } catch (error) {
      console.error('Erro ao criar template:', error)
      alert('Erro ao criar template')
    } finally {
      setSaving(false)
    }
  }

  const handleEditorSave = (data) => {
    setEditorData(data)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-light-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/templates')}
              className="text-light-text-secondary hover:text-light-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-light-text">Criar Template</h1>
              <p className="text-sm text-light-text-secondary">Use o editor para criar seu template</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent-pink text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Template'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-light-bg border-b border-light-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-1">
              Nome do Template *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-light-border rounded-lg text-light-text focus:outline-none focus:ring-2 focus:ring-accent-pink text-sm"
              placeholder="Ex: Landing Page Moderna"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-light-border rounded-lg text-light-text focus:outline-none focus:ring-2 focus:ring-accent-pink text-sm"
              placeholder="Descrição breve"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-light-border rounded-lg text-light-text focus:outline-none focus:ring-2 focus:ring-accent-pink text-sm"
            >
              <option value="landing-page">Landing Page</option>
              <option value="e-commerce">E-commerce</option>
              <option value="portfolio">Portfólio</option>
              <option value="blog">Blog</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-1">
              Status
            </label>
            <label className="flex items-center gap-2 px-3 py-2 bg-white border border-light-border rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-accent-pink focus:ring-accent-pink"
              />
              <span className="text-sm text-light-text">Ativar template</span>
            </label>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <GrapesJSEditor onSave={handleEditorSave} />
      </div>
    </div>
  )
}

