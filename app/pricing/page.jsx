export default function PricingPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Planos e Preços
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plano Starter */}
          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-light-text mb-2">Plano Starter</h3>
              <div className="text-3xl font-bold text-light-text">
                R$ 29,90<span className="text-lg text-light-text-secondary">/mês</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                1 subdomínio(s)
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3 páginas por subdomínio
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                10 fotos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                10 vídeos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Analytics básicos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Suporte via email
              </li>
            </ul>
            <a 
              href="/register" 
              className="w-full bg-light-text text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors block text-center"
            >
              Escolher Plano
            </a>
          </div>

          {/* Plano Pro */}
          <div className="bg-white p-8 rounded-xl border-2 border-accent-pink relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent-pink text-white px-4 py-1 rounded-full text-sm font-medium">
                90% das pessoas escolhem
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-light-text mb-2">Plano Pro</h3>
              <div className="text-3xl font-bold text-light-text">
                R$ 47,00<span className="text-lg text-light-text-secondary">/mês</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3 subdomínio(s)
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                8 páginas por subdomínio
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Domínio customizado
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                30 fotos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                20 vídeos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Analytics básicos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Suporte via WhatsApp
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Templates premium
              </li>
            </ul>
            <a 
              href="/register" 
              className="w-full bg-accent-pink text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors block text-center"
            >
              Escolher Plano
            </a>
          </div>

          {/* Plano Enterprise */}
          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-light-text mb-2">Plano Enterprise</h3>
              <div className="text-3xl font-bold text-light-text">
                Contato Direto
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Subdomínios ilimitados
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Páginas ilimitadas
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Domínio customizado
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Fotos ilimitadas
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Vídeos ilimitados
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Analytics básicos
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Suporte via telefone
              </li>
              <li className="flex items-center text-light-text-secondary">
                <svg className="w-5 h-5 text-accent-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Templates premium
              </li>
            </ul>
            <a 
              href="/contact" 
              className="w-full bg-accent-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors block text-center"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
