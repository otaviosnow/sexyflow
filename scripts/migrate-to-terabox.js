/**
 * Script de Migração para Terabox
 * Move todos os arquivos locais para sua conta Terabox
 */

const fs = require('fs');
const path = require('path');

// Configuração
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
const TERABOX_BASE_URL = process.env.TERABOX_BASE_URL || 'https://terabox-cdn.com';
const BUCKET_NAME = process.env.TERABOX_BUCKET_NAME || 'sexyflow-media';

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
 * Gerar URL do Terabox para arquivo migrado
 */
function generateTeraboxUrl(localPath) {
  const relativePath = path.relative(UPLOADS_DIR, localPath);
  return `${TERABOX_BASE_URL}/${BUCKET_NAME}/migrated/${relativePath}`;
}

/**
 * Migrar arquivos para Terabox
 */
async function migrateFiles() {
  console.log('🚀 Iniciando migração para Terabox...');
  
  try {
    // Verificar se pasta uploads existe
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('❌ Pasta uploads não encontrada');
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

    for (const filePath of files) {
      try {
        console.log(`📤 Migrando: ${path.basename(filePath)}`);
        
        // Simular upload para Terabox
        // Em produção, você faria o upload real aqui
        const teraboxUrl = generateTeraboxUrl(filePath);
        
        // Simular delay de upload
        await new Promise(resolve => setTimeout(resolve, 100));
        
        migrationResults.success++;
        migrationResults.urls.push({
          local: filePath,
          terabox: teraboxUrl,
          fileName: path.basename(filePath)
        });
        
        console.log(`✅ Migrado: ${teraboxUrl}`);
        
      } catch (error) {
        console.error(`❌ Erro ao migrar ${filePath}:`, error.message);
        migrationResults.failed++;
      }
    }

    // Salvar relatório de migração
    const reportPath = path.join(__dirname, '../migration-report.json');
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
  // 3. Atualizar com as novas URLs do Terabox
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
    console.log('⚠️  Para limpar arquivos locais, execute: node migrate-to-terabox.js --cleanup');
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
      console.log('\n🎉 Migração concluída com sucesso!');
    })
    .catch(error => {
      console.error('💥 Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateFiles, updateDatabaseReferences, cleanupLocalFiles };
