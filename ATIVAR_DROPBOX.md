# 🚀 Como Ativar o Dropbox

## 📋 Pré-requisitos

1. Conta Dropbox (gratuita ou paga)
2. App criada no Dropbox App Console
3. Credenciais do Dropbox (Access Token, App Key, App Secret)

## 🔧 Passo a Passo

### 1. Obter Credenciais do Dropbox

Se você já tem as credenciais no arquivo `DROPBOX_CREDENTIALS.md`, copie-as.

Se não tem, siga o guia em `DROPBOX_SETUP.md` para criar o app e obter as credenciais.

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```bash
# Dropbox Storage
DROPBOX_ACCESS_TOKEN="seu_access_token_aqui"
DROPBOX_APP_KEY="sua_app_key_aqui"
DROPBOX_APP_SECRET="seu_app_secret_aqui"
USE_DROPBOX="true"  # IMPORTANTE: deve ser "true" para ativar
```

**⚠️ IMPORTANTE:** 
- O arquivo `.env.local` não deve ser commitado no Git (já está no .gitignore)
- As credenciais são sensíveis e devem ser mantidas em segredo
- No Render/VPS, configure essas variáveis no painel de variáveis de ambiente

### 3. Reiniciar o Servidor

Após configurar as variáveis, reinicie o servidor:

```bash
# Desenvolvimento local
npm run dev

# Produção (Render/VPS)
# O Render vai reiniciar automaticamente ao detectar mudanças nas variáveis
```

### 4. Verificar se Está Funcionando

1. Acesse o editor de página (`/projects/[id]/pages/[pageId]/editor`)
2. Tente fazer upload de uma imagem de fundo
3. Se funcionar, você verá: "Imagem enviada para Dropbox com sucesso!"
4. Verifique no seu Dropbox na pasta `/sexyflow/users/[userId]/sexyflow-backgrounds/`

## 🔍 Como Funciona

### Quando Dropbox está ATIVO (`USE_DROPBOX=true`):

- ✅ **Imagens de fundo** do editor → Enviadas para Dropbox
- ✅ **Componente ImageUpload** → Usa Dropbox
- ✅ **URLs públicas** do Dropbox são salvas no banco
- ✅ **Máximo**: 150MB por arquivo

### Quando Dropbox está INATIVO (`USE_DROPBOX=false` ou sem credenciais):

- ⚠️ **Fallback automático** para base64 (imagens pequenas)
- ⚠️ **Armazenamento local** em `public/uploads/`
- ⚠️ **Máximo**: 5-10MB por arquivo (dependendo da configuração)

## 🐛 Troubleshooting

### Erro: "Dropbox não está configurado"

**Solução:**
1. Verifique se `USE_DROPBOX="true"` (com aspas e minúsculo)
2. Verifique se todas as 3 credenciais estão preenchidas
3. Reinicie o servidor após mudar as variáveis

### Erro: "Invalid access token"

**Solução:**
1. Gere um novo Access Token no Dropbox App Console
2. Atualize a variável `DROPBOX_ACCESS_TOKEN`
3. Reinicie o servidor

### Upload funciona mas a imagem não aparece

**Solução:**
1. Verifique se o Dropbox gerou uma URL pública
2. Verifique se a URL está sendo salva corretamente no banco
3. Verifique os logs do servidor para erros

### Como desativar Dropbox

Simplesmente remova as credenciais ou defina `USE_DROPBOX="false"`:

```bash
USE_DROPBOX="false"
```

O sistema voltará automaticamente para armazenamento local/base64.

## 📊 Monitoramento

### Verificar Uso do Dropbox

Você pode verificar o uso do espaço na sua conta Dropbox:
1. Acesse [dropbox.com](https://dropbox.com)
2. Vá em Settings → Account
3. Veja o uso de armazenamento

### Estrutura de Pastas no Dropbox

```
/sexyflow/
├── users/
│   ├── user-123/
│   │   ├── sexyflow-backgrounds/  ← Imagens de fundo
│   │   └── sexyflow-images/      ← Outras imagens
│   └── user-456/
│       └── ...
└── anonymous/
    └── sexyflow-images/
```

## 🔒 Segurança

- ✅ **Credenciais** não são expostas ao frontend
- ✅ **URLs públicas** são geradas pelo Dropbox
- ✅ **Acesso** controlado pela sua conta Dropbox
- ⚠️ **Importante:** Mantenha as credenciais seguras!

## 📝 Configuração no Render/VPS

1. Acesse o painel do Render
2. Vá em Environment → Environment Variables
3. Adicione as 4 variáveis:
   - `DROPBOX_ACCESS_TOKEN`
   - `DROPBOX_APP_KEY`
   - `DROPBOX_APP_SECRET`
   - `USE_DROPBOX` (valor: `true`)
4. Salve e aguarde o deploy automático

---

**✅ Pronto!** Após configurar, o Dropbox estará ativo e todas as imagens serão armazenadas na nuvem.

