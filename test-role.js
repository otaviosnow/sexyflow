// Script para testar verificação de role
const https = require('https');

function checkUserRole() {
  const options = {
    hostname: 'sexyflow.onrender.com',
    port: 443,
    path: '/api/check-user-role',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Verificação de Role:');
        console.log('======================');
        console.log(`Email: ${response.email || 'N/A'}`);
        console.log(`Nome: ${response.name || 'N/A'}`);
        console.log(`Role no banco: ${response.role || 'N/A'}`);
        console.log(`Role na sessão: ${response.sessionRole || 'N/A'}`);
        console.log(`É admin (banco): ${response.isAdmin ? '✅ Sim' : '❌ Não'}`);
        console.log(`É admin (sessão): ${response.sessionIsAdmin ? '✅ Sim' : '❌ Não'}`);
      } catch (error) {
        console.log('❌ Erro ao processar resposta:', error.message);
        console.log('📄 Resposta bruta:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });

  req.end();
}

console.log('🔍 Verificando role do usuário...');
checkUserRole();
