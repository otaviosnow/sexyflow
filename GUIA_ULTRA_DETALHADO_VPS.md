# 🚀 Guia Ultra-Detalhado: Migração do Render para VPS Hostinger

## 📋 Este guia é para você que:
- ✅ Não tem conhecimento de programação
- ✅ Nunca usou linha de comando
- ✅ Quer fazer tudo passo a passo
- ✅ Precisa de instruções muito claras

**⏱️ Tempo total estimado: 3-4 horas (com calma, sem pressa)**

---

# PARTE 1: Preparação Inicial (30 minutos)

## 📝 Passo 1: Anotar Informações da Hostinger

### O que você precisa fazer:

1. **Acesse o site da Hostinger:**
   - Abra seu navegador (Chrome, Firefox, etc.)
   - Digite: `https://www.hostinger.com.br`
   - Faça login na sua conta

2. **Encontrar o painel VPS:**
   - Após fazer login, procure por **"VPS"** no menu lateral esquerdo
   - Ou procure por **"Servidores"** ou **"Cloud"**
   - Clique nessa opção

3. **Anotar informações importantes:**
   - Abra um bloco de notas (Notepad no Windows, TextEdit no Mac)
   - Anote as seguintes informações:

   ```
   IP DA VPS: _______________
   (Geralmente aparece como "IP Address" ou "Endereço IP")
   
   USUÁRIO SSH: _______________
   (Geralmente é "root" ou o usuário que você criou)
   
   SENHA SSH: _______________
   (A senha que você configurou ou recebeu por email)
   
   DOMÍNIO: _______________
   (Exemplo: sexyflow.com.br ou sexyflow.com)
   ```

4. **Salvar o arquivo:**
   - Salve esse arquivo com o nome "informacoes-vps.txt"
   - Você vai precisar dessas informações várias vezes

---

## 🔐 Passo 2: Escolher como Conectar na VPS

Você tem 2 opções. Escolha a que prefere:

### **OPÇÃO A: Windows (usando PuTTY) - RECOMENDADO**

**O que é o PuTTY?**
É um programa grátis que permite conectar na VPS. É como um "telefone" para falar com seu servidor.

**Como instalar:**

1. Abra seu navegador
2. Vá para: `https://www.putty.org/`
3. Clique em **"Download"** ou **"Download PuTTY"**
4. Procure por **"64-bit x86"** ou **"Windows Installer"**
5. Baixe o arquivo (geralmente termina com `.msi`)
6. Depois de baixar, clique duas vezes no arquivo
7. Siga as instruções na tela (clique em "Next" várias vezes)
8. Quando terminar, clique em "Finish"

**Como usar o PuTTY:**

1. Abra o programa PuTTY (procure no menu Iniciar)
2. Você verá uma tela com várias opções
3. Na parte **"Host Name (or IP address)"**, digite o IP da sua VPS
   - Exemplo: `185.123.45.67`
4. Na parte **"Port"**, deixe como está: `22`
5. Na parte **"Connection type"**, certifique-se de que está marcado **"SSH"**
6. Clique no botão **"Open"** (embaixo, à direita)
7. Aparecerá uma tela preta com texto
8. Se aparecer uma mensagem perguntando se confia, clique em **"Yes"**
9. Agora você verá: `login as:`
10. Digite: `root` (e pressione Enter)
11. Agora você verá: `Password:`
12. Digite sua senha SSH (não aparecerá nada na tela, é normal!)
13. Pressione Enter
14. Se aparecer algo como `root@seu-servidor:~#`, você conseguiu conectar! 🎉

---

### **OPÇÃO B: Mac ou Linux (usando Terminal)**

**O que é o Terminal?**
É um programa que já vem instalado no Mac e Linux. É como uma "janela de comando".

**Como usar:**

1. No Mac:
   - Pressione `Cmd + Espaço` (as teclas Command e Espaço juntas)
   - Digite: `Terminal`
   - Pressione Enter

2. No Linux:
   - Pressione `Ctrl + Alt + T`
   - Ou procure por "Terminal" no menu

3. Você verá uma tela preta com texto

4. Digite este comando (substitua pelo IP da sua VPS):
   ```bash
   ssh root@185.123.45.67
   ```
   (Substitua `185.123.45.67` pelo IP da sua VPS)

5. Pressione Enter

6. Se aparecer uma mensagem perguntando se confia, digite: `yes` e pressione Enter

7. Agora você verá: `Password:`

8. Digite sua senha SSH (não aparecerá nada na tela, é normal!)

9. Pressione Enter

10. Se aparecer algo como `root@seu-servidor:~#`, você conseguiu conectar! 🎉

---

## ⚠️ IMPORTANTE: Se não conseguir conectar

### ❌ Problema: "Permission denied" (PERMISSÃO NEGADA)

**Este é o problema mais comum! Veja o que fazer:**

#### **Causa 1: Senha incorreta**
- Você está digitando a senha errada
- A senha não aparece na tela (é normal!)
- Tente novamente com calma

#### **O que fazer:**

1. **Verificar a senha no painel da Hostinger:**
   - Acesse o painel da Hostinger
   - Vá em **"VPS"** ou **"Servidores"**
   - Procure por **"Senha"** ou **"Password"** ou **"Credenciais SSH"**
   - Se não souber a senha, você pode:
     - **Opção A**: Resetar a senha no painel da Hostinger
     - **Opção B**: Verificar o email que você recebeu da Hostinger quando criou a VPS

