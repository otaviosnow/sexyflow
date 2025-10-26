export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Recursos do SexyFlow
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Tudo que você precisa para criar páginas de vendas profissionais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-light-text mb-3">
              Editor Visual
            </h3>
            <p className="text-light-text-secondary">
              Crie páginas arrastando e soltando elementos. Interface intuitiva e fácil de usar.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-light-text mb-3">
              Hospedagem Rápida
            </h3>
            <p className="text-light-text-secondary">
              Suas páginas ficam online instantaneamente com nossa infraestrutura global.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-light-text mb-3">
              Analytics Avançados
            </h3>
            <p className="text-light-text-secondary">
              Acompanhe visitantes, vendas e conversões com métricas detalhadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
