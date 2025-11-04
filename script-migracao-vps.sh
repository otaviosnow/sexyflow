#!/bin/bash

# Script de ajuda para migração do SexyFlow para VPS
# Execute este script APÓS conectar na VPS via SSH

echo "🚀 Script de Migração - SexyFlow para VPS"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute como root (use: sudo -i)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Executando como root${NC}"
echo ""

# Atualizar sistema
echo -e "${YELLOW}📦 Atualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar Node.js
if ! command_exists node; then
    echo -e "${YELLOW}📦 Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}✅ Node.js já instalado: $(node --version)${NC}"
fi

# Instalar Git
if ! command_exists git; then
    echo -e "${YELLOW}📦 Instalando Git...${NC}"
    apt install -y git
else
    echo -e "${GREEN}✅ Git já instalado${NC}"
fi

# Instalar Nginx
if ! command_exists nginx; then
    echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
    apt install -y nginx
    systemctl enable nginx
else
    echo -e "${GREEN}✅ Nginx já instalado${NC}"
fi

# Instalar PM2
if ! command_exists pm2; then
    echo -e "${YELLOW}📦 Instalando PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 já instalado${NC}"
fi

# Instalar Certbot
if ! command_exists certbot; then
    echo -e "${YELLOW}📦 Instalando Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ Certbot já instalado${NC}"
fi

echo ""
echo -e "${GREEN}✅ Instalação de dependências concluída!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "1. Faça upload do projeto para /var/www/sexyflow"
echo "2. Crie o arquivo .env.local com as variáveis de ambiente"
echo "3. Execute: cd /var/www/sexyflow && npm install && npm run build"
echo "4. Configure o Nginx (veja guia completo)"
echo "5. Configure DNS na Hostinger"
echo "6. Execute: certbot --nginx -d seu-dominio.com.br"
echo "7. Execute: pm2 start npm --name 'sexyflow' -- start"
echo ""
echo "📖 Veja o guia completo: GUIA_MIGRACAO_VPS_HOSTINGER.md"