2. **Resetar a senha (se necessário):**
   - No painel da Hostinger, vá em **"VPS"**
   - Clique no seu servidor
   - Procure por **"Reset Password"** ou **"Redefinir Senha"**
   - Gere uma nova senha
   - **ANOTE ESSA SENHA** em um lugar seguro
   - Aguarde 2-3 minutos para a senha ser atualizada

3. **Tentar conectar novamente:**
   ```bash
   ssh root@72.61.216.143
   ```
   (Use o IP da sua VPS, não o domínio)

4. **Quando pedir a senha:**
   - Digite a senha **com cuidado**
   - **NÃO aparecerá nada na tela** (nem asteriscos, nem pontos)
   - Isso é normal! Continue digitando
   - Pressione Enter quando terminar

5. **Se continuar dando erro:**
   - Verifique se copiou a senha corretamente (sem espaços extras)
   - Tente copiar e colar a senha (se for possível)
   - Certifique-se de que está usando a senha SSH, não a senha do painel da Hostinger

#### **Causa 2: Usuário incorreto**

Algumas VPS não usam `root` como usuário padrão. Tente:

1. **Verificar qual usuário usar:**
   - No painel da Hostinger, procure por **"Usuário SSH"** ou **"SSH User"**
   - Geralmente é `root`, mas pode ser `admin`, `ubuntu`, `debian`, etc.

2. **Tentar com outro usuário:**
   ```bash
   ssh admin@72.61.216.143
   ```
   (Substitua `admin` pelo usuário que você encontrou)

#### **Causa 3: VPS não está ativa**

Verifique se a VPS está rodando:
- No painel da Hostinger, verifique se a VPS está **"Ativa"** ou **"Running"**
- Se estiver **"Stopped"** ou **"Parada"**, clique em **"Start"** ou **"Iniciar"**
- Aguarde 2-3 minutos e tente novamente

#### **Causa 4: Firewall bloqueando**

Se nada funcionar, pode ser o firewall bloqueando. Tente:

1. **No painel da Hostinger:**
   - Procure por **"Firewall"** ou **"Segurança"**
   - Certifique-se de que a porta **22** (SSH) está aberta
   - Se não estiver, adicione uma regra para permitir porta 22

---

### ❌ Problema: "Connection refused" ou "Connection timed out"

**O que fazer:**

1. **Verificar se o IP está correto:**
   - No painel da Hostinger, confirme o IP exato da VPS
   - Certifique-se de que está digitando corretamente

2. **Verificar se a VPS está ativa:**
   - No painel, verifique se está **"Running"** ou **"Ativa"**

3. **Aguardar alguns minutos:**
   - Se a VPS acabou de ser criada, pode levar alguns minutos para ficar pronta
   - Aguarde 5-10 minutos e tente novamente

4. **Verificar porta SSH:**
   - A porta padrão é **22**
   - Se sua VPS usa outra porta, você precisa especificar:
   ```bash
   ssh root@72.61.216.143 -p PORTA
   ```
   (Substitua PORTA pelo número da porta)

---

### ✅ Dica: Usar o Console Web da Hostinger

Se não conseguir conectar via SSH, use o console web:

1. **No painel da Hostinger:**
   - Vá em **"VPS"**
   - Clique no seu servidor
   - Procure por **"Console"** ou **"Terminal Web"** ou **"Web SSH"**
   - Clique nessa opção

2. **Você verá um terminal no navegador:**
   - Funciona igual ao SSH
   - Pode fazer login direto daqui
   - Depois de logado, pode configurar o SSH normalmente

---

### 📞 Se NADA funcionar:

1. **Contatar suporte da Hostinger:**
   - Eles podem verificar se há problemas no servidor
   - Eles podem resetar sua senha
   - Eles podem ajudar com configurações de firewall

2. **Verificar documentação da Hostinger:**
   - Procure por "Como conectar via SSH" no site da Hostinger
   - Eles podem ter instruções específicas para seu tipo de VPS

---

# PARTE 2: Configuração Inicial da VPS (45 minutos)

## 🖥️ Passo 3: Atualizar o Sistema

**O que vamos fazer:**
Atualizar todos os programas básicos do sistema para garantir que tudo está funcionando.

**Como fazer:**

1. **Após conectar na VPS** (via PuTTY ou Terminal), você verá uma linha como:
   ```
   root@servidor:~#
   ```

2. **Copie e cole este comando** (um de cada vez):
   ```bash
   apt update
   ```
   Pressione Enter e aguarde (pode levar 1-2 minutos)

3. **Depois que terminar**, copie e cole este comando:
   ```bash
   apt upgrade -y
   ```
   Pressione Enter e aguarde (pode levar 5-10 minutos)

**O que está acontecendo:**
- `apt update` = baixa a lista de atualizações disponíveis
- `apt upgrade -y` = instala todas as atualizações (o `-y` significa "sim" para todas as perguntas)

**Quando terminar:**
Você verá novamente a linha `root@servidor:~#`. Isso significa que terminou!

---

