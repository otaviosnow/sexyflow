// Script para verificar se o usuário teste90@gmail.com tem role ADMIN
const https = require('https');

function checkAdminUser() {
  const options = {
    hostname: 'sexyflow.onrender.com',
    port: 443,
    path: '/api/admin/debug-users',
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
        console.log('📊 Debug de Usuários:');
        console.log('====================');
        console.log(`Usuário atual: ${response.currentUser?.email || 'N/A'}`);
        console.log(`Role atual: ${response.currentUser?.role || 'N/A'}`);
        console.log(`É admin: ${response.currentUser?.isAdmin ? '✅ Sim' : '❌ Não'}`);
        console.log('');
        console.log('📋 Todos os usuários:');
        response.allUsers?.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email} - Role: ${user.role} ${user.role === 'ADMIN' ? '👑' : ''}`);
        });
        
        // Procurar especificamente pelo teste90@gmail.com
        const testUser = response.allUsers?.find(user => user.email === 'teste90@gmail.com');
        if (testUser) {
          console.log('');
          console.log('🎯 Usuário teste90@gmail.com encontrado:');
          console.log(`   Email: ${testUser.email}`);
          console.log(`   Nome: ${testUser.name}`);
          console.log(`   Role: ${testUser.role}`);
          console.log(`   É admin: ${testUser.role === 'ADMIN' ? '✅ Sim' : '❌ Não'}`);
        } else {
          console.log('');
          console.log('❌ Usuário teste90@gmail.com NÃO encontrado!');
        }
        
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

console.log('🔍 Verificando usuários e roles...');
checkAdminUser();
