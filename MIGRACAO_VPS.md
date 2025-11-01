# 🔄 Checklist de Migração para VPS (sexyflow.com.br)

## 📋 Checklist Pré-Migração

### 1. **Dropbox OAuth Redirect URI**
- [ ] Acessar [Dropbox App Console](https://www.dropbox.com/developers/apps)
- [ ] Ir em Settings > OAuth 2
- [ ] Adicionar novo redirect URI: `https://sexyflow.com.br/api/oauth/dropbox-callback`
- [ ] Remover ou manter `https://sexyflow.onrender.com/api/oauth/dropbox-callback` (opcional)
- [ ] Remover `https://localhost` se não for mais usado

### 2. **Variáveis de Ambiente no Servidor VPS**
Verificar/configurar todas as variáveis:

```bash
# MongoDB
MONGODB_URI=mongodb://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://sexyflow.com.br

# Dropbox (já configurado)
DROPBOX_ACCESS_TOKEN=...
DROPBOX_APP_KEY=...
DROPBOX_APP_SECRET=...
DROPBOX_REFRESH_TOKEN=...
USE_DROPBOX=true

# Cakto (se aplicável)
CAKTO_API_KEY=...
CAKTO_WEBHOOK_SECRET=...
```

### 3. **Arquivos que podem precisar de atualização**

#### `middleware.ts` (se houver lógica de subdomínio)
- Verificar se precisa ajustar detecção de domínio base
- Confirmar que `sexyflow.com.br` é tratado como domínio principal

#### Links hardcoded (se houver)
- Buscar por `sexyflow.onrender.com` no código
- Buscar por `localhost` em configurações OAuth
- Substituir por `sexyflow.com.br`

### 4. **DNS e SSL**
- [ ] Configurar DNS do domínio `sexyflow.com.br` apontando para IP da VPS
- [ ] Configurar certificado SSL (Let's Encrypt/Certbot)
- [ ] Testar acesso via HTTPS

### 5. **Testes pós-migração**
- [ ] Login/Registro funcionando
- [ ] Upload de arquivos na Biblioteca funcionando
- [ ] Editor de páginas funcionando
- [ ] Preview de páginas funcionando
- [ ] Analytics funcionando
- [ ] Webhooks (Cakto) funcionando (se aplicável)

### 6. **Backup**
- [ ] Fazer backup do MongoDB antes da migração
- [ ] Fazer backup dos arquivos no Dropbox (ou garantir que estão seguros)

---

## 📝 Notas Importantes

- O **refresh_token** do Dropbox funciona independente do redirect URI usado na geração
- Após migrar, pode manter múltiplos redirect URIs no Dropbox (não interfere)
- `NEXTAUTH_URL` deve ser atualizado para o novo domínio
- Verificar se há links/URLs hardcoded em emails ou templates

---

## 🔍 Comandos Úteis para Verificar

```bash
# Buscar referências ao Render no código
grep -r "sexyflow.onrender.com" .

# Buscar referências a localhost em configurações OAuth
grep -r "localhost" app/api/oauth/

# Verificar variáveis de ambiente no .env
cat .env.local | grep -E "(URL|DOMAIN|HOST)"
```

---

**Data de criação:** 2025-11-01  
**Domínio alvo:** sexyflow.com.br  
**Status:** ⏳ Aguardando migração

