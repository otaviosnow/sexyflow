'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-light-text">Carregando estatísticas...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-text mb-2">Dashboard Admin</h1>
        <p className="text-light-text-secondary">Visão geral do sistema SexyFlow</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-light-text mb-1">
            {stats?.totalUsers || 0}
          </h3>
          <p className="text-sm text-light-text-secondary">Total de Usuários</p>
          <Link href="/admin/users" className="text-xs text-accent-pink hover:text-pink-600 mt-2 inline-block">
            Ver todos →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-light-text mb-1">
            {stats?.totalProjects || 0}
          </h3>
          <p className="text-sm text-light-text-secondary">Total de Projetos</p>
          <Link href="/admin/projects" className="text-xs text-accent-pink hover:text-pink-600 mt-2 inline-block">
            Ver todos →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-light-text mb-1">
            {stats?.totalPages || 0}
          </h3>
          <p className="text-sm text-light-text-secondary">Total de Páginas</p>
          <Link href="/admin/pages" className="text-xs text-accent-pink hover:text-pink-600 mt-2 inline-block">
            Ver todas →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-light-text mb-1">
            {stats?.totalTemplates || 0}
          </h3>
          <p className="text-sm text-light-text-secondary">Templates Ativos</p>
          <Link href="/admin/templates" className="text-xs text-accent-pink hover:text-pink-600 mt-2 inline-block">
            Gerenciar →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-light-border p-6 mb-8">
        <h2 className="text-xl font-bold text-light-text mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/templates/create"
            className="flex items-center gap-3 p-4 border border-light-border rounded-lg hover:border-accent-pink hover:bg-pink-50 transition-all"
          >
            <div className="w-10 h-10 bg-accent-pink rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-light-text">Criar Template</p>
              <p className="text-xs text-light-text-secondary">Novo template de página</p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 border border-light-border rounded-lg hover:border-accent-pink hover:bg-pink-50 transition-all"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-light-text">Gerenciar Usuários</p>
              <p className="text-xs text-light-text-secondary">Ver e editar usuários</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-4 border border-light-border rounded-lg hover:border-accent-pink hover:bg-pink-50 transition-all"
          >
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-light-text">Configurações</p>
              <p className="text-xs text-light-text-secondary">Ajustes do sistema</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-light-border p-6">
        <h2 className="text-xl font-bold text-light-text mb-4">Atividade Recente</h2>
        <div className="text-light-text-secondary text-sm">
          <p>Estatísticas detalhadas em breve...</p>
        </div>
      </div>
    </div>
  )
}

