export default function TermsPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Termos de Uso
          </h1>
          <p className="text-light-text-secondary">
            Última atualização: 1º de janeiro de 2024
          </p>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-light-text mb-4">
              Aceitação dos Termos
            </h2>
            <p className="text-light-text-secondary mb-6">
              Ao acessar e usar o SexyFlow, você concorda em cumprir e estar vinculado aos 
              termos e condições de uso estabelecidos nesta página.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Uso do Serviço
            </h2>
            <p className="text-light-text-secondary mb-6">
              Você concorda em usar o SexyFlow apenas para fins legais e de acordo com estes termos. 
              É proibido usar o serviço para atividades ilegais, prejudiciais ou que violem os direitos de terceiros.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Conta do Usuário
            </h2>
            <p className="text-light-text-secondary mb-6">
              Você é responsável por manter a confidencialidade de sua conta e senha. 
              Você concorda em aceitar responsabilidade por todas as atividades que ocorrem sob sua conta.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Propriedade Intelectual
            </h2>
            <p className="text-light-text-secondary mb-6">
              O SexyFlow e seu conteúdo original, recursos e funcionalidades são e permanecerão 
              propriedade exclusiva da empresa e seus licenciadores.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Limitação de Responsabilidade
            </h2>
            <p className="text-light-text-secondary mb-6">
              Em nenhuma circunstância o SexyFlow será responsável por danos diretos, indiretos, 
              incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar o serviço.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Modificações
            </h2>
            <p className="text-light-text-secondary mb-6">
              Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento. 
              Se uma revisão for material, tentaremos fornecer pelo menos 30 dias de aviso antes 
              de quaisquer novos termos entrarem em vigor.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Contato
            </h2>
            <p className="text-light-text-secondary">
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco 
              em <a href="mailto:legal@sexyflow.com.br" className="text-accent-pink hover:text-pink-600">legal@sexyflow.com.br</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
