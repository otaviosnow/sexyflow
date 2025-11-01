# 🔧 Como Corrigir o Erro "redirect_uri mismatch"

## O Problema:
O redirect_uri no curl precisa ser **EXATAMENTE IGUAL** ao que está configurado no app Dropbox.

## Solução:

### 1. Verifique qual redirect_uri está no app Dropbox:

1. Acesse: https://www.dropbox.com/developers/apps
2. Clique no seu app
3. Vá em **Settings > OAuth 2**
4. Veja a lista de **Redirect URIs**

### 2. Use o MESMO redirect_uri no curl:

Se você tem `https://sexyflow.com.br/api/oauth/dropbox-callback`, use:

```bash
curl -X POST https://api.dropboxapi.com/oauth2/token \
  -u bn28aobr2w4wi0r:496krrnewavixib \
  -d code=x1GiJJ1RTNEAAAAAAAAAJ5496ex133Y-4S-6q2uytfk \
  -d grant_type=authorization_code \
  -d redirect_uri=https://sexyflow.com.br/api/oauth/dropbox-callback
```

### 3. Se o código expirou:

Os códigos OAuth expiram rapidamente. Se não funcionar, você precisa:

1. **Gerar um novo código** acessando o link de autorização novamente
2. Mas dessa vez, certifique-se de que o redirect_uri no link é o MESMO que está no app Dropbox

**Link corrigido (usando sexyflow.com.br):**
```
https://www.dropbox.com/oauth2/authorize?client_id=bn28aobr2w4wi0r&response_type=code&token_access_type=offline&redirect_uri=https://sexyflow.com.br/api/oauth/dropbox-callback
```

---

## ⚠️ IMPORTANTE:
- O código OAuth expira em minutos
- Você precisa gerar um novo código se já passou muito tempo
- Use o MESMO redirect_uri em:
  1. Configuração do app Dropbox
  2. Link de autorização
  3. Comando curl