## 📦 Passo 4: Instalar Node.js

**O que é Node.js?**
É o programa que permite rodar aplicações Next.js (o framework que seu projeto usa).

**Como instalar:**

1. **Copie e cole este comando** (uma linha só):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   ```
   Pressione Enter e aguarde (pode levar 1-2 minutos)

2. **Depois que terminar**, copie e cole este comando:
   ```bash
   apt install -y nodejs
   ```
   Pressione Enter e aguarde (pode levar 2-3 minutos)

3. **Verificar se instalou corretamente:**
   Copie e cole estes comandos (um de cada vez):
   ```bash
   node --version
   ```
   Você deve ver algo como: `v20.11.0`

   ```bash
   npm --version
   ```
   Você deve ver algo como: `10.2.3`

**Se aparecerem números de versão, está funcionando! ✅**

**Se aparecer "command not found":**
- Tente novamente os passos acima
- Certifique-se de que digitou tudo corretamente
- Aguarde alguns minutos e tente novamente

---

## 📥 Passo 5: Instalar Git, Nginx e PM2

**O que são esses programas?**
- **Git**: Para baixar código do GitHub (se você usar)
- **Nginx**: Servidor web (o que mostra seu site na internet)
- **PM2**: Gerenciador que mantém sua aplicação rodando

**Como instalar:**

1. **Copie e cole este comando:**
   ```bash
   apt install -y git nginx
   ```
   Pressione Enter e aguarde (pode levar 2-3 minutos)

2. **Depois que terminar**, copie e cole este comando:
   ```bash
   npm install -g pm2
   ```
   Pressione Enter e aguarde (pode levar 1-2 minutos)

3. **Verificar se instalou:**
   ```bash
   git --version
   ```
   Deve mostrar algo como: `git version 2.34.1`

   ```bash
   nginx -v
   ```
   Deve mostrar algo como: `nginx version: nginx/1.18.0`

   ```bash
   pm2 --version
   ```
   Deve mostrar algo como: `5.3.0`

**Se todos mostraram versões, está funcionando! ✅**

---

## 🔒 Passo 6: Instalar Certbot (para SSL/HTTPS)

**O que é Certbot?**
É o programa que instala certificados SSL (aquele "cadeado verde" no navegador, que torna seu site seguro).

**Como instalar:**

1. **Copie e cole este comando:**
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```
   Pressione Enter e aguarde (pode levar 2-3 minutos)

2. **Verificar se instalou:**
   ```bash
   certbot --version
   ```
   Deve mostrar algo como: `certbot 2.0.0`

**Pronto! Agora você tem todos os programas necessários instalados. ✅**

---

# PARTE 3: Upload do Projeto (30-60 minutos)

## 📤 Passo 7: Fazer Upload do Projeto

Você tem 2 opções. Escolha a mais fácil para você:

---

### **OPÇÃO A: Via Git (se seu projeto está no GitHub)**

**Quando usar:**
- Se você já tem seu código no GitHub
- Se você sabe usar Git
- Se você quer atualizar facilmente depois

**Como fazer:**

1. **Na VPS** (via PuTTY ou Terminal), copie e cole:
   ```bash
   mkdir -p /var/www
   cd /var/www
   ```
   Pressione Enter após cada comando

2. **Agora você precisa da URL do seu repositório no GitHub:**
   - Vá para seu repositório no GitHub
   - Clique no botão verde **"Code"**
   - Copie a URL (geralmente começa com `https://github.com/...`)

3. **Na VPS, copie e cole este comando** (substitua pela URL do seu repositório):
   ```bash
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git sexyflow
   ```
   (Substitua `SEU-USUARIO/SEU-REPOSITORIO` pela URL do seu repositório)

4. **Pressione Enter e aguarde** (pode levar alguns minutos)

5. **Entrar na pasta:**
   ```bash
   cd sexyflow
   ```

**Pronto! Seu código foi baixado. ✅**

---

### **OPÇÃO B: Via FileZilla (FTP/SFTP) - RECOMENDADO PARA INICIANTES**

**Quando usar:**
- Se você não usa Git
- Se você quer fazer upload direto dos arquivos
- Se você prefere interface visual

**Como fazer:**

#### **1. Baixar e Instalar FileZilla:**

**No Windows:**
1. Abra seu navegador
2. Vá para: `https://filezilla-project.org/`
3. Clique em **"Download FileZilla Client"**
4. Baixe a versão para Windows
5. Instale o programa (clique duas vezes no arquivo baixado)

**No Mac:**
1. Abra seu navegador
2. Vá para: `https://filezilla-project.org/`
3. Clique em **"Download FileZilla Client"**
4. Baixe a versão para Mac
5. Instale o programa (arraste para a pasta Applications)

#### **2. Conectar no FileZilla:**

1. **Abra o FileZilla**

2. **No topo da tela, você verá campos para preencher:**

   ```
   Host: [coloque o IP da sua VPS]
   Username: root
   Password: [coloque sua senha SSH]
   Port: 22
   ```

3. **Preencha todos os campos:**
   - **Host**: Digite o IP da sua VPS (ex: `185.123.45.67`)
   - **Username**: Digite `root`
   - **Password**: Digite sua senha SSH
   - **Port**: Digite `22`

