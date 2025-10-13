# 🗄️ Configuração do MongoDB Atlas para SexyFlow

Este guia te ajudará a configurar o MongoDB Atlas para o projeto SexyFlow.

## 📋 Pré-requisitos

- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Acesso ao painel administrativo

## 🚀 Passo a Passo

### 1. Criar Cluster

1. **Acesse MongoDB Atlas**
   - Vá para [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - Faça login ou crie uma conta

2. **Criar Novo Projeto**
   - Clique em "New Project"
   - Nome: `SexyFlow`
   - Clique em "Create Project"

3. **Criar Cluster**
   - Clique em "Build a Database"
   - Escolha "FREE" (M0 Sandbox)
   - Escolha a região: `São Paulo (Brazil)`
   - Nome do cluster: `Cluster0`
   - Clique em "Create Cluster"

### 2. Configurar Segurança

#### 2.1 Network Access (Lista de IPs)

1. **Acessar Network Access**
   - No menu lateral, clique em "Network Access"
   - Clique em "Add IP Address"

2. **Adicionar IPs**
   - **Para desenvolvimento local**: Clique em "Add Current IP Address"
   - **Para Render**: Adicione `0.0.0.0/0` (permitir todos os IPs)
   - **Para produção segura**: Adicione IPs específicos do Render

3. **Confirmar**
   - Clique em "Confirm"

#### 2.2 Database Access (Usuários)

1. **Acessar Database Access**
   - No menu lateral, clique em "Database Access"
   - Clique em "Add New Database User"

2. **Configurar Usuário**
   - **Authentication Method**: Password
   - **Username**: `tavinmktdigital_db_user`
   - **Password**: `yr1HQU0uzwJ75Ba4`
   - **Database User Privileges**: "Atlas admin" (para começar)

3. **Confirmar**
   - Clique em "Add User"

### 3. Obter String de Conexão

1. **Conectar ao Cluster**
   - Clique em "Connect" no cluster
   - Escolha "Connect your application"

2. **Configurar Conexão**
   - **Driver**: Node.js
   - **Version**: 4.1 or later
   - Copie a string de conexão

3. **Personalizar String**
   ```
   mongodb+srv://tavinmktdigital_db_user:yr1HQU0uzwJ75Ba4@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority
   ```
   - Substitua `<password>` pela senha: `yr1HQU0uzwJ75Ba4`
   - Substitua `<dbname>` por: `sexyflow`

### 4. Configurar no Projeto

1. **Arquivo .env.local**
   ```env
   MONGODB_URI="mongodb+srv://tavinmktdigital_db_user:yr1HQU0uzwJ75Ba4@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority"
   ```

2. **Testar Conexão**
   ```bash
   npm run db:seed
   ```

### 5. Configurações Avançadas

#### 5.1 Índices Automáticos
O projeto já cria índices automaticamente para otimizar as consultas:

- **Users**: email, subdomain, isActive
- **Templates**: type, isActive
- **Pages**: userId+slug, userId, type, isPublished
- **Analytics**: userId, pageId, event, createdAt
- **FileUploads**: userId, mimetype, createdAt

#### 5.2 Monitoramento
1. **Metrics**
   - Acesse "Metrics" no cluster
   - Monitore CPU, RAM, conexões
   - Configure alertas se necessário

2. **Logs**
   - Acesse "Logs" no cluster
   - Monitore conexões e erros
   - Configure logs detalhados

#### 5.3 Backup
1. **Backup Automático**
   - Cluster M0: Backup automático (7 dias)
   - Cluster M2+: Backup automático (30 dias)

2. **Backup Manual**
   - Use mongodump para backups manuais
   - Configure scripts de backup periódicos

### 6. Segurança em Produção

#### 6.1 Restringir IPs
```bash
# Para Render, obtenha IPs específicos
# Adicione apenas IPs do Render na Network Access
```

#### 6.2 Usuários Específicos
```javascript
// Criar usuário apenas para leitura
{
  "username": "sexyflow_readonly",
  "password": "senha_forte_aqui",
  "roles": [
    {
      "role": "read",
      "db": "sexyflow"
    }
  ]
}
```

#### 6.3 Criptografia
- TLS/SSL habilitado por padrão
- Criptografia em trânsito automática
- Considere criptografia em repouso para dados sensíveis

### 7. Troubleshooting

#### 7.1 Erro de Conexão
```bash
# Verificar string de conexão
# Verificar IPs na Network Access
# Verificar credenciais
```

#### 7.2 Timeout
```javascript
// Ajustar timeouts no código
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10
};
```

#### 7.3 Limites do M0
- **Conexões**: Máximo 100
- **Armazenamento**: 512MB
- **RAM**: 1GB compartilhado
- **CPU**: Limitado

### 8. Upgrade de Plano

Quando necessário:
1. **M2** (Shared): $9/mês
   - 2GB RAM
   - 10GB armazenamento
   - Backup 30 dias

2. **M5** (Dedicated): $25/mês
   - 2GB RAM dedicado
   - 10GB armazenamento
   - Backup 30 dias

3. **M10+** (Dedicated): $57+/mês
   - Mais RAM e armazenamento
   - Melhor performance

## ✅ Checklist Final

- [ ] Cluster criado e funcionando
- [ ] Usuário de banco configurado
- [ ] IPs adicionados na Network Access
- [ ] String de conexão obtida
- [ ] Variável MONGODB_URI configurada
- [ ] Teste de conexão realizado
- [ ] Seed executado com sucesso
- [ ] Índices criados automaticamente
- [ ] Monitoramento configurado

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do MongoDB Atlas
2. Consulte a documentação oficial
3. Entre em contato com o suporte

---

**SexyFlow** - Configuração MongoDB Atlas completa! 🚀
