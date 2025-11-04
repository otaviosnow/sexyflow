'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Settings, 
  Save,
  Database,
  Mail,
  Globe,
  Shield,
  Bell,
  Palette,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    // Configurações Gerais
    siteName: 'SexyFlow',
    siteDescription: 'Plataforma de criação de páginas de vendas',
    supportEmail: 'suporte@sexyflow.com',
    supportWhatsApp: '5531997783097',
    
    // Configurações de Email
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    
    // Configurações de Domínio
    baseDomain: 'sexyflow.com.br',
    allowCustomDomains: true,
    
    // Configurações de Planos
    enableFreeTrial: false,
    trialDays: 7,
    
    // Configurações de Notificações
    emailNotifications: true,
    whatsappNotifications: false,
    
    // Manutenção
    maintenanceMode: false,
    maintenanceMessage: 'Estamos em manutenção. Voltamos em breve!',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/projects');
      return;
    }
  }, [status, session, router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulação de salvamento (você pode criar uma API para isso)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-300 hover:text-pink-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg">
                  <Settings className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Configurações do Sistema
                  </h1>
                  <p className="text-sm text-gray-400">
                    Gerencie as configurações globais da plataforma
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Configurações Gerais */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Site
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email de Suporte
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição do Site
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp de Suporte
              </label>
              <input
                type="tel"
                value={settings.supportWhatsApp}
                onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
                placeholder="5531997783097"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Email */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Configurações de Email (SMTP)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Servidor SMTP
              </label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Porta SMTP
              </label>
              <input
                type="text"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                placeholder="587"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuário SMTP
              </label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                placeholder="seu-email@gmail.com"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha SMTP
              </label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Domínio */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Configurações de Domínio</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domínio Base
              </label>
              <input
                type="text"
                value={settings.baseDomain}
                onChange={(e) => setSettings({ ...settings, baseDomain: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowCustomDomains}
                  onChange={(e) => setSettings({ ...settings, allowCustomDomains: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-pink-600 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-300">
                  Permitir domínios personalizados
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Configurações de Planos */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Configurações de Planos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableFreeTrial}
                  onChange={(e) => setSettings({ ...settings, enableFreeTrial: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-pink-600 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-300">
                  Habilitar período de teste gratuito
                </span>
              </label>
            </div>

            {settings.enableFreeTrial && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dias de Teste Gratuito
                </label>
                <input
                  type="number"
                  value={settings.trialDays}
                  onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Configurações de Notificações */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-pink-600 focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-300">
                Enviar notificações por email
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappNotifications}
                onChange={(e) => setSettings({ ...settings, whatsappNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-pink-600 focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-300">
                Enviar notificações por WhatsApp
              </span>
            </label>
          </div>
        </div>

        {/* Modo Manutenção */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-red-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Modo Manutenção</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-red-600 focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-300">
                Ativar modo de manutenção (site ficará offline para usuários)
              </span>
            </label>

            {settings.maintenanceMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensagem de Manutenção
                </label>
                <textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Mobile) */}
        <div className="lg:hidden">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-semibold"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