4. **Clique no botão "Quickconnect"** (ou pressione Enter)

5. **Se aparecer uma mensagem sobre certificado**, clique em **"OK"** ou **"Accept"**

6. **Agora você verá duas partes:**
   - **Lado esquerdo**: Seu computador (arquivos locais)
   - **Lado direito**: Servidor VPS (arquivos do servidor)

#### **3. Navegar no servidor:**

1. **No lado direito** (servidor), você verá uma barra de endereço no topo
2. **Clique nessa barra** e digite: `/var/www`
3. **Pressione Enter**

#### **4. Criar pasta no servidor:**

1. **No lado direito** (servidor), clique com botão direito em qualquer lugar vazio
2. **Clique em "Create directory"** ou "Criar diretório"
3. **Digite**: `sexyflow`
4. **Pressione Enter**
5. **Entre na pasta** (clique duas vezes nela)

#### **5. Fazer upload dos arquivos:**

1. **No lado esquerdo** (seu computador), navegue até a pasta do seu projeto
   - Geralmente está em: `C:\Users\SeuNome\...` ou `/Users/SeuNome/...`
   - Procure pela pasta do projeto SexyFlow

2. **Selecione todos os arquivos:**
   - Pressione `Ctrl + A` (Windows) ou `Cmd + A` (Mac)
   - Ou selecione manualmente todos os arquivos e pastas

3. **Arraste os arquivos** do lado esquerdo para o lado direito
   - Ou clique com botão direito → **"Upload"**

4. **Aguarde o upload terminar** (pode levar 10-30 minutos dependendo do tamanho)
   - Você verá uma barra de progresso na parte de baixo do FileZilla

**Pronto! Seus arquivos foram enviados para o servidor. ✅**

---

## 📦 Passo 8: Instalar Dependências do Projeto

**O que vamos fazer:**
Instalar todas as bibliotecas e programas que o projeto precisa para funcionar.

**Como fazer:**

1. **Na VPS** (via PuTTY ou Terminal), certifique-se de estar na pasta do projeto:
   ```bash
   cd /var/www/sexyflow
   ```

2. **Verificar se está na pasta certa:**
   ```bash
   pwd
   ```
   Deve mostrar: `/var/www/sexyflow`

3. **Listar arquivos para confirmar:**
   ```bash
   ls
   ```
   Você deve ver arquivos como: `package.json`, `next.config.js`, etc.

4. **Instalar dependências:**
   ```bash
   npm install
   ```
   Pressione Enter e aguarde (pode levar 5-10 minutos)
   - Você verá muitas linhas de texto passando
   - Isso é normal, são os pacotes sendo baixados

5. **Compilar o projeto:**
   ```bash
   npm run build
   ```
   Pressione Enter e aguarde (pode levar 5-10 minutos)
   - Você verá muitas linhas de texto passando
   - No final, deve aparecer algo como: `✓ Compiled successfully`

**Se apareceu "Compiled successfully", está funcionando! ✅**

**Se aparecer erros:**
- Anote a mensagem de erro
- Verifique se todas as dependências foram instaladas
- Tente novamente: `npm install` e depois `npm run build`

---

# PARTE 4: Configuração de Variáveis de Ambiente (30 minutos)

## ⚙️ Passo 9: Criar Arquivo .env.local

**O que são variáveis de ambiente?**
São configurações secretas que o projeto precisa (senhas, chaves, URLs, etc.).

**Como fazer:**

1. **Na VPS**, certifique-se de estar na pasta do projeto:
   ```bash
   cd /var/www/sexyflow
   ```

2. **Criar o arquivo:**
   ```bash
   nano .env.local
   ```
   Pressione Enter

3. **Agora você verá um editor de texto** (nano)
   - É uma tela preta com texto na parte de baixo

4. **Cole todo este conteúdo** (use Ctrl+Shift+V para colar no Terminal/PuTTY):

