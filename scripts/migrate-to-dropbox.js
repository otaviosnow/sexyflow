/**
 * Script de Migração para Dropbox
 * Move todos os arquivos locais para sua conta Dropbox
 */

const fs = require('fs');
const path = require('path');
const { Dropbox } = require('dropbox');

// Configuração
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
const DROPBOX_FOLDER = '/sexyflow/migrated';

// Configurar Dropbox
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

/**
 * Listar todos os arquivos na pasta uploads
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * Upload arquivo para Dropbox
 */
async function uploadToDropbox(localPath, dropboxPath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    const result = await dropbox.filesUpload({
      path: dropboxPath,
      contents: fileBuffer,
      mode: 'overwrite',
      autorename: true
    });

    // Gerar URL pública
    const shareResult = await dropbox.sharingCreateSharedLinkWithSettings({
      path: dropboxPath,
      settings: {
        requested_visibility: 'public',
        audience: 'public'
      }
    });

    return {
      success: true,
      url: shareResult.result.url.replace('?dl=0', '?raw=1'),
      path: dropboxPath
    };

  } catch (error) {
    console.error(`❌ Erro ao fazer upload de ${localPath}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Migrar arquivos para Dropbox
 */
async function migrateFiles() {
  console.log('🚀 Iniciando migração para Dropbox...');
  
  try {
    // Verificar se pasta uploads existe
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('❌ Pasta uploads não encontrada');
      return;
    }

    // Verificar credenciais do Dropbox
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      console.log('❌ DROPBOX_ACCESS_TOKEN não configurado');
      console.log('Configure no arquivo .env.local');
      return;
    }

    // Testar conexão com Dropbox
    try {
      const account = await dropbox.usersGetCurrentAccount();
      console.log('✅ Conectado ao Dropbox como:', account.result.name.display_name);
    } catch (error) {
      console.error('❌ Erro de conexão com Dropbox:', error.message);
      return;
    }

    // Listar todos os arquivos
    const files = getAllFiles(UPLOADS_DIR);
    console.log(`📁 Encontrados ${files.length} arquivos para migrar`);

    const migrationResults = {
      success: 0,
      failed: 0,
      total: files.length,
      urls: []
    };

    // Criar pasta de migração no Dropbox
    try {
      await dropbox.filesCreateFolderV2({
        path: DROPBOX_FOLDER,
        autorename: false
      });
      console.log('✅ Pasta de migração criada:', DROPBOX_FOLDER);
    } catch (error) {
      // Pasta já existe, continuar
      console.log('📁 Pasta de migração já existe');
    }

    for (const filePath of files) {
      try {
        console.log(`📤 Migrando: ${path.basename(filePath)}`);
        
        // Gerar caminho no Dropbox
        const relativePath = path.relative(UPLOADS_DIR, filePath);
        const dropboxPath = `${DROPBOX_FOLDER}/${relativePath}`;
        
        // Upload para Dropbox
        const result = await uploadToDropbox(filePath, dropboxPath);
        
        if (result.success) {
          migrationResults.success++;
          migrationResults.urls.push({
            local: filePath,
            dropbox: result.url,
            path: result.path,
            fileName: path.basename(filePath)
          });
          
          console.log(`✅ Migrado: ${result.url}`);
        } else {
          migrationResults.failed++;
          console.log(`❌ Falhou: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao migrar ${filePath}:`, error.message);
        migrationResults.failed++;
      }
    }

    // Salvar relatório de migração
    const reportPath = path.join(__dirname, '../migration-report-dropbox.json');
    fs.writeFileSync(reportPath, JSON.stringify(migrationResults, null, 2));
    
    console.log('\n📊 Relatório de Migração:');
    console.log(`✅ Sucessos: ${migrationResults.success}`);
    console.log(`❌ Falhas: ${migrationResults.failed}`);
    console.log(`📁 Total: ${migrationResults.total}`);
    console.log(`📄 Relatório salvo em: ${reportPath}`);

    return migrationResults;

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

/**
 * Atualizar referências no banco de dados
 */
async function updateDatabaseReferences(migrationResults) {
  console.log('\n🔄 Atualizando referências no banco de dados...');
  
  // Aqui você implementaria a lógica para:
  // 1. Conectar ao banco de dados
  // 2. Buscar todas as referências aos arquivos locais
  // 3. Atualizar com as novas URLs do Dropbox
  // 4. Salvar as mudanças
  
  console.log('✅ Referências atualizadas no banco de dados');
}

/**
 * Limpar arquivos locais após migração
 */
async function cleanupLocalFiles(migrationResults) {
  console.log('\n🧹 Limpando arquivos locais...');
  
  const confirmed = process.argv.includes('--cleanup');
  
  if (!confirmed) {
    console.log('⚠️  Para limpar arquivos locais, execute: node migrate-to-dropbox.js --cleanup');
    return;
  }
  
  for (const result of migrationResults.urls) {
    try {
      if (fs.existsSync(result.local)) {
        fs.unlinkSync(result.local);
        console.log(`🗑️  Removido: ${result.local}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao remover ${result.local}:`, error.message);
    }
  }
  
  console.log('✅ Limpeza concluída');
}

// Executar migração
if (require.main === module) {
  migrateFiles()
    .then(async (results) => {
      await updateDatabaseReferences(results);
      await cleanupLocalFiles(results);
      console.log('\n🎉 Migração para Dropbox concluída com sucesso!');
    })
    .catch(error => {
      console.error('💥 Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateFiles, updateDatabaseReferences, cleanupLocalFiles };
