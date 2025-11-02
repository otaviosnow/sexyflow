# 🔗 Integração com Cakto - SexyFlow

## 📋 Como Funciona a Integração

A integração com a Cakto funciona através de **links de checkout** (configurados manualmente) e **webhooks**:

### **Fluxo Completo:**

1. **Usuário escolhe um plano** na página `/choose-plan`
2. **Sistema obtém link de checkout** configurado manualmente na Cakto (`/api/subscriptions/create`)
3. **Usuário é redirecionado** para o link de checkout da Cakto
4. **Usuário paga** na página da Cakto (cartão, PIX, boleto)
5. **Cakto envia webhook** para `/api/webhooks/cakto` quando:
   - Pagamento é aprovado ✅
   - Pagamento falha ❌
   - Assinatura é cancelada 🚫
   - Assinatura é renovada 🔄
   - Reembolso é processado 💸
6. **Sistema processa webhook** e atualiza subscription no banco de dados

---

## 🚀 Configuração na Cakto

### **1. Criar Links de Checkout na Cakto**

Você precisa criar os links de checkout na Cakto manualmente para cada plano. Veja `CAKTO_LINKS_SETUP.md` para instruções detalhadas.

**Links necessários:**
- Starter Mensal
- Starter Anual  
- Pro Mensal
- Pro Anual

### **2. Configurar URLs de Callback**

Ao criar cada link de checkout, configure:

- **URL de Sucesso:** `https://sexyflow.onrender.com/payment/success`
- **URL de Cancelamento:** `https://sexyflow.onrender.com/payment/cancel`
- **Webhook URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`

### **3. Adicionar Links nas Variáveis de Ambiente**

Após criar os links, adicione no `.env.local`:

```env
CAKTO_CHECKOUT_STARTER_MONTHLY=https://checkout.cakto.com/seu-link-starter-mensal
CAKTO_CHECKOUT_STARTER_YEARLY=https://checkout.cakto.com/seu-link-starter-anual
CAKTO_CHECKOUT_PRO_MONTHLY=https://checkout.cakto.com/seu-link-pro-mensal
CAKTO_CHECKOUT_PRO_YEARLY=https://checkout.cakto.com/seu-link-pro-anual
```

### **4. (Opcional) Criar Planos na Cakto**

Se a Cakto exigir, você pode criar os planos com os seguintes nomes exatos:

#### **Planos Mensais:**
- **Nome:** `SexyFlow Starter Mensal`
  - Valor: R$ 29,90
  - Intervalo: Mensal
  - ID interno: Será usado como referência

- **Nome:** `SexyFlow Pro Mensal`
  - Valor: R$ 47,00
  - Intervalo: Mensal

#### **Planos Anuais:**
- **Nome:** `SexyFlow Starter Anual`
  - Valor: R$ 299,00
  - Intervalo: Anual

- **Nome:** `SexyFlow Pro Anual`
  - Valor: R$ 470,00
  - Intervalo: Anual

### **5. Configurar Webhook**

No painel da Cakto, configure o webhook:

- **URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`
- **Método:** POST
- **Secret:** Configure o `CAKTO_WEBHOOK_SECRET` no `.env.local`

### **6. Eventos para Configurar**

Ative os seguintes eventos no webhook da Cakto:

- ✅ `payment.approved` / `payment.succeeded` - Pagamento aprovado
- ❌ `payment.failed` / `payment.declined` - Pagamento falhado
- 💸 `payment.refunded` - Reembolso
- 🚫 `subscription.cancelled` - Assinatura cancelada
- 🔄 `subscription.renewed` / `subscription.updated` - Renovação

---

## 📝 Variáveis de Ambiente

Adicione no seu `.env.local`:

```env
# Links de Checkout (OBRIGATÓRIO - cole os links que você criou na Cakto)
CAKTO_CHECKOUT_STARTER_MONTHLY=https://checkout.cakto.com/seu-link-starter-mensal
CAKTO_CHECKOUT_STARTER_YEARLY=https://checkout.cakto.com/seu-link-starter-anual
CAKTO_CHECKOUT_PRO_MONTHLY=https://checkout.cakto.com/seu-link-pro-mensal
CAKTO_CHECKOUT_PRO_YEARLY=https://checkout.cakto.com/seu-link-pro-anual

# Cakto Configuration (opcional se não usar API para criar checkouts)
CAKTO_API_KEY=sua_api_key_aqui
CAKTO_SECRET_KEY=sua_secret_key_aqui
CAKTO_WEBHOOK_SECRET=seu_webhook_secret_aqui
CAKTO_ENVIRONMENT=production # ou 'sandbox' para testes

# Base URL (para webhooks e redirects)
NEXT_PUBLIC_BASE_URL=https://sexyflow.onrender.com
```

