# 🌩️ Configuração do Terabox - Armazenamento em Nuvem

## 📋 Visão Geral

O SexyFlow usa **Terabox** como solução de armazenamento em nuvem centralizada. Todos os uploads dos usuários são armazenados na **sua conta Terabox**, sem necessidade de login individual.

## 🎯 Vantagens

- ✅ **1TB gratuito** de armazenamento
- ✅ **Conta centralizada** - você controla tudo
- ✅ **Sem login individual** dos usuários
- ✅ **CDN global** para velocidade
- ✅ **Organização automática** por usuário
- ✅ **Otimização automática** de imagens

## 🔧 Configuração

### 1. Criar Conta Terabox

1. Acesse [terabox.com](https://terabox.com)
2. Crie sua conta (gratuita)
3. Acesse as configurações de API
4. Gere suas credenciais de API

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com suas credenciais:

```env
# Terabox Configuration
TERABOX_API_KEY=sua_api_key_aqui
TERABOX_API_SECRET=sua_api_secret_aqui
TERABOX_BUCKET_NAME=sexyflow-media
TERABOX_REGION=us-east-1
TERABOX_BASE_URL=https://terabox-cdn.com
```

### 3. Estrutura de Pastas

Os arquivos são organizados automaticamente:

```
sexyflow-media/
├── users/
│   ├── user-123/
│   │   ├── sexyflow-images/
│   │   ├── templates/
│   │   └── videos/
│   └── user-456/
│       ├── sexyflow-images/
│       └── templates/
└── anonymous/
    └── sexyflow-images/
```

## 🚀 Como Funciona

### Upload de Arquivos

1. **Usuário faz upload** → Sistema captura arquivo
2. **Gera ID único** → `timestamp-randomId.ext`
3. **Upload para sua conta** → Terabox via API
4. **Retorna URL** → `https://terabox-cdn.com/bucket/path`
5. **Salva no banco** → Referência à URL do Terabox

### Organização Automática

- **Por usuário**: `users/{userId}/`
- **Por tipo**: `sexyflow-images/`, `templates/`, `videos/`
- **Nomes únicos**: Evita conflitos
- **Metadados**: Tamanho, tipo, data de upload

## 📁 Migração de Arquivos Existentes

### 1. Executar Script de Migração

```bash
# Migrar arquivos locais para Terabox
node scripts/migrate-to-terabox.js

# Migrar e limpar arquivos locais
node scripts/migrate-to-terabox.js --cleanup
```

### 2. Atualizar Banco de Dados

O script gera um relatório `migration-report.json` com:
- ✅ Arquivos migrados com sucesso
- ❌ Arquivos com erro
- 🔗 Mapeamento local → Terabox URLs

### 3. Verificar Migração

```bash
# Verificar relatório
cat migration-report.json

# Verificar arquivos no Terabox
# (via interface web da sua conta)
```

## 🔒 Segurança

### Controle de Acesso

- **Sua conta** = controle total
- **Usuários** = apenas upload/download
- **API keys** = protegidas no servidor
- **URLs públicas** = CDN seguro

### Validação de Arquivos

- **Tipos permitidos**: JPG, PNG, WebP, GIF, MP4, WebM
- **Tamanho máximo**: 50MB por arquivo
- **Sanitização**: Nomes de arquivo seguros
- **Vírus scan**: (opcional) integração com antivírus

## 📊 Monitoramento

### Métricas Importantes

- **Espaço usado** na sua conta Terabox
- **Uploads por dia/semana/mês**
- **Arquivos por usuário**
- **Bandwidth utilizado**

### Alertas

- **Quota próxima** do limite (1TB)
- **Uploads falhando** (API down)
- **Arquivos corrompidos**
- **Acesso não autorizado**

## 🛠️ Manutenção

### Limpeza Periódica

```bash
# Remover arquivos órfãos (não referenciados no banco)
node scripts/cleanup-orphaned-files.js

# Otimizar imagens antigas
node scripts/optimize-images.js

# Backup de arquivos críticos
node scripts/backup-critical-files.js
```

### Backup e Recuperação

- **Backup automático** dos metadados
- **Sincronização** com backup local
- **Recuperação** de arquivos deletados
- **Versionamento** de arquivos importantes

## 🚨 Troubleshooting

### Problemas Comuns

#### Upload Falhando
```bash
# Verificar credenciais
echo $TERABOX_API_KEY

# Testar conexão
curl -X GET "https://api.terabox.com/status" \
  -H "Authorization: Bearer $TERABOX_API_KEY"
```

#### Arquivos Não Aparecem
```bash
# Verificar URLs no banco
# Verificar permissões da conta
# Verificar se arquivo existe no Terabox
```

#### Performance Lenta
```bash
# Verificar CDN
# Otimizar tamanho das imagens
# Usar cache local
```

## 📈 Otimizações

### Performance

- **CDN global** do Terabox
- **Compressão automática** de imagens
- **Cache local** para arquivos frequentes
- **Lazy loading** de imagens

### Custos

- **1TB gratuito** (suficiente para começar)
- **Upgrade** quando necessário
- **Otimização** de arquivos
- **Limpeza** de arquivos antigos

## 🔗 Links Úteis

- [Terabox API Docs](https://docs.terabox.com)
- [CDN Configuration](https://terabox.com/cdn)
- [Billing & Usage](https://terabox.com/billing)
- [Support](https://terabox.com/support)

---

**💡 Dica**: Mantenha suas credenciais seguras e faça backup regular dos metadados dos arquivos!
