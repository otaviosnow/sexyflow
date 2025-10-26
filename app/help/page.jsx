export default function HelpPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Central de Ajuda
          </h1>
          <p className="text-xl text-light-text-secondary max-w-2xl mx-auto">
            Encontre respostas para suas dúvidas e aprenda a usar o SexyFlow
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl border border-light-border">
            <h3 className="text-xl font-semibold text-light-text mb-4">
              Perguntas Frequentes
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-light-text mb-2">
                  Como criar minha primeira página?
                </h4>
                <p className="text-light-text-secondary text-sm">
                  Após fazer login, clique em "Criar Página" e escolha um template. 
                  Use o editor visual para personalizar.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-light-text mb-2">
                  Posso usar meu próprio domínio?
                </h4>
                <p className="text-light-text-secondary text-sm">
                  Sim! Nos planos Pro e Enterprise você pode conectar seu domínio personalizado.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-light-text mb-2">
                  Como funciona o suporte?
                </h4>
                <p className="text-light-text-secondary text-sm">
                  Oferecemos suporte via email, WhatsApp e telefone dependendo do seu plano.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-light-border">
            <h3 className="text-xl font-semibold text-light-text mb-4">
              Contato
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-accent-pink mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-light-text-secondary">suporte@sexyflow.com.br</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-accent-pink mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-light-text-secondary">WhatsApp: (11) 99999-9999</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-accent-pink mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-light-text-secondary">Telefone: (11) 3333-4444</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
