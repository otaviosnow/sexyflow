# 📖 Guia Completo: Gerar Refresh Token do Dropbox

## 🎯 O que você precisa:
- `DROPBOX_APP_KEY`: `bn28aobr2w4wi0r`
- `DROPBOX_APP_SECRET`: `496krrnewavixib`

---

## 📝 PASSO 1: Obter o Código de Autorização

### 1.1 - Abra seu navegador (Chrome, Firefox, etc.)

### 1.2 - Cole este link na barra de endereços e pressione ENTER:

```
https://www.dropbox.com/oauth2/authorize?client_id=bn28aobr2w4wi0r&response_type=code&token_access_type=offline&redirect_uri=https://sexyflow.onrender.com/api/oauth/dropbox-callback
```

### 1.3 - Você verá uma tela do Dropbox pedindo permissão:
- Clique em **"Allow"** (Permitir)

### 1.4 - Você será redirecionado para a página da Biblioteca
- Você verá uma caixa azul com o **CÓDIGO** que você precisa
- **COPIE TODO O CÓDIGO** que aparece na caixa azul

### 1.5 - Exemplo do que você verá:
```
✅ Código OAuth recebido!
Copie o código abaixo e use no curl para gerar o refresh_token:
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 📝 PASSO 2: Gerar o Refresh Token

### 2.1 - Abra o Terminal do seu Mac

### 2.2 - Cole este comando (substitua `CODIGO_COPIADO` pelo código que você copiou):

```bash
curl -X POST https://api.dropboxapi.com/oauth2/token \
  -u bn28aobr2w4wi0r:496krrnewavixib \
  -d code=CODIGO_COPIADO \
  -d grant_type=authorization_code \
  -d redirect_uri=https://sexyflow.onrender.com/api/oauth/dropbox-callback
```

**Exemplo real:**
Se o código for `abc123def456`, você cola assim:

```bash
curl -X POST https://api.dropboxapi.com/oauth2/token \
  -u bn28aobr2w4wi0r:496krrnewavixib \
  -d code=abc123def456 \
  -d grant_type=authorization_code \
  -d redirect_uri=https://sexyflow.onrender.com/api/oauth/dropbox-callback
```

### 2.3 - Pressione ENTER e espere a resposta

### 2.4 - Você receberá uma resposta JSON assim:

```json
{
  "access_token": "sl.B123...",
  "token_type": "bearer",
  "expires_in": 14400,
  "refresh_token": "AQUI_ESTA_O_REFRESH_TOKEN_QUE_VOCE_PRECISA",
  "scope": "account_info.read files.content.read files.content.write files.metadata.read sharing.read sharing.write"
}
```

### 2.5 - **COPIE O VALOR DE `refresh_token`**
- É uma string longa que começa com algo como `A1...` ou similar
- Copie TUDO que está entre as aspas depois de `"refresh_token":`

---

## 📝 PASSO 3: Adicionar no Render

### 3.1 - Acesse https://dashboard.render.com

### 3.2 - Faça login e encontre seu serviço "sexyflow"

### 3.3 - Clique no nome do serviço

### 3.4 - No menu lateral esquerdo, clique em **"Environment"**

### 3.5 - Role a página até encontrar a seção de variáveis de ambiente

### 3.6 - Clique no botão **"Add Environment Variable"** ou **"Add"**

### 3.7 - Preencha:
- **Key (nome):** `DROPBOX_REFRESH_TOKEN`
- **Value (valor):** Cole o `refresh_token` que você copiou no Passo 2.5

### 3.8 - Clique em **"Save Changes"**

---

## 📝 PASSO 4: Fazer Deploy

### 4.1 - Ainda na página do Render, clique em **"Manual Deploy"** no topo

### 4.2 - Clique em **"Deploy latest commit"**

### 4.3 - Aguarde o deploy terminar (1-3 minutos)

---

## ✅ PASSO 5: Testar

### 5.1 - Acesse https://sexyflow.onrender.com/library

### 5.2 - Faça login

### 5.3 - Clique no botão **"Upload"**

### 5.4 - Selecione uma imagem

### 5.5 - Se funcionar, você verá:
- ✅ Mensagem de sucesso
- A imagem aparecendo na lista

---

## 🆘 Problemas Comuns:

**"Erro 401" ou "expired_access_token":**
- Verifique se o `DROPBOX_REFRESH_TOKEN` foi adicionado corretamente no Render
- Faça um novo deploy após adicionar a variável

**"Código não aparece na Biblioteca":**
- Verifique se o redirect URI no Dropbox App está configurado como:
  `https://sexyflow.onrender.com/api/oauth/dropbox-callback`

**"Erro no curl":**
- Verifique se não esqueceu de substituir `CODIGO_COPIADO` pelo código real
- Verifique se copiou o código completo (pode ser bem longo)

---

**Precisa de ajuda?** Me avise em qual passo você está travado! 🚀

