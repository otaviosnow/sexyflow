export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-light-text mb-4">
            Política de Cookies
          </h1>
          <p className="text-light-text-secondary">
            Última atualização: 1º de janeiro de 2024
          </p>
        </div>

        <div className="bg-white rounded-xl border border-light-border p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-light-text mb-4">
              O que são Cookies
            </h2>
            <p className="text-light-text-secondary mb-6">
              Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você 
              visita nosso site. Eles nos ajudam a fornecer uma melhor experiência de usuário e a entender 
              como você interage com nosso serviço.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Como Usamos Cookies
            </h2>
            <p className="text-light-text-secondary mb-6">
              Utilizamos cookies para autenticação, lembrar suas preferências, analisar o tráfego do site 
              e personalizar conteúdo. Alguns cookies são essenciais para o funcionamento do site, 
              enquanto outros nos ajudam a melhorar sua experiência.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Tipos de Cookies
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-light-text mb-2">Cookies Essenciais</h3>
                <p className="text-light-text-secondary">
                  Necessários para o funcionamento básico do site, incluindo autenticação e segurança.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-light-text mb-2">Cookies de Performance</h3>
                <p className="text-light-text-secondary">
                  Coletam informações sobre como você usa o site para nos ajudar a melhorá-lo.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-light-text mb-2">Cookies de Funcionalidade</h3>
                <p className="text-light-text-secondary">
                  Lembram suas preferências e configurações para personalizar sua experiência.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Gerenciamento de Cookies
            </h2>
            <p className="text-light-text-secondary mb-6">
              Você pode controlar e gerenciar cookies através das configurações do seu navegador. 
              No entanto, desabilitar certos cookies pode afetar a funcionalidade do site.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Cookies de Terceiros
            </h2>
            <p className="text-light-text-secondary mb-6">
              Podemos usar serviços de terceiros que definem seus próprios cookies. 
              Esses serviços têm suas próprias políticas de cookies que recomendamos que você leia.
            </p>

            <h2 className="text-2xl font-bold text-light-text mb-4">
              Contato
            </h2>
            <p className="text-light-text-secondary">
              Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco 
              em <a href="mailto:privacy@sexyflow.com.br" className="text-accent-pink hover:text-pink-600">privacy@sexyflow.com.br</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
