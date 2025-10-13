# 🚀 Deploy do SexyFlow no Render

Este guia te ajudará a fazer o deploy do SexyFlow no Render usando MongoDB Atlas.

## 📋 Pré-requisitos

- [x] MongoDB Atlas configurado
- [x] Repositório no GitHub
- [x] Conta no Render
- [x] Variáveis de ambiente configuradas

## 🛠️ Configuração no Render

### 1. Conectar Repositório

1. **Acesse Render**
   - Vá para [https://render.com](https://render.com)
   - Faça login ou crie uma conta

2. **Conectar GitHub**
   - Clique em "New +"
   - Escolha "Web Service"
   - Conecte sua conta GitHub
   - Selecione o repositório `sexyflow`

### 2. Configurar Web Service

#### 2.1 Configurações Básicas
```
Name: sexyflow
Environment: Node
Region: Oregon (US West) ou Frankfurt (EU Central)
Branch: main
Root Directory: (deixe vazio)
```

#### 2.2 Build & Deploy
```
Build Command: npm install && npm run build
Start Command: npm start
```

#### 2.3 Environment Variables
Adicione as seguintes variáveis:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://tavinmktdigital_db_user:yr1HQU0uzwJ75Ba4@cluster0.xxxxx.mongodb.net/sexyflow?retryWrites=true&w=majority
NEXTAUTH_URL=https://sexyflow.onrender.com
NEXTAUTH_SECRET=<gerar_uma_chave_secreta_forte>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
UPLOAD_MAX_SIZE=2147483648
UPLOAD_PATH=./public/uploads
BASE_DOMAIN=sexyflow.com
```

### 3. Configurar MongoDB Atlas para Render

#### 3.1 Network Access
1. No MongoDB Atlas, vá em "Network Access"
2. Clique em "Add IP Address"
3. Adicione `0.0.0.0/0` (permitir todos os IPs)
   - ⚠️ **Atenção**: Isso permite conexões de qualquer IP
   - Para produção segura, obtenha IPs específicos do Render

#### 3.2 Verificar Conexão
1. Após o deploy, verifique os logs do Render
2. Procure por mensagens de conexão com MongoDB
3. Se houver erros, verifique a string de conexão

### 4. Executar Seed no Render

#### 4.1 Via Console do Render
1. No painel do Render, vá em "Shell"
2. Execute os comandos:
```bash
npm run db:seed
```

#### 4.2 Via API Route (Alternativa)
Crie uma rota temporária para executar o seed:
```javascript
// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET() {
  try {
    exec('npm run db:seed', (error, stdout, stderr) => {
      if (error) {
        console.error('Erro:', error);
        return;
      }
      console.log('Seed executado:', stdout);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no seed' }, { status: 500 });
  }
}
```

### 5. Configurações Avançadas

#### 5.1 Domínio Personalizado
1. No Render, vá em "Settings" > "Custom Domains"
2. Adicione seu domínio personalizado
3. Configure DNS apontando para o Render
4. Atualize `NEXTAUTH_URL` com o novo domínio

#### 5.2 SSL/HTTPS
- Render fornece SSL automático
- Certificados Let's Encrypt gratuitos
- HTTPS habilitado por padrão

#### 5.3 Monitoramento
1. **Logs**: Acesse "Logs" no painel do Render
2. **Métricas**: Monitore CPU, RAM, requisições
3. **Alertas**: Configure alertas para downtime

### 6. Otimizações de Performance

#### 6.1 Build Cache
```bash
# Adicionar ao package.json
"scripts": {
  "build": "next build",
  "start": "next start"
}
```

#### 6.2 Environment Variables
```env
# Otimizações Next.js
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max_old_space_size=4096
```

#### 6.3 MongoDB Connection Pool
```javascript
// lib/mongodb.ts
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
};
```

### 7. Troubleshooting

#### 7.1 Build Failures
```bash
# Verificar logs de build
# Verificar dependências
# Verificar variáveis de ambiente
```

#### 7.2 Runtime Errors
```bash
# Verificar logs de runtime
# Verificar conexão MongoDB
# Verificar variáveis de ambiente
```

#### 7.3 Performance Issues
```bash
# Monitorar métricas
# Verificar uso de RAM
# Otimizar queries MongoDB
```

### 8. Backup e Recuperação

#### 8.1 Backup MongoDB
```bash
# Via MongoDB Atlas (automático)
# Backup manual via mongodump
```

#### 8.2 Backup Código
```bash
# GitHub (automático)
# Backup local do código
```

### 9. Segurança

#### 9.1 Environment Variables
- ✅ Nunca commitar senhas no Git
- ✅ Usar variáveis de ambiente
- ✅ Rotacionar chaves periodicamente

#### 9.2 MongoDB Security
- ✅ Usar usuários específicos
- ✅ Restringir IPs quando possível
- ✅ Habilitar auditoria

#### 9.3 HTTPS
- ✅ SSL habilitado por padrão
- ✅ Headers de segurança configurados
- ✅ CSP (Content Security Policy)

### 10. Monitoramento

#### 10.1 Health Checks
```javascript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 500 });
  }
}
```

#### 10.2 Uptime Monitoring
- Configure uptime monitoring externo
- Use serviços como UptimeRobot ou Pingdom
- Configure alertas por email/SMS

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Render
- [ ] Web service configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] MongoDB Atlas configurado para Render
- [ ] Build executado com sucesso
- [ ] Seed executado no banco
- [ ] Aplicação acessível via HTTPS
- [ ] Logs sem erros críticos
- [ ] Domínio personalizado configurado (opcional)
- [ ] Monitoramento configurado

## 🚀 Comandos Úteis

```bash
# Deploy manual
git push origin main

# Verificar logs
# Render Dashboard > Logs

# Executar seed
npm run db:seed

# Verificar saúde
curl https://sexyflow.onrender.com/api/health
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Render
2. Consulte a documentação do Render
3. Entre em contato com o suporte

---

**SexyFlow** - Deploy no Render concluído! 🎉