```env
# ============================================
# CONFIGURAÇÕES BÁSICAS
# ============================================
NODE_ENV=production

# ============================================
# MONGODB - Banco de Dados
# ============================================
# IMPORTANTE: Substitua pela sua conexão do MongoDB Atlas
# Você pode encontrar isso no painel do MongoDB Atlas
# Formato: mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority

# ============================================
# NEXTAUTH - Autenticação
# ============================================
# IMPORTANTE: Substitua pelo seu domínio real
NEXTAUTH_URL=https://seu-dominio.com.br

# IMPORTANTE: Gere uma chave secreta (veja instruções abaixo)
NEXTAUTH_SECRET=SUA-CHAVE-SECRETA-AQUI

# ============================================
# DOMÍNIO BASE
# ============================================
# IMPORTANTE: Substitua pelo seu domínio real (sem https://)
BASE_DOMAIN=seu-dominio.com.br
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com.br

# ============================================
# DROPBOX - Armazenamento de Arquivos
# ============================================
USE_DROPBOX=true
DROPBOX_ACCESS_TOKEN=sl.u.AGCoYjwzkVlrilJN3IY_NYQsSkdyqHSsq9dVpfD5AuNxT6ofYkOgqtP72hb8psYyC5sH0aCJVau46oETfbM6k4J4Z_lOrwlrMQ_puNNQpBoAWISuJmcx8PTbkb2KEOuxGVDCHNBrXNA-3FQlBoSne6xVGo4u7UbLi4_m-KcyueiAe79RRBq-owShjgQZ-8B2jIWWKay-bkOnjnkN35op7LUahufFBu9QcQ7YHePpEsQBdIsQUtiKbwHlByglX6vIpd32ym5iQiyomK3t3DDLWOVIp47CLy_jUu_qBuAluUkTOxWltUjj23olKSCdtgkUhm0Eeyu5wJw8kRE0yz1pd9U4vYpq1-UK609GEIAcndEVP8sJsh-YZ01zIOcn-5CJBWLTUUP7ki0MDDSFtnLCVhPwy-NrbWoaxofKr7MNkaqYXS0ZtO-uTDzPAF4tjv4r5iTs8M2Ylqhg-zRtWSuaKTDSksdk_QqJwQOVFIo83fNtmmy92Fj4cmd3F_NZvECGpSPVEf2TLKpy6wM0nSghNDvB_CbI5oLUAT1p1KZ0QIKXTBCTydWBRq2kIYaAfH171wEnZoiVs-ZIUP6BcUWM02vcEE1nwcmSARazjlYzPQr3aOpOtfbUt7mhehwYJthgrSchlJh_uQUsqZbfM-pPs_Yk7F6Kb0uJ7hDnXt87JyDd0VE4rF6q8XLImRNZqSHYH4UTObbBY1Ykv6qAX1iUSyVIIB-9VNzAgev5kbkO2AXpVd5kAHSLFJKNSFL4OSfqjCqNsJsBOmXE0WOjk9DMLhM2lqwVVl71B8yEiGm3lGvP7Q5yck-TknkNHLk6lcWStjT5nX-qLBvc0zPPW6gChcw7tEgzqNcPWWYggsHOyNCWkLPkH_Jj898BDjYpMSKl972D8m1onq3hR2QXbHgmcgeojFN08H6FUW-kD6vIYnNVVgnH4RArVu9aP7ezgtwln6IcRcXdTDdnt3pJdt_Xpiu1t5h89QWTjEo356cWylvWZZHG8KcE4ReY7QciHHPx40pqUCxYufT0WmFH3Q8RWCHGw0-egfPEi5eoFzK3neaJX3rHGpM_cFzIFSyBl-BE1sVjeBMCZ2hfemhU92M8FbNf0d2ozGRH6-FVj9At1pPz8P8QzY-n0iMBxOTqauwG-lL8E4yUsEZSPrJEybmGgyrh75YAD0MYIVq0QyehwTC8-6EHPjz4zcM-kiVe5nlap7aZEV_GaD9FpMGtRbQGBuCMUVWv4hKjYfi86CLF6FwxaOT1accYQHgwnSbz11BGxQp3K8J8d8iNP0FtUXWXiWn_BMOCAVvyd4UkGGhzWHZoiK9M91vNHz-vB9fvITHSK55F5o-1c0FEvyr8KKRYxa80EuEKoXTGaK0j-QNZu8NAuxPdhNGLijUbrVdelD49HIu5tjW5IG7BPe7bBr5G_JyjYW6U9P08nhXWCsLRhTITeg
DROPBOX_APP_KEY=bn28aobr2w4wi0r
DROPBOX_APP_SECRET=496krrnewavixib
DROPBOX_REFRESH_TOKEN=SEU-REFRESH-TOKEN-AQUI

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

5. **AGORA SUBSTITUA os seguintes valores:**
   - `seu-dominio.com.br` → Substitua pelo seu domínio real (ex: `sexyflow.com.br`)
   - `SUA-CHAVE-SECRETA-AQUI` → Veja instruções abaixo para gerar
   - `MONGODB_URI` → Use a mesma conexão do Render (ou MongoDB Atlas)
   - `DROPBOX_REFRESH_TOKEN` → Use o mesmo token do Render (se tiver)

6. **Para sair e salvar no nano:**
   - Pressione `Ctrl + O` (a tecla Control e a letra O juntas)
   - Pressione `Enter` para confirmar
   - Pressione `Ctrl + X` para sair

---

## 🔑 Passo 10: Gerar NEXTAUTH_SECRET

**O que é isso?**
É uma chave secreta que protege as sessões de login dos usuários.

**Como gerar:**

1. **Na VPS**, execute este comando:
   ```bash
   openssl rand -base64 32
   ```
   Pressione Enter

2. **Você verá uma linha longa de letras e números**, algo como:
   ```
   aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9
   ```

3. **Copie essa linha completa** (selecione e copie)

4. **Volte para o arquivo .env.local:**
   ```bash
   nano .env.local
   ```

5. **Encontre a linha:**
   ```
   NEXTAUTH_SECRET=SUA-CHAVE-SECRETA-AQUI
   ```

6. **Substitua `SUA-CHAVE-SECRETA-AQUI` pela chave que você copiou:**
   ```
   NEXTAUTH_SECRET=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9
   ```
   (Use a chave que você gerou, não essa de exemplo!)

7. **Salve novamente:**
   - Pressione `Ctrl + O`
   - Pressione `Enter`
   - Pressione `Ctrl + X`

**Pronto! Suas variáveis de ambiente estão configuradas. ✅**

---

# PARTE 5: Configuração de DNS e Domínio (20 minutos)

## 🌐 Passo 11: Configurar DNS na Hostinger

**O que vamos fazer:**
Fazer com que quando alguém acesse seu domínio, seja redirecionado para sua VPS.

**Como fazer:**

1. **Acesse o painel da Hostinger:**
   - Vá para: `https://www.hostinger.com.br`
   - Faça login

