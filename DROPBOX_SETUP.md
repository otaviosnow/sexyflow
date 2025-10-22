# 📦 Configuração do Dropbox para SexyFlow

## 🎯 **Por que Dropbox?**

- ✅ **2GB gratuito** para começar
- ✅ **API oficial** e estável
- ✅ **CDN global** para velocidade
- ✅ **Política liberal** com conteúdo adulto
- ✅ **Integração simples** com Node.js
- ✅ **Sem restrições** de tipo de conteúdo

## 🔧 **Configuração Passo a Passo**

### **1. Criar App no Dropbox**

1. **Acesse o Dropbox App Console:**
   - Vá para [dropbox.com/developers](https://dropbox.com/developers)
   - Faça login com sua conta Dropbox

2. **Criar Nova App:**
   - Clique em "Create app"
   - Escolha "Scoped access"
   - Selecione "Full Dropbox access"
   - Nome: `SexyFlow Storage`
   - Descrição: `Armazenamento de arquivos para SexyFlow`

3. **Configurar Permissões:**
   - Vá em "Permissions"
   - Marque as permissões necessárias:
     - ✅ `files.metadata.write`
     - ✅ `files.metadata.read`
     - ✅ `files.content.write`
     - ✅ `files.content.read`
     - ✅ `sharing.write`

### **2. Obter Credenciais**

1. **App Key e Secret:**
   - No dashboard do app, copie:
     - `App key`
     - `App secret`

2. **Gerar Access Token:**
   - Vá em "Settings" → "OAuth 2"
   - Clique em "Generate access token"
   - Copie o token gerado

### **3. Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local`:

```env
# Dropbox Configuration
DROPBOX_ACCESS_TOKEN=seu_access_token_aqui
DROPBOX_APP_KEY=sua_app_key_aqui
DROPBOX_APP_SECRET=seu_app_secret_aqui
```

### **4. Testar Configuração**

```bash
# Instalar dependências
npm install dropbox

# Testar conexão
node -e "
const { Dropbox } = require('dropbox');
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
dbx.usersGetCurrentAccount()
  .then(result => console.log('✅ Conectado:', result.result.name.display_name))
  .catch(err => console.error('❌ Erro:', err.message));
"
```

## 🚀 **Como Funciona**

### **Estrutura de Pastas:**
```
/sexyflow/
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

### **Fluxo de Upload:**
1. **Usuário faz upload** → Sistema captura arquivo
2. **Gera nome único** → `timestamp-randomId.ext`
3. **Upload para Dropbox** → Via API oficial
4. **Gera URL pública** → Link direto para arquivo
5. **Salva no banco** → Referência à URL do Dropbox

## 📊 **Vantagens do Dropbox**

### **Custo-Benefício:**
- **Gratuito:** 2GB (suficiente para começar)
- **Plus:** $9.99/mês (2TB)
- **Professional:** $16.99/mês (3TB)

### **Recursos:**
- **CDN global** para velocidade
- **Versionamento** de arquivos
- **Compartilhamento** seguro
- **API robusta** e documentada
- **Webhooks** para notificações

## 🔒 **Segurança**

### **Controle de Acesso:**
- **Sua conta** = controle total
- **Usuários** = apenas upload/download
- **Access tokens** = protegidos no servidor
- **URLs públicas** = CDN seguro

### **Validação de Arquivos:**
- **Tipos permitidos:** JPG, PNG, WebP, GIF, MP4, WebM, AVI, MOV
- **Tamanho máximo:** 150MB por arquivo
- **Sanitização:** Nomes de arquivo seguros
- **Organização:** Por usuário e tipo

## 🛠️ **Comandos Úteis**

### **Listar Arquivos:**
```bash
curl -X GET "http://localhost:3000/api/upload/dropbox?folder=sexyflow&limit=50"
```

### **Deletar Arquivo:**
```bash
curl -X DELETE "http://localhost:3000/api/upload/dropbox" \
  -H "Content-Type: application/json" \
  -d '{"path": "/sexyflow/users/user-123/image.jpg"}'
```

### **Verificar Uso:**
```javascript
// No código
const stats = await dropboxService.getUsageStats();
console.log('Uso:', stats.usage_percentage + '%');
```

## 📈 **Monitoramento**

### **Métricas Importantes:**
- **Espaço usado** na conta Dropbox
- **Uploads por dia/semana/mês**
- **Arquivos por usuário**
- **Bandwidth utilizado**

### **Alertas:**
- **Quota próxima** do limite (2GB)
- **Uploads falhando** (API down)
- **Arquivos corrompidos**
- **Acesso não autorizado**

## 🔧 **Troubleshooting**

### **Problemas Comuns:**

#### **Erro: "Invalid access token"**
```bash
# Verificar token
echo $DROPBOX_ACCESS_TOKEN

# Gerar novo token no Dropbox App Console
```

#### **Erro: "Insufficient permissions"**
```bash
# Verificar permissões no Dropbox App Console
# Adicionar permissões necessárias
```

#### **Upload falhando**
```bash
# Verificar tamanho do arquivo (máx. 150MB)
# Verificar tipo de arquivo permitido
# Verificar conexão com internet
```

## 🚀 **Próximos Passos**

### **1. Configurar Webhooks (Opcional):**
```javascript
// Para notificações em tempo real
app.post('/webhooks/dropbox', (req, res) => {
  // Processar notificações do Dropbox
});
```

### **2. Implementar Cache:**
```javascript
// Cache local para URLs frequentes
const cache = new Map();
```

### **3. Backup Automático:**
```javascript
// Backup periódico dos metadados
setInterval(backupMetadata, 24 * 60 * 60 * 1000);
```

## 🔗 **Links Úteis**

- [Dropbox App Console](https://dropbox.com/developers/apps)
- [Dropbox API Docs](https://dropbox.github.io/dropbox-sdk-js/)
- [Dropbox Pricing](https://dropbox.com/plans)
- [Dropbox Support](https://dropbox.com/support)

---

**💡 Dica:** Mantenha suas credenciais seguras e faça backup regular dos metadados dos arquivos!
