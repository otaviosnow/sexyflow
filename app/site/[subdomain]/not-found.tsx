export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Projeto Não Encontrado
        </h2>
        
        <p className="text-gray-600 mb-6">
          O subdomínio que você está tentando acessar não existe ou foi desativado.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 mb-6">
          <p className="mb-2">Possíveis motivos:</p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>O projeto foi removido</li>
            <li>O subdomínio está incorreto</li>
            <li>O projeto está inativo</li>
          </ul>
        </div>
        
        <a
          href="https://sexyflow.onrender.com"
          className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
        >
          Ir para SexyFlow
        </a>
      </div>
    </div>
  );
}