2. **Encontrar gerenciamento de DNS:**
   - No menu lateral, procure por **"Domínios"**
   - Clique em seu domínio
   - Procure por **"DNS"** ou **"Zona de Nomes"** ou **"DNS / Name Servers"**
   - Clique nessa opção

3. **Adicionar registros DNS:**

   Você precisa adicionar 3 registros do tipo **"A"**:

   **Registro 1:**
   - **Tipo**: A (ou A Record)
   - **Nome**: `@` (ou deixe em branco, ou digite apenas `@`)
   - **Valor**: Digite o IP da sua VPS (ex: `185.123.45.67`)
   - **TTL**: `3600` (ou deixe o padrão)
   - Clique em **"Adicionar"** ou **"Salvar"**

   **Registro 2:**
   - **Tipo**: A (ou A Record)
   - **Nome**: `www`
   - **Valor**: Digite o IP da sua VPS (ex: `185.123.45.67`)
   - **TTL**: `3600`
   - Clique em **"Adicionar"** ou **"Salvar"**

   **Registro 3 (para subdomínios):**
   - **Tipo**: A (ou A Record)
   - **Nome**: `*` (asterisco)
   - **Valor**: Digite o IP da sua VPS (ex: `185.123.45.67`)
   - **TTL**: `3600`
   - Clique em **"Adicionar"** ou **"Salvar"**

4. **Salvar todas as alterações:**
   - Procure por um botão **"Salvar"** ou **"Aplicar"**
   - Clique nele

**Pronto! DNS configurado. ✅**

---

## ⏳ Passo 12: Aguardar Propagação DNS

**O que é isso?**
É o tempo que leva para os servidores do mundo inteiro saberem que seu domínio aponta para sua VPS.

**Quanto tempo leva?**
- Geralmente: 1-2 horas
- Pode levar até: 24 horas (raro)
- Mínimo: 5 minutos

**Como verificar se já propagou:**

1. **No seu computador**, abra o Terminal/Prompt de Comando:
   
   **Windows:**
   - Pressione `Win + R`
   - Digite: `cmd`
   - Pressione Enter

   **Mac/Linux:**
   - Abra o Terminal (como você já sabe fazer)

2. **Digite este comando** (substitua pelo seu domínio):
   ```bash
   nslookup seu-dominio.com.br
   ```
   (Substitua `seu-dominio.com.br` pelo seu domínio real)

3. **Pressione Enter**

4. **Se aparecer o IP da sua VPS**, já propagou! ✅
   - Você verá algo como: `Address: 185.123.45.67`

5. **Se não aparecer o IP correto**, aguarde mais alguns minutos e tente novamente

**Dica:** Você pode continuar com os próximos passos mesmo enquanto o DNS propaga. Mas o site só funcionará quando o DNS estiver propagado.

---

# PARTE 6: Configuração do Nginx (20 minutos)

## 🌍 Passo 13: Configurar Nginx

**O que vamos fazer:**
Configurar o servidor web (Nginx) para redirecionar as requisições para sua aplicação.

**Como fazer:**

1. **Na VPS**, criar o arquivo de configuração:
   ```bash
   nano /etc/nginx/sites-available/sexyflow
   ```
   Pressione Enter

