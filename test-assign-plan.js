// Script para testar atribuição de plano
const https = require('https');

function assignTestPlan() {
  const options = {
    hostname: 'sexyflow.onrender.com',
    port: 443,
    path: '/api/assign-test-plan',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
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
        console.log('📊 Resposta da API:');
        console.log('==================');
        console.log(JSON.stringify(response, null, 2));
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

console.log('🚀 Atribuindo plano de teste...');
assignTestPlan();
