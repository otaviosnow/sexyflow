export default function DemoPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Demo do SexyFlow
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Veja como é fácil criar páginas de vendas profissionais
          </p>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-accent-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-light-text mb-4">
              Demo Interativo
            </h2>
            <p className="text-light-text-secondary mb-8 max-w-2xl mx-auto">
              Experimente nosso editor visual e veja como é simples criar páginas profissionais. 
              Arraste, solte e personalize elementos em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register" 
                className="bg-accent-pink text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Começar Demo Grátis
              </a>
              <a 
                href="/contact" 
                className="border border-light-border text-light-text px-8 py-4 rounded-lg text-lg font-medium hover:bg-light-surface transition-colors"
              >
                Agendar Demonstração
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
