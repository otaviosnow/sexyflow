export default function ContactPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Estamos aqui para ajudar você a criar páginas de vendas incríveis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-light-text mb-6">
              Fale Conosco
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-pink/10 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-light-text mb-1">Email</h3>
                  <p className="text-light-text-secondary">suporte@sexyflow.com.br</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-light-text mb-1">WhatsApp</h3>
                  <p className="text-light-text-secondary">(11) 99999-9999</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-light-text mb-1">Telefone</h3>
                  <p className="text-light-text-secondary">(11) 3333-4444</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-light-border">
            <h2 className="text-2xl font-bold text-light-text mb-6">
              Envie uma Mensagem
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Nome
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-light-border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-light-border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Mensagem
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 border border-light-border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-transparent"
                  placeholder="Como podemos ajudar você?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-accent-pink text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