2. **Você verá um arquivo vazio**. Cole este conteúdo (substitua `seu-dominio.com.br` pelo seu domínio):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seu-dominio.com.br www.seu-dominio.com.br *.seu-dominio.com.br;

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
```

3. **Substitua `seu-dominio.com.br` pelo seu domínio real** (3 vezes no texto)

4. **Salvar:**
   - Pressione `Ctrl + O`
   - Pressione `Enter`
   - Pressione `Ctrl + X`

5. **Ativar o site:**
   ```bash
   ln -s /etc/nginx/sites-available/sexyflow /etc/nginx/sites-enabled/
   ```
   Pressione Enter

6. **Remover configuração padrão:**
   ```bash
   rm /etc/nginx/sites-enabled/default
   ```
   Pressione Enter

7. **Testar configuração:**
   ```bash
   nginx -t
   ```
   Pressione Enter

   **Se aparecer "syntax is ok" e "test is successful"**, está correto! ✅

8. **Reiniciar Nginx:**
   ```bash
   systemctl restart nginx
   ```
   Pressione Enter

**Pronto! Nginx configurado. ✅**

---

# PARTE 7: Configuração do SSL/HTTPS (15 minutos)

## 🔒 Passo 14: Instalar Certificado SSL

**O que vamos fazer:**
Instalar o certificado SSL para que seu site tenha HTTPS (o cadeado verde).

**IMPORTANTE:** O DNS precisa estar propagado para isso funcionar!

**Como fazer:**

1. **Na VPS**, execute este comando (substitua pelo seu domínio):
   ```bash
   certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
   ```
   (Substitua `seu-dominio.com.br` pelo seu domínio real)

2. **Pressione Enter**

3. **Siga as instruções na tela:**
   - **Email**: Digite seu email e pressione Enter
   - **Termos**: Digite `A` e pressione Enter (para aceitar)
   - **Compartilhar email**: Digite `N` e pressione Enter (não compartilhar)
   - **Redirecionar HTTP para HTTPS**: Digite `2` e pressione Enter (recomendado)

4. **Aguarde** (pode levar 1-2 minutos)

5. **Se aparecer "Congratulations"**, está funcionando! ✅

**Pronto! SSL configurado. Seu site agora tem HTTPS! 🔒**

---

# PARTE 8: Iniciar a Aplicação (10 minutos)

## 🚀 Passo 15: Iniciar com PM2

**O que vamos fazer:**
Iniciar sua aplicação e configurar para que ela inicie automaticamente quando o servidor reiniciar.

**Como fazer:**

1. **Na VPS**, certifique-se de estar na pasta do projeto:
   ```bash
   cd /var/www/sexyflow
   ```

2. **Iniciar a aplicação:**
   ```bash
   pm2 start npm --name "sexyflow" -- start
   ```
   Pressione Enter

3. **Aguarde alguns segundos**

4. **Verificar se está rodando:**
   ```bash
   pm2 status
   ```
   Pressione Enter

   **Você deve ver algo como:**
   ```
   ┌─────────┬────┬─────────┬─────────┬─────────┐
   │ name    │ id │ status  │ cpu     │ memory  │
   ├─────────┼────┼─────────┼─────────┼─────────┤
   │ sexyflow│ 0  │ online  │ 0%      │ 45.2mb  │
   └─────────┴────┴─────────┴─────────┴─────────┘
   ```

   **Se aparecer "online", está funcionando! ✅**

5. **Configurar para iniciar automaticamente:**
   ```bash
   pm2 startup
   ```
   Pressione Enter

   **Você verá um comando longo**. Copie e cole esse comando exatamente como aparece, depois pressione Enter.

6. **Salvar configuração:**
   ```bash
   pm2 save
   ```
   Pressione Enter

**Pronto! Sua aplicação está rodando! ✅**

---

## 📊 Passo 16: Verificar Logs

**Como ver os logs (mensagens) da aplicação:**

1. **Ver logs em tempo real:**
   ```bash
   pm2 logs sexyflow
   ```
   Pressione Enter

2. **Para sair dos logs**, pressione `Ctrl + C`

3. **Ver últimas 50 linhas:**
   ```bash
   pm2 logs sexyflow --lines 50
   ```
   Pressione Enter

**Se você ver mensagens sem erros (ou apenas avisos menores), está tudo funcionando! ✅**

---

# PARTE 9: Atualizar Serviços Externos (20 minutos)

## 🔗 Passo 17: Atualizar Dropbox OAuth

**O que vamos fazer:**
Atualizar o Dropbox para aceitar o novo domínio.

**Como fazer:**

1. **Acesse o Dropbox Developers:**
   - Vá para: `https://www.dropbox.com/developers/apps`
   - Faça login

2. **Selecionar sua aplicação:**
   - Clique na aplicação do SexyFlow

3. **Ir para configurações OAuth:**
   - No menu lateral, clique em **"Settings"**
   - Procure por **"OAuth 2"** ou **"Redirect URIs"**

4. **Adicionar novo redirect URI:**
   - Procure por um campo onde você pode adicionar URLs
   - Adicione: `https://seu-dominio.com.br/api/oauth/dropbox-callback`
   - (Substitua `seu-dominio.com.br` pelo seu domínio real)

5. **Salvar:**
   - Clique em **"Save"** ou **"Salvar"**

**Pronto! Dropbox atualizado. ✅**

---

## 💳 Passo 18: Atualizar Cakto Webhooks

**O que vamos fazer:**
Atualizar a Cakto para enviar webhooks para o novo domínio.

**Como fazer:**

1. **Acesse o painel da Cakto:**
   - Vá para o painel da Cakto
   - Faça login

2. **Encontrar configurações de Webhook:**
   - Procure por **"Webhooks"** ou **"Notificações"** no menu

3. **Atualizar URL do webhook:**
   - Encontre o campo **"Webhook URL"** ou **"URL de Notificação"**
   - Altere de: `https://sexyflow.onrender.com/api/webhooks/cakto`
   - Para: `https://seu-dominio.com.br/api/webhooks/cakto`
   - (Substitua `seu-dominio.com.br` pelo seu domínio real)

4. **Salvar:**
   - Clique em **"Salvar"** ou **"Save"**

**Pronto! Cakto atualizado. ✅**

---

# PARTE 10: Testes Finais (30 minutos)

## ✅ Passo 19: Testar o Site

**Como testar:**

1. **Abrir o navegador:**
   - Abra Chrome, Firefox ou qualquer navegador

2. **Acessar o site:**
   - Digite na barra de endereço: `https://seu-dominio.com.br`
   - (Substitua pelo seu domínio real)

3. **O que você deve ver:**
   - O site deve carregar
   - Deve aparecer um cadeado verde (HTTPS)
   - Não deve aparecer erros

