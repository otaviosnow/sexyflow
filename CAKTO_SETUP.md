# 🚀 Configuração da Cakto - SexyFlow

## 📋 **PASSO A PASSO COMPLETO:**

### **1. Criar Conta na Cakto**
1. Acesse: https://cakto.com
2. Clique em "Criar Conta"
3. Preencha os dados da empresa
4. Aguarde aprovação (pode levar alguns dias)

### **2. Configurar Aplicação**
1. Acesse o painel da Cakto
2. Vá em "Desenvolvedores" → "Minhas Aplicações"
3. Clique em "Nova Aplicação"
4. Preencha:
   - **Nome:** SexyFlow
   - **Descrição:** SaaS para criação de páginas de vendas
   - **URL de retorno:** `https://sexyflow.onrender.com/dashboard`
   - **Webhook URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`

### **3. Obter Credenciais**
Após criar a aplicação, você receberá:
- **API Key** (chave pública)
- **Secret Key** (chave privada)
- **Webhook Secret** (para validar webhooks)

### **4. Configurar Variáveis de Ambiente**
Adicione no seu `.env.local`:

```env
# Cakto Configuration
CAKTO_API_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CAKTO_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CAKTO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CAKTO_ENVIRONMENT=sandbox

# Para produção, mude para:
# CAKTO_ENVIRONMENT=production
```

### **5. Configurar Webhooks**
No painel da Cakto, configure os seguintes eventos:
- ✅ `subscription.created`
- ✅ `subscription.updated`
- ✅ `subscription.canceled`
- ✅ `payment.succeeded`
- ✅ `payment.failed`
- ✅ `subscription.past_due`

**URL do Webhook:** `https://sexyflow.onrender.com/api/webhooks/cakto`

### **6. Criar Planos**
Os planos serão criados automaticamente, mas você pode criar manualmente:

#### **Plano Mensal:**
- **Nome:** SexyFlow Mensal
- **Descrição:** Plano mensal com 5 páginas
- **Valor:** R$ 97,00
- **Intervalo:** Mensal
- **Moeda:** BRL

#### **Plano Anual:**
- **Nome:** SexyFlow Anual
- **Descrição:** Plano anual com 10 páginas - Economize 2 meses!
- **Valor:** R$ 970,00
- **Intervalo:** Anual
- **Moeda:** BRL

### **7. Testar Integração**

#### **Ambiente Sandbox:**
```bash
# Testar criação de cliente
curl -X POST https://sandbox-api.cakto.com/customers \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "document": "12345678901"
  }'
```

#### **Testar Webhook:**
```bash
# Simular webhook
curl -X POST https://sexyflow.onrender.com/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -H "x-cakto-signature: test_signature" \
  -d '{
    "type": "subscription.created",
    "data": {
      "id": "sub_test_123",
      "status": "active",
      "customer_id": "cus_test_123",
      "plan_id": "plan_test_123"
    }
  }'
```

### **8. Configurar Produção**

#### **Certificado SSL:**
```bash
# No Render, configure:
# Domain: *.sexyflow.onrender.com
# SSL: Automatic (Let's Encrypt)
```

#### **DNS Wildcard:**
```
# Configurar no Render:
# CNAME: *.sexyflow.onrender.com → sexyflow.onrender.com
```

### **9. Monitoramento**

#### **Logs Importantes:**
- ✅ Criação de assinaturas
- ✅ Webhooks recebidos
- ✅ Pagamentos processados
- ✅ Cancelamentos
- ❌ Falhas de pagamento

#### **Métricas para Acompanhar:**
- Taxa de conversão de pagamentos
- Churn rate (cancelamentos)
- MRR (Monthly Recurring Revenue)
- LTV (Lifetime Value)

### **10. Troubleshooting**

#### **Problemas Comuns:**

**Webhook não recebido:**
- Verificar URL do webhook
- Verificar SSL (deve ser HTTPS)
- Verificar firewall/proxy

**Pagamento falhando:**
- Verificar dados do cartão
- Verificar limites do cartão
- Verificar configuração da Cakto

**Assinatura não criada:**
- Verificar logs da API
- Verificar banco de dados
- Verificar webhooks

### **11. Suporte**

#### **Cakto:**
- 📧 Email: suporte@cakto.com
- 📱 WhatsApp: (11) 99999-9999
- 📚 Docs: https://docs.cakto.com

#### **Render:**
- 📧 Email: help@render.com
- 📚 Docs: https://render.com/docs

---

## 🎯 **RESULTADO FINAL:**

Após configurar tudo, você terá:

✅ **Pagamentos automáticos** via Cakto
✅ **Webhooks funcionando** para atualizações
✅ **Período de graça** de 7 dias
✅ **Exclusão automática** após período de graça
✅ **Subdomínios funcionando** para cada usuário
✅ **Sistema completo** de assinaturas

**Seu SaaS estará pronto para receber pagamentos!** 🚀
