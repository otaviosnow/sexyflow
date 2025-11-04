# 📋 Resumo Executivo - Migração para VPS

## 🎯 O que fazer em ordem:

### 1️⃣ Preparação (10 minutos)
- [ ] Acessar painel Hostinger
- [ ] Anotar IP da VPS
- [ ] Anotar senha SSH
- [ ] Anotar domínio

### 2️⃣ Conectar na VPS (5 minutos)
- [ ] Conectar via SSH (PuTTY no Windows ou Terminal no Mac)
- [ ] Atualizar sistema: `apt update && apt upgrade -y`

### 3️⃣ Instalar programas necessários (15 minutos)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Git, Nginx, PM2
apt install -y git nginx
npm install -g pm2
```

### 4️⃣ Fazer upload do projeto (20 minutos)
- [ ] Opção A: Via Git (se tiver no GitHub)
  ```bash
  cd /var/www
  git clone https://github.com/seu-usuario/sexyflow.git
  ```
- [ ] Opção B: Via FileZilla/Cyberduck (SFTP)

### 5️⃣ Instalar dependências (10 minutos)
```bash
cd /var/www/sexyflow
npm install
npm run build
```

### 6️⃣ Configurar variáveis de ambiente (15 minutos)
```bash
nano .env.local
```
Cole todas as variáveis (veja guia completo)

### 7️⃣ Configurar DNS na Hostinger (10 minutos)
- [ ] Acessar painel → Domínios → DNS
- [ ] Adicionar registro A: `@` → IP da VPS
- [ ] Adicionar registro A: `www` → IP da VPS
- [ ] Adicionar registro A: `*` → IP da VPS

### 8️⃣ Configurar Nginx (10 minutos)
```bash
nano /etc/nginx/sites-available/sexyflow
```
Copiar configuração do guia completo

### 9️⃣ Instalar SSL (5 minutos)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

### 🔟 Iniciar aplicação (2 minutos)
```bash
cd /var/www/sexyflow
pm2 start npm --name "sexyflow" -- start
pm2 startup
pm2 save
```

### 1️⃣1️⃣ Atualizar serviços externos (10 minutos)
- [ ] Dropbox: Adicionar novo redirect URI
- [ ] Cakto: Atualizar webhook URL

### 1️⃣2️⃣ Testar tudo (15 minutos)
- [ ] Acessar site no navegador
- [ ] Testar login
- [ ] Testar upload
- [ ] Verificar logs: `pm2 logs sexyflow`

---

## ⏱️ Tempo Total Estimado: 2-3 horas

## 📝 Variáveis de Ambiente Obrigatórias

Copie estas variáveis para o arquivo `.env.local`:

```env
NODE_ENV=production
MONGODB_URI=sua-uri-do-mongodb
NEXTAUTH_URL=https://seu-dominio.com.br
NEXTAUTH_SECRET=gerar-com-openssl-rand-base64-32
BASE_DOMAIN=seu-dominio.com.br
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com.br
USE_DROPBOX=true
DROPBOX_ACCESS_TOKEN=seu-token
DROPBOX_APP_KEY=bn28aobr2w4wi0r
DROPBOX_APP_SECRET=496krrnewavixib
DROPBOX_REFRESH_TOKEN=seu-refresh-token
CAKTO_WEBHOOK_SECRET=6c8513c9-b645-4f9b-9a7c-e709199466b9
```

## 🔗 Links importantes

- **Guia completo**: `GUIA_MIGRACAO_VPS_HOSTINGER.md`
- **Troubleshooting**: Ver seção no guia completo

## ⚠️ Avisos importantes

1. **NEXTAUTH_SECRET**: Gere uma nova chave com `openssl rand -base64 32`
2. **Domínio**: Substitua `seu-dominio.com.br` pelo seu domínio real em TODOS os lugares
3. **DNS**: Pode levar até 24h para propagar (geralmente 1-2h)
4. **Backup**: Faça backup do MongoDB antes de migrar

