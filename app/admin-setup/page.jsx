'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('teste90@gmail.com')
  const [secretKey, setSecretKey] = useState('sexyflow-admin-2024')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleMakeAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secretKey })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erro ao tornar usuário admin')
      }
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-accent-pink rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-light-text">SexyFlow</h1>
          </Link>
        </div>
        
        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-light-text mb-2 text-center">🔧 Setup Admin</h2>
            <p className="text-light-text-secondary text-center text-sm">
              Página de teste para tornar usuário admin
            </p>
          </div>
          
          <form onSubmit={handleMakeAdmin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Email do Usuário
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent transition-all"
                placeholder="usuario@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Chave Secreta
              </label>
              <input
                type="text"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent transition-all"
                placeholder="sexyflow-admin-2024"
              />
              <p className="text-xs text-light-text-secondary mt-1">
                Chave padrão: sexyflow-admin-2024
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-2">✅ {result.message}</p>
                <div className="text-xs space-y-1">
                  <p><strong>Email:</strong> {result.user.email}</p>
                  <p><strong>Nome:</strong> {result.user.name}</p>
                  <p><strong>Role:</strong> {result.user.role}</p>
                  <p><strong>Plano:</strong> {result.user.plan}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-pink text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? '⏳ Processando...' : '🔑 Tornar Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-light-border">
            <p className="text-xs text-light-text-secondary text-center">
              ⚠️ Esta é uma página de desenvolvimento. <br />
              Remova em produção por segurança.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-accent-pink hover:text-pink-600 font-medium text-sm">
            ← Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  )
}

