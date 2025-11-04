# 🚀 Guia Completo: Migração do Render para VPS Hostinger

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação na Hostinger](#preparação-na-hostinger)
3. [Configuração da VPS](#configuração-da-vps)
4. [Instalação do Node.js e Dependências](#instalação-do-nodejs-e-dependências)
5. [Upload do Projeto](#upload-do-projeto)
6. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
7. [Configuração do Domínio e DNS](#configuração-do-domínio-e-dns)
8. [Configuração do SSL (HTTPS)](#configuração-do-ssl-https)
9. [Configuração do Nginx](#configuração-do-nginx)
10. [Configuração do PM2 (Gerenciador de Processos)](#configuração-do-pm2-gerenciador-de-processos)
11. [Atualização de URLs e Configurações](#atualização-de-urls-e-configurações)
12. [Configuração de Serviços Externos](#configuração-de-serviços-externos)
13. [Testes Finais](#testes-finais)
14. [Troubleshooting](#troubleshooting)

---

## 📦 Pré-requisitos

### O que você precisa ter:
- ✅ VPS da Hostinger comprada e ativa
- ✅ Domínio comprado na Hostinger
- ✅ Acesso SSH à VPS (fornecido pela Hostinger)
- ✅ Acesso ao painel da Hostinger
- ✅ Credenciais do MongoDB (continuará usando MongoDB Atlas ou local)
- ✅ Credenciais do Dropbox (já configuradas)
- ✅ Credenciais da Cakto (já configuradas)

---

## 🏠 Preparação na Hostinger

### 1. Acessar o Painel da Hostinger

1. Acesse: https://www.hostinger.com.br
2. Faça login na sua conta
3. Vá em **"VPS"** no menu lateral

### 2. Anotar Informações Importantes

Anote estas informações que você precisará:
- **IP da VPS**: Exemplo: `185.123.45.67`
- **Usuário SSH**: Geralmente `root` ou o que você configurou
- **Senha SSH**: A senha de acesso
- **Domínio**: Exemplo: `sexyflow.com.br` ou `sexyflow.com`

---

## 💻 Configuração da VPS

### Passo 1: Conectar na VPS via SSH

**No Windows:**
1. Baixe o [PuTTY](https://www.putty.org/)
2. Abra o PuTTY
3. Preencha:
   - **Host Name**: `seu-ip-da-vps` (ex: `185.123.45.67`)
   - **Port**: `22`
   - **Connection Type**: `SSH`
4. Clique em **Open**
5. Quando pedir login, digite: `root`
6. Digite sua senha (não aparecerá nada ao digitar, é normal)

**No Mac/Linux:**
Abra o Terminal e digite:
```bash
ssh root@seu-ip-da-vps
```

### Passo 2: Atualizar o Sistema

Depois de conectar, execute estes comandos (copie e cole um por vez):

```bash
apt update
apt upgrade -y
```

---

## 📥 Instalação do Node.js e Dependências

### Passo 1: Instalar Node.js

Execute estes comandos na ordem:

```bash
# Instalar Node.js 20 (versão LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar se instalou corretamente
node --version
npm --version
```

Você deve ver algo como:
```
v20.11.0
10.2.3
```

### Passo 2: Instalar Git

```bash
apt install -y git
```

### Passo 3: Instalar Nginx (servidor web)

```bash
apt install -y nginx
```

### Passo 4: Instalar PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

---

## 📤 Upload do Projeto

### Opção 1: Via Git (Recomendado)

Se seu projeto está no GitHub:

```bash
# Criar pasta para o projeto
mkdir -p /var/www
cd /var/www

# Clonar seu repositório (substitua pela URL do seu repositório)
git clone https://github.com/seu-usuario/sexyflow.git

# Entrar na pasta
cd sexyflow
```

### Opção 2: Via FTP/SFTP

1. Use o **FileZilla** (Windows) ou **Cyberduck** (Mac)
2. Configure:
   - **Protocolo**: SFTP
   - **Host**: IP da sua VPS
   - **Usuário**: `root`
   - **Senha**: Sua senha SSH
   - **Porta**: `22`
3. Conecte e faça upload de todos os arquivos do projeto para: `/var/www/sexyflow`

---

## 🔧 Instalação das Dependências do Projeto

Depois de fazer upload, execute:

```bash
cd /var/www/sexyflow

# Instalar dependências
npm install

# Compilar o projeto
npm run build
```

Isso pode levar alguns minutos. Aguarde até terminar.

---

## ⚙️ Configuração das Variáveis de Ambiente

### Passo 1: Criar arquivo .env.local

```bash
cd /var/www/sexyflow
nano .env.local
```

### Passo 2: Adicionar todas as variáveis

Cole este conteúdo no arquivo (substitua pelos valores reais):

```env
# ============================================
# CONFIGURAÇÕES BÁSICAS
# ============================================
NODE_ENV=production

# ============================================
# MONGODB - Banco de Dados
# ============================================
# Use a mesma conexão do Render ou MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority

# ============================================
# NEXTAUTH - Autenticação
# ============================================
# IMPORTANTE: Substitua pelo seu domínio
NEXTAUTH_URL=https://seu-dominio.com.br
# Gere uma nova chave secreta (instruções abaixo)
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# ============================================
# DOMÍNIO BASE
# ============================================
# IMPORTANTE: Substitua pelo seu domínio
BASE_DOMAIN=seu-dominio.com.br
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com.br

# ============================================
# DROPBOX - Armazenamento de Arquivos
# ============================================
USE_DROPBOX=true
DROPBOX_ACCESS_TOKEN=sl.u.AGCoYjwzkVlrilJN3IY_NYQsSkdyqHSsq9dVpfD5AuNxT6ofYkOgqtP72hb8psYyC5sH0aCJVau46oETfbM6k4J4Z_lOrwlrMQ_puNNQpBoAWISuJmcx8PTbkb2KEOuxGVDCHNBrXNA-3FQlBoSne6xVGo4u7UbLi4_m-KcyueiAe79RRBq-owShjgQZ-8B2jIWWKay-bkOnjnkN35op7LUahufFBu9QcQ7YHePpEsQBdIsQUtiKbwHlByglX6vIpd32ym5iQiyomK3t3DDLWOVIp47CLy_jUu_qBuAluUkTOxWltUjj23olKSCdtgkUhm0Eeyu5wJw8kRE0yz1pd9U4vYpq1-UK609GEIAcndEVP8sJsh-YZ01zIOcn-5CJBWLTUUP7ki0MDDSFtnLCVhPwy-NrbWoaxofKr7MNkaqYXS0ZtO-uTDzPAF4tjv4r5iTs8M2Ylqhg-zRtWSuaKTDSksdk_QqJwQOVFIo83fNtmmy92Fj4cmd3F_NZvECGpSPVEf2TLKpy6wM0nSghNDvB_CbI5oLUAT1p1KZ0QIKXTBCTydWBRq2kIYaAfH171wEnZoiVs-ZIUP6BcUWM02vcEE1nwcmSARazjlYzPQr3aOpOtfbUt7mhehwYJthgrSchlJh_uQUsqZbfM-pPs_Yk7F6Kb0uJ7hDnXt87JyDd0VE4rF6q8XLImRNZqSHYH4UTObbBY1Ykv6qAX1iUSyVIIB-9VNzAgev5kbkO2AXpVd5kAHSLFJKNSFL4OSfqjCqNsJsBOmXE0WOjk9DMLhM2lqwVVl71B8yEiGm3lGvP7Q5yck-TknkNHLk6lcWStjT5nX-qLBvc0zPPW6gChcw7tEgzqNcPWWYggsHOyNCWkLPkH_Jj898BDjYpMSKl972D8m1onq3hR2QXbHgmcgeojFN08H6FUW-kD6vIYnNVVgnH4RArVu9aP7ezgtwln6IcRcXdTDdnt3pJdt_Xpiu1t5h89QWTjEo356cWylvWZZHG8KcE4ReY7QciHHPx40pqUCxYufT0WmFH3Q8RWCHGw0-egfPEi5eoFzK3neaJX3rHGpM_cFzIFSyBl-BE1sVjeBMCZ2hfemhU92M8FbNf0d2ozGRH6-FVj9At1pPz8P8QzY-n0iMBxOTqauwG-lL8E4yUsEZSPrJEybmGgyrh75YAD0MYIVq0QyehwTC8-6EHPjz4zcM-kiVe5nlap7aZEV_GaD9FpMGtRbQGBuCMUVWv4hKjYfi86CLF6FwxaOT1accYQHgwnSbz11BGxQp3K8J8d8iNP0FtUXWXiWn_BMOCAVvyd4UkGGhzWHZoiK9M91vNHz-vB9fvITHSK55F5o-1c0FEvyr8KKRYxa80EuEKoXTGaK0j-QNZu8NAuxPdhNGLijUbrVdelD49HIu5tjW5IG7BPe7bBr5G_JyjYW6U9P08nhXWCsLRhTITeg
DROPBOX_APP_KEY=bn28aobr2w4wi0r
DROPBOX_APP_SECRET=496krrnewavixib
DROPBOX_REFRESH_TOKEN=seu-refresh-token-aqui

# ============================================
# CAKTO - Pagamentos
# ============================================
CAKTO_WEBHOOK_SECRET=6c8513c9-b645-4f9b-9a7c-e709199466b9
CAKTO_CHECKOUT_STARTER_MONTHLY=https://pay.cakto.com.br/wceycj4
CAKTO_CHECKOUT_STARTER_YEARLY=https://pay.cakto.com.br/34h9um7
CAKTO_CHECKOUT_PRO_MONTHLY=https://pay.cakto.com.br/3c62vfj
CAKTO_CHECKOUT_PRO_YEARLY=https://pay.cakto.com.br/366psux

# ============================================
# EMAIL (Opcional - para notificações)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

### Passo 3: Salvar o arquivo

No nano:
- Pressione `Ctrl + O` para salvar
- Pressione `Enter` para confirmar
- Pressione `Ctrl + X` para sair

### Passo 4: Gerar NEXTAUTH_SECRET

Execute este comando para gerar uma chave secreta segura:

```bash
openssl rand -base64 32
```

Copie o resultado e cole no lugar de `sua-chave-secreta-aqui` no arquivo `.env.local`.

---

## 🌐 Configuração do Domínio e DNS

### Passo 1: Acessar DNS na Hostinger

1. No painel da Hostinger, vá em **"Domínios"**
2. Clique no seu domínio
3. Vá em **"DNS / Zona de Nomes"**

### Passo 2: Configurar Registros DNS

Adicione estes registros:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | @ | IP da sua VPS | 3600 |
| A | www | IP da sua VPS | 3600 |
| A | * | IP da sua VPS | 3600 |

**Exemplo:**
- Se seu domínio é `sexyflow.com.br` e seu IP é `185.123.45.67`:
  - **A @** → `185.123.45.67`
  - **A www** → `185.123.45.67`
  - **A *** → `185.123.45.67` (para subdomínios)

### Passo 3: Aguardar Propagação DNS

Pode levar de 5 minutos a 24 horas. Geralmente leva 1-2 horas.

Verifique se propagou:
```bash
# No seu computador, abra o Terminal/Prompt e execute:
nslookup seu-dominio.com.br
```

---

## 🔒 Configuração do SSL (HTTPS)

### Passo 1: Instalar Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Passo 2: Configurar Nginx primeiro (veja seção abaixo)

Primeiro configure o Nginx (próxima seção), depois volte aqui.

### Passo 3: Obter Certificado SSL

```bash
certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

Siga as instruções:
- Digite seu email
- Aceite os termos (A)
- Escolha se quer redirecionar HTTP para HTTPS (2 - recomendado)

### Passo 4: Renovação Automática

O Certbot renova automaticamente, mas você pode testar:

```bash
certbot renew --dry-run
```

---

## 🌍 Configuração do Nginx

### Passo 1: Criar arquivo de configuração

```bash
nano /etc/nginx/sites-available/sexyflow
```

### Passo 2: Adicionar configuração

Cole este conteúdo (substitua `seu-dominio.com.br` pelo seu domínio):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seu-dominio.com.br www.seu-dominio.com.br *.seu-dominio.com.br;

    # Redirecionar HTTP para HTTPS (após configurar SSL)
    # Descomente após obter certificado SSL
    # return 301 https://$server_name$request_uri;

    # Apenas para teste inicial, depois comente ou remova:
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Descomente após configurar SSL:
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name seu-dominio.com.br www.seu-dominio.com.br *.seu-dominio.com.br;
#
#     ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;
#
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
```

### Passo 3: Ativar o site

```bash
ln -s /etc/nginx/sites-available/sexyflow /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 🔄 Configuração do PM2 (Gerenciador de Processos)

### Passo 1: Iniciar aplicação com PM2

```bash
cd /var/www/sexyflow
pm2 start npm --name "sexyflow" -- start
```

### Passo 2: Configurar PM2 para iniciar automaticamente

```bash
pm2 startup
pm2 save
```

### Passo 3: Verificar status

```bash
pm2 status
pm2 logs sexyflow
```

---

## 🔄 Atualização de URLs e Configurações

### Arquivos que precisam ser atualizados:

Execute estes comandos para substituir todas as referências ao Render:

```bash
cd /var/www/sexyflow

# Substituir sexyflow.onrender.com pelo seu domínio
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" | \
  xargs sed -i 's/sexyflow\.onrender\.com/seu-dominio.com.br/g'

# Substituir em next.config.js se necessário
sed -i 's/sexyflow\.onrender\.com/seu-dominio.com.br/g' next.config.js
```

**⚠️ IMPORTANTE:** Substitua `seu-dominio.com.br` pelo seu domínio real antes de executar!

### Arquivos específicos para verificar manualmente:

1. **`middleware.ts`** - Já usa variável `BASE_DOMAIN`, está OK
2. **`lib/cakto.ts`** - Já usa `NEXT_PUBLIC_BASE_URL`, está OK
3. **`app/custom-domain/page.tsx`** - Precisa atualizar instruções de CNAME

Atualize `app/custom-domain/page.tsx`:
```bash
nano app/custom-domain/page.tsx
```

Procure por `sexyflow.onrender.com` e substitua pelo seu domínio.

---

## 🔗 Configuração de Serviços Externos

### 1. Dropbox OAuth

1. Acesse: https://www.dropbox.com/developers/apps
2. Selecione sua app
3. Vá em **Settings** → **OAuth 2**
4. Adicione novo Redirect URI:
   ```
   https://seu-dominio.com.br/api/oauth/dropbox-callback
   ```
5. Salve

### 2. Cakto Webhooks

1. Acesse o painel da Cakto
2. Vá em **Webhooks**
3. Atualize a URL do webhook:
   ```
   https://seu-dominio.com.br/api/webhooks/cakto
   ```
4. Salve

### 3. MongoDB Atlas (se usar)

Se você usa MongoDB Atlas, não precisa mudar nada. A conexão continua funcionando.

---

## ✅ Testes Finais

### 1. Testar acesso HTTP

Abra no navegador:
```
http://seu-dominio.com.br
```

### 2. Testar acesso HTTPS (após SSL)

```
https://seu-dominio.com.br
```

### 3. Testar funcionalidades

- [ ] Login/Registro
- [ ] Criar projeto
- [ ] Upload de arquivos
- [ ] Editor de páginas
- [ ] Preview de páginas
- [ ] Webhooks da Cakto (fazer um teste de pagamento)

### 4. Verificar logs

```bash
# Logs da aplicação
pm2 logs sexyflow

# Logs do Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 🔧 Troubleshooting

### Problema: Site não carrega

**Solução:**
```bash
# Verificar se PM2 está rodando
pm2 status

# Verificar se Nginx está rodando
systemctl status nginx

# Verificar porta 3000
netstat -tlnp | grep 3000
```

### Problema: Erro 502 Bad Gateway

**Solução:**
```bash
# Reiniciar aplicação
pm2 restart sexyflow

# Verificar logs
pm2 logs sexyflow --lines 50
```

### Problema: SSL não funciona

**Solução:**
```bash
# Verificar certificado
certbot certificates

# Renovar manualmente
certbot renew --force-renewal
```

### Problema: Subdomínios não funcionam

**Solução:**
1. Verifique DNS: `nslookup subdominio.seu-dominio.com.br`
2. Verifique se o registro A `*` está configurado
3. Verifique `BASE_DOMAIN` no `.env.local`

### Problema: Erro de conexão com MongoDB

**Solução:**
1. Verifique `MONGODB_URI` no `.env.local`
2. Verifique se o IP da VPS está na whitelist do MongoDB Atlas
3. Teste conexão:
```bash
cd /var/www/sexyflow
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.log(e))"
```

---

## 📝 Comandos Úteis

### Reiniciar aplicação
```bash
pm2 restart sexyflow
```

### Ver logs em tempo real
```bash
pm2 logs sexyflow
```

### Parar aplicação
```bash
pm2 stop sexyflow
```

### Atualizar projeto (se usar Git)
```bash
cd /var/www/sexyflow
git pull
npm install
npm run build
pm2 restart sexyflow
```

### Verificar uso de recursos
```bash
pm2 monit
```

### Verificar espaço em disco
```bash
df -h
```

---

## 🎯 Checklist Final

Antes de considerar a migração completa:

- [ ] DNS configurado e propagado
- [ ] SSL configurado e funcionando
- [ ] Aplicação rodando no PM2
- [ ] Nginx configurado e funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Dropbox OAuth atualizado
- [ ] Cakto webhooks atualizados
- [ ] Testes de todas funcionalidades passando
- [ ] Backup do banco de dados feito
- [ ] Logs verificados e sem erros críticos

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs sexyflow`
2. Verifique logs do Nginx: `/var/log/nginx/error.log`
3. Verifique se todas as variáveis de ambiente estão corretas
4. Consulte a seção de Troubleshooting acima

---

**Última atualização:** 2025-01-XX  
**Versão:** 1.0  
**Domínio exemplo:** seu-dominio.com.br

