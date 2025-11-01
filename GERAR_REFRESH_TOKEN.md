# 🔑 Como Gerar o Refresh Token do Dropbox

## Passo 1: Obter o código de autorização

Acesse este link no navegador (substitua `SEU_APP_KEY`):

```
https://www.dropbox.com/oauth2/authorize?client_id=SEU_APP_KEY&response_type=code&token_access_type=offline&redirect_uri=https://sexyflow.onrender.com/api/oauth/dropbox-callback
```

Após autorizar, você será redirecionado para a Biblioteca e verá o código na tela.

## Passo 2: Gerar refresh_token

Execute no terminal (substitua os valores):

```bash
curl -X POST https://api.dropboxapi.com/oauth2/token \
  -u SEU_APP_KEY:SEU_APP_SECRET \
  -d code=CODIGO_COPIADO \
  -d grant_type=authorization_code \
  -d redirect_uri=https://sexyflow.onrender.com/api/oauth/dropbox-callback
```

## Resposta esperada:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 14400,
  "refresh_token": "AQUI_VEM_O_REFRESH_TOKEN_QUE_VOCE_PRECISA",
  "scope": "..."
}
```

## Passo 3: Configurar no Render

Adicione no Render como variável de ambiente:

- **Nome:** `DROPBOX_REFRESH_TOKEN`
- **Valor:** O valor de `refresh_token` da resposta acima

**Importante:** Não compartilhe este token publicamente!

