# 🚀 SexyFlow - Sistema de Páginas de Vendas

Uma plataforma completa para criação e gerenciamento de páginas de vendas com editor visual, sistema de assinaturas e analytics.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- **Login/Registro** com validação completa
- **Autenticação local** com localStorage
- **Redirecionamento inteligente** baseado no status do plano

### 💳 Planos de Assinatura
- **STARTER**: R$ 97/mês - 3 páginas, subdomínio
- **PRO**: R$ 197/mês - 8 páginas, subdomínio, analytics
- **ENTERPRISE**: Contato direto - Domínio customizado, suporte prioritário

### 🎨 Editor Visual
- **Drag & Drop** de elementos
- **Templates pré-definidos**
- **Responsive design** (Desktop, Tablet, Mobile)
- **Facebook Pixel** integrado
- **Preview em tempo real**

### 📊 Dashboard Completo
- **Gestão de projetos** com subdomínios
- **Analytics** de visualizações e cliques
- **Biblioteca de mídia**
- **Sistema administrativo**

### 🛠️ Tecnologias Utilizadas
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **LocalStorage** - Persistência de dados

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/otaviosnow/sexyflow.git
cd sexyflow

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Acesso
- **URL**: http://localhost:3000
- **Admin**: admin@gmail.com (senha: admin123)

## 📁 Estrutura do Projeto

```
sexyflow/
├── app/                    # Páginas Next.js
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard do usuário
│   ├── login/             # Autenticação
│   ├── projects/          # Gestão de projetos
│   ├── payment/           # Sistema de pagamentos
│   └── choose-plan/       # Seleção de planos
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e serviços
│   ├── models/           # Modelos de dados
│   ├── services/         # Serviços (Payment, etc.)
│   └── utils/            # Funções utilitárias
└── public/               # Arquivos estáticos
```

## 🔄 Fluxo do Usuário

### 1. **Novo Usuário**
```
Homepage → Registro → Login → Escolher Plano → Pagamento → Projetos
```

### 2. **Usuário Logado**
```
Homepage → Projetos → Dashboard → Editor → Preview
```

### 3. **Admin**
```
Login → Dashboard Admin → Gestão de Usuários/Templates
```

## 🎯 Funcionalidades por Plano

| Funcionalidade | STARTER | PRO | ENTERPRISE |
|----------------|---------|-----|------------|
| Páginas | 3 | 8 | Ilimitadas |
| Subdomínio | ✅ | ✅ | ✅ |
| Domínio Customizado | ❌ | ❌ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Suporte | Email | Email | WhatsApp |

## 🛡️ Segurança

- **Validação de formulários** completa
- **Sanitização de dados** de entrada
- **Proteção CSRF** nas APIs
- **Validação de planos** no backend

## 📱 Responsividade

- **Mobile First** design
- **Breakpoints** otimizados
- **Touch gestures** no editor
- **Preview responsivo** em tempo real

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```env
# .env.local
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=your-mongodb-connection
```

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
```

## 📈 Próximas Funcionalidades

- [ ] **Integração com Stripe** real
- [ ] **Email marketing** integrado
- [ ] **A/B Testing** de páginas
- [ ] **API REST** completa
- [ ] **Webhooks** de pagamento
- [ ] **Templates** premium
- [ ] **SEO** otimizado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **WhatsApp**: +55 31 99778-3097
- **Email**: suporte@sexyflow.com
- **GitHub Issues**: [Reportar Bug](https://github.com/otaviosnow/sexyflow/issues)

---

**Desenvolvido com ❤️ para revolucionar a criação de páginas de vendas**# Test workflow
# Test workflow deployment
