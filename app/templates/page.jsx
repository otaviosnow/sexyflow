export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Templates Premium
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Páginas prontas para você personalizar e começar a vender
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-light-border overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-light-text mb-2">
                Template Hot 1
              </h3>
              <p className="text-light-text-secondary mb-4">
                Design moderno e atrativo para páginas de vendas
              </p>
              <a 
                href="/register" 
                className="text-accent-pink hover:text-pink-600 font-medium"
              >
                Usar Template →
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-light-border overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-accent-blue/20 to-accent-green/20"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-light-text mb-2">
                Template Hot 2
              </h3>
              <p className="text-light-text-secondary mb-4">
                Layout otimizado para conversão e vendas
              </p>
              <a 
                href="/register" 
                className="text-accent-pink hover:text-pink-600 font-medium"
              >
                Usar Template →
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-light-border overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-light-text mb-2">
                Template Hot 3
              </h3>
              <p className="text-light-text-secondary mb-4">
                Design elegante e profissional
              </p>
              <a 
                href="/register" 
                className="text-accent-pink hover:text-pink-600 font-medium"
              >
                Usar Template →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
