# 🔥 SexyFlow - SaaS para Nicho Hot

SaaS completo para automatização de páginas de vendas no nicho hot/adulto, com editor visual, hospedagem automática e analytics avançados.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Autenticação**: NextAuth.js
- **Banco de Dados**: MongoDB Atlas
- **Deploy**: Render
- **Email**: Nodemailer
- **Upload**: Multer
- **Analytics**: Sistema próprio

## 📋 Funcionalidades

### Para Usuários
- ✅ Sistema de autenticação completo
- ✅ Dashboard personalizado
- ✅ Criação de páginas com templates
- ✅ Editor visual drag & drop
- ✅ Upload de arquivos (até 2GB)
- ✅ Hospedagem automática com subdomínios
- ✅ Analytics e relatórios
- ✅ Planos mensais e anuais

### Para Admins
- ✅ Painel administrativo
- ✅ Gerenciamento de templates
- ✅ Relatórios agregados
- ✅ Auditoria de ações
- ✅ Configurações do sistema

### Tipos de Página
- 📱 Página de Presell
- 🎥 Página de Prévia
- 💰 Pós-venda Produto X
- 📦 Entrega do Produto
- 🎯 Pós-venda Produto Y

## 🛠️ Configuração do MongoDB Atlas

### 1. Configurar Cluster
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (M0 Sandbox é gratuito)
4. Escolha a região mais próxima do Brasil

### 2. Configurar Segurança
1. **Network Access**: Adicione seu IP atual (201.162.72.91)
2. **Database Access**: Crie um usuário com as credenciais:
   - Username: `tavinmktdigital_db_user`
   - Password: `yr1HQU0uzwJ75Ba4`
   - Role: `Atlas admin`

### 3. Obter String de Conexão
1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Copie a string de conexão
4. Substitua `<password>` pela senha do usuário
5. Substitua `<dbname>` por `sexyflow`

### String de Conexão Final:
```
mongodb+srv://tavinmktdigital_db_user:yr1HQU0uzwJ75Ba4@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority
```

## 🔧 Configuração Local

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
MONGODB_URI="sua_string_de_conexao_mongodb"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-key-aqui"

# Email (para notificações)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"

# Upload de arquivos
UPLOAD_MAX_SIZE="2147483648"
UPLOAD_PATH="./public/uploads"

# Subdomínios
BASE_DOMAIN="sexyflow.com"
```

### 3. Popular Banco de Dados
```bash
npm run db:seed
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```

## 🚀 Deploy no Render

### 1. Conectar Repositório
1. Acesse [Render](https://render.com)
2. Conecte sua conta GitHub
3. Selecione o repositório `sexyflow`

### 2. Configurar Web Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node`

### 3. Variáveis de Ambiente no Render
Adicione todas as variáveis do `.env.local` no painel do Render.

### 4. Configurar MongoDB Atlas para Render
1. No MongoDB Atlas, vá em "Network Access"
2. Adicione `0.0.0.0/0` para permitir conexões de qualquer IP
3. Ou adicione o IP específico do Render (disponível nos logs)

## 📁 Estrutura do Projeto

```
sexyflow/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   └── page.tsx           # Landing page
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
├── models/                # Modelos MongoDB/Mongoose
├── types/                 # Tipos TypeScript
├── public/                # Arquivos estáticos
└── styles/                # Estilos globais
```

## 🔐 Credenciais Padrão

Após executar o seed:
- **Admin**: admin@sexyflow.com
- **Senha**: admin123

## 📊 Modelos de Dados

### User
- Informações do usuário
- Planos e permissões
- Subdomínio personalizado

### Template
- Templates de páginas
- Configurações de estilo
- Conteúdo padrão

### Page
- Páginas criadas pelos usuários
- Conteúdo personalizado
- Status de publicação

### Analytics
- Eventos de página
- Métricas de conversão
- Dados de usuário

### FileUpload
- Arquivos enviados
- Metadados de upload
- Controle de acesso

## 🎨 Design System

### Cores
- **Primary**: Vermelho (#dc2626)
- **Secondary**: Rosa (#ec4899)
- **Dark**: Cinza escuro (#0f172a)
- **Light**: Branco (#ffffff)

### Fontes
- **Heading**: Playfair Display
- **Body**: Inter

### Componentes
- Design sedutor e moderno
- Gradientes quentes
- Animações suaves
- Responsivo

## 📈 Próximos Passos

1. ✅ Configurar MongoDB Atlas
2. ✅ Implementar autenticação
3. ✅ Criar templates padrão
4. 🔄 Desenvolver editor visual
5. 🔄 Implementar hospedagem automática
6. 🔄 Sistema de analytics
7. 🔄 Deploy no Render

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Email: contato@sexyflow.com
- Discord: [Link do servidor]

---

**SexyFlow** - Automatize suas vendas no nicho hot 🔥