4. **Se aparecer erro:**
   - Anote a mensagem de erro
   - Verifique os logs: `pm2 logs sexyflow`
   - Verifique se o DNS propagou: `nslookup seu-dominio.com.br`

---

## 🧪 Passo 20: Testar Funcionalidades

**Teste cada uma dessas funcionalidades:**

### ✅ Teste 1: Login/Registro
- [ ] Acesse: `https://seu-dominio.com.br/login`
- [ ] Tente fazer login
- [ ] Se não tiver conta, crie uma nova
- [ ] Verifique se funcionou

### ✅ Teste 2: Criar Projeto
- [ ] Após fazer login, vá em "Criar Projeto"
- [ ] Crie um projeto de teste
- [ ] Verifique se funcionou

### ✅ Teste 3: Upload de Arquivos
- [ ] Vá para "Biblioteca" ou "Library"
- [ ] Tente fazer upload de uma imagem
- [ ] Verifique se funcionou

### ✅ Teste 4: Editor de Páginas
- [ ] Entre em um projeto
- [ ] Crie ou edite uma página
- [ ] Verifique se funcionou

### ✅ Teste 5: Preview de Páginas
- [ ] Depois de criar uma página, visualize ela
- [ ] Verifique se aparece corretamente

**Se todos os testes passaram, está tudo funcionando! 🎉**

---

# PARTE 11: Comandos Úteis (Para Consulta)

## 📚 Comandos que você vai usar frequentemente:

### Reiniciar aplicação:
```bash
pm2 restart sexyflow
```

### Ver logs em tempo real:
```bash
pm2 logs sexyflow
```

### Parar aplicação:
```bash
pm2 stop sexyflow
```

### Iniciar aplicação:
```bash
pm2 start sexyflow
```

### Ver status da aplicação:
```bash
pm2 status
```

### Atualizar projeto (se usar Git):
```bash
cd /var/www/sexyflow
git pull
npm install
npm run build
pm2 restart sexyflow
```

### Ver logs do Nginx:
```bash
tail -f /var/log/nginx/error.log
```

### Verificar se porta 3000 está aberta:
```bash
netstat -tlnp | grep 3000
```

---

# PARTE 12: Troubleshooting (Solução de Problemas)

## ❌ Problema: Site não carrega

**O que fazer:**

1. **Verificar se PM2 está rodando:**
   ```bash
   pm2 status
   ```
   Se não estiver "online", reinicie:
   ```bash
   pm2 restart sexyflow
   ```

2. **Verificar se Nginx está rodando:**
   ```bash
   systemctl status nginx
   ```
   Se não estiver rodando, inicie:
   ```bash
   systemctl start nginx
   ```

3. **Verificar logs:**
   ```bash
   pm2 logs sexyflow --lines 50
   ```
   Procure por erros

---

## ❌ Problema: Erro 502 Bad Gateway

**O que fazer:**

1. **Verificar se aplicação está rodando:**
   ```bash
   pm2 status
   ```

2. **Reiniciar aplicação:**
   ```bash
   pm2 restart sexyflow
   ```

3. **Verificar logs:**
   ```bash
   pm2 logs sexyflow
   ```

---

## ❌ Problema: SSL não funciona

**O que fazer:**

1. **Verificar certificado:**
   ```bash
   certbot certificates
   ```

2. **Renovar certificado:**
   ```bash
   certbot renew --force-renewal
   ```

3. **Reiniciar Nginx:**
   ```bash
   systemctl restart nginx
   ```

---

## ❌ Problema: Subdomínios não funcionam

**O que fazer:**

1. **Verificar DNS:**
   ```bash
   nslookup subdominio.seu-dominio.com.br
   ```
   Deve mostrar o IP da VPS

2. **Verificar BASE_DOMAIN no .env.local:**
   ```bash
   nano /var/www/sexyflow/.env.local
   ```
   Certifique-se de que `BASE_DOMAIN` está correto

---

## ❌ Problema: Erro de conexão com MongoDB

**O que fazer:**

1. **Verificar MONGODB_URI:**
   ```bash
   nano /var/www/sexyflow/.env.local
   ```
   Certifique-se de que `MONGODB_URI` está correto

2. **Verificar se IP da VPS está na whitelist do MongoDB Atlas:**
   - Acesse MongoDB Atlas
   - Vá em "Network Access"
   - Adicione o IP da sua VPS

---

# ✅ CHECKLIST FINAL

Antes de considerar a migração completa, verifique:

- [ ] DNS configurado e propagado
- [ ] SSL configurado e funcionando (cadeado verde)
- [ ] Aplicação rodando no PM2 (`pm2 status` mostra "online")
- [ ] Nginx configurado e funcionando
- [ ] Variáveis de ambiente configuradas (.env.local)
- [ ] Dropbox OAuth atualizado
- [ ] Cakto webhooks atualizados
- [ ] Testes de todas funcionalidades passando
- [ ] Backup do banco de dados feito
- [ ] Logs verificados e sem erros críticos

---

# 🎉 Parabéns!

Se você chegou até aqui e todos os testes passaram, sua migração está completa!

Seu site agora está rodando na sua própria VPS com seu próprio domínio!

---

**Última atualização:** 2025-01-XX  
**Versão:** 2.0 (Ultra-Detalhado)  
**Tempo estimado total:** 3-4 horas

