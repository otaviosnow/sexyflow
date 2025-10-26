export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Política de Privacidade
          </h1>
          <p className="text-light-text-secondary">
            Última atualização: 1º de janeiro de 2024
          </p>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-light-text mb-4">
              Informações que Coletamos
            </h2>
            <p className="text-light-text-secondary mb-6">
              Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, 
              faz uma compra ou entra em contato conosco. Isso pode incluir seu nome, endereço de email, 
              informações de pagamento e outras informações que você escolhe fornecer.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Como Usamos suas Informações
            </h2>
            <p className="text-light-text-secondary mb-6">
              Usamos as informações coletadas para fornecer, manter e melhorar nossos serviços, 
              processar transações, enviar comunicações técnicas e de suporte, e cumprir obrigações legais.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Compartilhamento de Informações
            </h2>
            <p className="text-light-text-secondary mb-6">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto conforme descrito nesta política ou com seu consentimento explícito.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Segurança
            </h2>
            <p className="text-light-text-secondary mb-6">
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
              proteger suas informações pessoais contra acesso não autorizado, alteração, 
              divulgação ou destruição.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Seus Direitos
            </h2>
            <p className="text-light-text-secondary mb-6">
              Você tem o direito de acessar, atualizar ou excluir suas informações pessoais. 
              Você também pode optar por não receber comunicações de marketing de nossa parte.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Contato
            </h2>
            <p className="text-light-text-secondary">
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco 
              em <a href="mailto:privacy@sexyflow.com.br" className="text-accent-pink hover:text-pink-600">privacy@sexyflow.com.br</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
