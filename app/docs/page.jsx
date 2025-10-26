export default function DocsPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Documentação
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Guias completos para usar todas as funcionalidades do SexyFlow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="w-12 h-12 bg-accent-pink/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-light-text mb-3">
              Guia de Início
            </h3>
            <p className="text-light-text-secondary mb-4">
              Aprenda os conceitos básicos e comece a criar suas primeiras páginas
            </p>
            <a 
              href="#" 
              className="text-accent-pink hover:text-pink-600 font-medium"
            >
              Ler Guia →
            </a>
          </div>

          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-light-text mb-3">
              Editor Visual
            </h3>
            <p className="text-light-text-secondary mb-4">
              Domine todas as funcionalidades do nosso editor drag & drop
            </p>
            <a 
              href="#" 
              className="text-accent-pink hover:text-pink-600 font-medium"
            >
              Ver Tutorial →
            </a>
          </div>

          <div className="bg-white p-8 rounded-xl border border-light-border">
            <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-light-text mb-3">
              Analytics
            </h3>
            <p className="text-light-text-secondary mb-4">
              Entenda como interpretar seus dados e otimizar conversões
            </p>
            <a 
              href="#" 
              className="text-accent-pink hover:text-pink-600 font-medium"
            >
              Aprender Mais →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
