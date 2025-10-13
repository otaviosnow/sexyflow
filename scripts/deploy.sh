#!/bin/bash

# 🚀 Script de Deploy Automático para SexyFlow
# Este script automatiza o processo de deploy no Render

echo "🔥 Iniciando deploy do SexyFlow..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto SexyFlow"
    exit 1
fi

# Verificar se git está configurado
if ! git status &> /dev/null; then
    print_error "Este não é um repositório Git válido"
    exit 1
fi

print_status "Verificando status do Git..."

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    print_warning "Há mudanças não commitadas. Commitando automaticamente..."
    
    # Adicionar todos os arquivos
    git add .
    
    # Commit com mensagem automática
    git commit -m "feat: deploy automático $(date '+%Y-%m-%d %H:%M:%S')"
    
    if [ $? -eq 0 ]; then
        print_success "Mudanças commitadas com sucesso"
    else
        print_error "Erro ao commitar mudanças"
        exit 1
    fi
fi

print_status "Fazendo push para o GitHub..."

# Push para o repositório remoto
git push origin main

if [ $? -eq 0 ]; then
    print_success "Push realizado com sucesso"
else
    print_error "Erro ao fazer push"
    exit 1
fi

print_status "Deploy iniciado no Render..."
print_warning "Aguarde alguns minutos para o build ser concluído"

# URLs importantes
echo ""
echo "📋 URLs importantes:"
echo "  • Render Dashboard: https://dashboard.render.com"
echo "  • MongoDB Atlas: https://cloud.mongodb.com"
echo "  • GitHub Repository: https://github.com/otaviosnow/sexyflow"
echo "  • SexyFlow App: https://sexyflow.onrender.com"
echo ""

print_status "Próximos passos:"
echo "  1. Acesse o Render Dashboard"
echo "  2. Verifique os logs do build"
echo "  3. Execute o seed após o deploy"
echo "  4. Teste a aplicação"
echo ""

print_success "Deploy iniciado! 🚀"
print_warning "Acompanhe o progresso no Render Dashboard"

# Aguardar um pouco e tentar verificar status
sleep 5

print_status "Verificando status da aplicação..."

# Tentar fazer uma requisição para verificar se está online
if command -v curl &> /dev/null; then
    echo "Aguardando aplicação ficar online..."
    
    # Tentar por até 2 minutos
    for i in {1..24}; do
        if curl -s -f https://sexyflow.onrender.com/api/health &> /dev/null; then
            print_success "Aplicação está online! 🎉"
            break
        else
            echo -n "."
            sleep 5
        fi
    done
else
    print_warning "curl não encontrado. Verifique manualmente no navegador"
fi

echo ""
print_success "Deploy do SexyFlow concluído! 🔥"
echo "Acesse: https://sexyflow.onrender.com"