---

## 🔧 Endpoints da API

### **Obter Link de Checkout** (`POST /api/subscriptions/create`)

Recebe:
```json
{
  "planId": "plan-starter-monthly",
  "customerData": {
    "name": "João Silva",
    "email": "joao@example.com",
    "document": "12345678901"
  }
}
```

Retorna:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.cakto.com/seu-link-configurado",
  "subscription": {
    "id": "...",
    "status": "pending"
  }
}
```

**Nota:** O sistema não cria o checkout via API, apenas retorna o link que você configurou nas variáveis de ambiente.

### **Webhook** (`POST /api/webhooks/cakto`)

Recebe eventos da Cakto e processa automaticamente:
- Ativa subscriptions quando pagamento é aprovado
- Marca como `unpaid` quando pagamento falha
- Cancela quando há reembolso ou cancelamento
- Renova quando há cobrança recorrente

---

## 📊 Formato dos Eventos (Exemplo)

A Cakto pode enviar eventos em diferentes formatos. O sistema tenta detectar automaticamente:

### **Pagamento Aprovado:**
```json
{
  "type": "payment.approved",
  "data": {
    "id": "pay_123456",
    "metadata": {
      "userId": "user_123",
      "planId": "plan-starter-monthly",
      "realPlanName": "STARTER",
      "billingCycle": "monthly"
    },
    "amount": 2990,
    "status": "paid"
  }
}
```

### **Assinatura Renovada:**
```json
{
  "type": "subscription.renewed",
  "data": {
    "id": "sub_123456",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "status": "active"
  }
}
```

---

## 🧪 Testando a Integração

### **1. Testar Criação de Checkout:**

```bash
curl -X POST https://sexyflow.onrender.com/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "planId": "plan-starter-monthly",
    "customerData": {
      "name": "Teste",
      "email": "teste@example.com",
      "document": "12345678901"
    }
  }'
```

### **2. Testar Webhook (simulação):**

```bash
curl -X POST https://sexyflow.onrender.com/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -H "x-cakto-signature: test_signature" \
  -d '{
    "type": "payment.approved",
    "data": {
      "id": "pay_test_123",
      "metadata": {
        "userId": "user_id_here",
        "planId": "plan-starter-monthly",
        "realPlanName": "STARTER",
        "billingCycle": "monthly"
      },
      "status": "paid"
    }
  }'
```

### **3. Verificar Status do Webhook:**

```bash
curl https://sexyflow.onrender.com/api/webhooks/cakto
```

---

## ⚠️ Observações Importantes

1. **Links de Checkout:** O sistema gera links dinâmicos na Cakto. Não é necessário criar links manualmente.

2. **Webhooks são Assíncronos:** O webhook pode levar alguns segundos para chegar após o pagamento. O status inicial da subscription será `pending` até o webhook confirmar.

3. **Renovações Automáticas:** Para planos recorrentes, a Cakto cobra automaticamente e envia webhook de renovação.

4. **Metadata é Essencial:** O sistema usa `metadata` no checkout para identificar o usuário e plano. Certifique-se de que a Cakto envia esse metadata nos webhooks.

5. **Ambiente Sandbox:** Use `CAKTO_ENVIRONMENT=sandbox` para testes. Os webhooks de sandbox podem ter formato diferente.

---

## 🔍 Troubleshooting

### **Webhook não está sendo recebido:**
- Verificar se a URL está correta e acessível (HTTPS obrigatório)
- Verificar logs no Render: `https://dashboard.render.com`
- Testar manualmente enviando um evento

### **Subscription não está sendo ativada:**
- Verificar se o webhook está processando corretamente
- Verificar se `metadata.userId` e `metadata.planId` estão presentes
- Verificar logs no console para erros

### **Link de checkout não funciona:**
- Verificar se os planos existem na Cakto com os nomes exatos
- Verificar se `CAKTO_API_KEY` e `CAKTO_SECRET_KEY` estão corretos
- Verificar logs da API para erros da Cakto

---

## 📞 Suporte

Se precisar de ajuda:
- **Documentação Cakto:** https://docs.cakto.com
- **Logs:** Verificar no Render Dashboard
- **Webhook Debug:** Usar `GET /api/webhooks/cakto` para ver status

---

**Última atualização:** Janeiro 2024

