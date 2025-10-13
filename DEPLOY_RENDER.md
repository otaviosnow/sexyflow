# 🚀 Deploy SexyFlow no Render - Guia Completo

Este guia te ajudará a fazer o deploy completo do SexyFlow no Render.

## 📋 Pré-requisitos

- [x] Conta no [Render](https://render.com)
- [x] MongoDB Atlas configurado
- [x] Repositório no GitHub
- [x] String de conexão MongoDB

## 🛠️ Passo a Passo

### 1. Preparar Repositório GitHub

#### 1.1 Commitar Código
```bash
git add .
git commit -m "feat: configuração completa MongoDB e deploy"
git push origin main
```

#### 1.2 Verificar Estrutura
Certifique-se que tem estes arquivos:
```
sexyflow/
├── app/
├── lib/
├── models/
├── package.json
├── next.config.js
├── tailwind.config.js
├── render.yaml
└── README.md
```

### 2. Conectar ao Render

#### 2.1 Acessar Render
1. Vá para [https://render.com](https://render.com)
2. Clique em "Sign Up" ou "Log In"
3. Conecte sua conta GitHub

#### 2.2 Criar Web Service
1. Clique em "New +"
2. Escolha "Web Service"
3. Selecione seu repositório `sexyflow`
4. Clique em "Connect"

### 3. Configurar Web Service

#### 3.1 Configurações Básicas
```
Name: sexyflow
Environment: Node
Region: Oregon (US West) ou Frankfurt (EU Central)
Branch: main
Root Directory: (deixe vazio)
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

#### 3.2 Configurar Plano
- **Starter**: Grátis (com limitações)
- **Standard**: $7/mês (recomendado para produção)

### 4. Configurar Environment Variables

No painel do Render, vá em "Environment" e adicione:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://tavinmktdigital_db_user:yr1HQU0uzwJ75Ba4@cluster0.m2jiz03.mongodb.net/sexyflow?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_URL=https://sexyflow.onrender.com
NEXTAUTH_SECRET=sexyflow-super-secret-key-2024-render
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
UPLOAD_MAX_SIZE=2147483648
UPLOAD_PATH=./public/uploads
BASE_DOMAIN=sexyflow.com
```

### 5. Configurar MongoDB Atlas para Render

#### 5.1 Network Access
1. No MongoDB Atlas, vá em "Network Access"
2. Clique em "Add IP Address"
3. **IMPORTANTE**: Adicione `0.0.0.0/0`
   - Isso permite conexões de qualquer IP
   - Necessário para o Render funcionar

#### 5.2 Verificar Usuário
- Username: `tavinmktdigital_db_user`
- Password: `yr1HQU0uzwJ75Ba4`
- Role: `readWrite` no banco `sexyflow`

### 6. Deploy Inicial

#### 6.1 Primeiro Deploy
1. Clique em "Create Web Service"
2. Aguarde o build (pode demorar 5-10 minutos)
3. Verifique os logs para erros

#### 6.2 Verificar Logs
- Vá em "Logs" no painel do Render
- Procure por mensagens de erro
- Deve aparecer: "Ready - started server on 0.0.0.0:10000"

### 7. Executar Seed no Render

#### 7.1 Via Shell (Recomendado)
1. No painel do Render, vá em "Shell"
2. Execute:
```bash
npm run db:seed
```

#### 7.2 Via API Route
1. Acesse: `https://sexyflow.onrender.com/api/seed`
2. Deve retornar: `{"success": true}`

### 8. Testar Aplicação

#### 8.1 URLs de Teste
```
Landing Page: https://sexyflow.onrender.com
Login: https://sexyflow.onrender.com/auth/login
Register: https://sexyflow.onrender.com/auth/register
API Health: https://sexyflow.onrender.com/api/health
```

#### 8.2 Credenciais de Teste
- **Admin**: admin@sexyflow.com / admin123
- **Usuário**: Crie um novo via registro

### 9. Configurações Avançadas

#### 9.1 Domínio Personalizado
1. No Render, vá em "Settings" > "Custom Domains"
2. Adicione seu domínio
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: sexyflow.onrender.com
   ```

#### 9.2 SSL/HTTPS
- Render fornece SSL automático
- Certificados Let's Encrypt gratuitos
- HTTPS habilitado por padrão

#### 9.3 Monitoramento
1. **Logs**: Acesse "Logs" para debug
2. **Métricas**: Monitore CPU, RAM, requests
3. **Uptime**: Configure alertas externos

### 10. Troubleshooting

#### 10.1 Build Failures
```bash
# Verificar logs de build
# Verificar dependências no package.json
# Verificar variáveis de ambiente
```

#### 10.2 Runtime Errors
```bash
# Verificar logs de runtime
# Verificar conexão MongoDB
# Verificar NEXTAUTH_SECRET
```

#### 10.3 Performance Issues
```bash
# Upgrade para Standard plan ($7/mês)
# Otimizar queries MongoDB
# Implementar cache
```

### 11. Comandos Úteis

#### 11.1 Deploy Manual
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Render faz deploy automático
```

#### 11.2 Verificar Status
```bash
# Render Dashboard > Logs
# Verificar métricas de performance
# Testar endpoints da API
```

#### 11.3 Executar Seed
```bash
# Via Shell do Render
npm run db:seed

# Via API
curl https://sexyflow.onrender.com/api/seed
```

### 12. Checklist Final

- [ ] Repositório GitHub configurado
- [ ] Render conectado ao GitHub
- [ ] Web service criado
- [ ] Environment variables configuradas
- [ ] MongoDB Atlas configurado para Render
- [ ] Build executado com sucesso
- [ ] Seed executado no banco
- [ ] Aplicação acessível via HTTPS
- [ ] Logs sem erros críticos
- [ ] Testes de funcionalidades realizados

### 13. URLs Importantes

```
Render Dashboard: https://dashboard.render.com
MongoDB Atlas: https://cloud.mongodb.com
GitHub Repository: https://github.com/otaviosnow/sexyflow
SexyFlow App: https://sexyflow.onrender.com
```

### 14. Próximos Passos

1. ✅ Deploy concluído
2. 🔄 Configurar domínio personalizado
3. 🔄 Implementar monitoramento
4. 🔄 Configurar backups automáticos
5. 🔄 Otimizar performance

## 🎉 Parabéns!

Seu SexyFlow está no ar! 🚀

**URL da aplicação**: `https://sexyflow.onrender.com`

---

**SexyFlow** - Deploy no Render concluído com sucesso! 🔥
