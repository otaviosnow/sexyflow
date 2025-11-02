# 🔗 Integração Cakto - Versão Simplificada (Apenas Webhooks)

## 📋 Como Funciona

A integração agora funciona **100% via webhooks**, sem necessidade de metadata customizada. O sistema identifica o plano comprado através de:

1. **Valor do pagamento** (mais confiável)
2. **Nome do produto/checkout**
3. **ID do checkout** (opcional, para mapeamento manual)

---

## 🎯 Mapeamento de Planos

O sistema identifica o plano pelo **valor do pagamento** que a Cakto envia no webhook:

| Valor (R$) | Valor (centavos) | PlanId |
|-----------|------------------|--------|
| R$ 29,90  | 2990             | `plan-starter-monthly` |
| R$ 299,00 | 29900            | `plan-starter-yearly` |
| R$ 47,00  | 4700             | `plan-pro-monthly` |
| R$ 470,00 | 47000            | `plan-pro-yearly` |

**⚠️ IMPORTANTE:** Os valores nos checkouts da Cakto devem ser **exatamente** estes valores (em reais), senão o sistema não conseguirá identificar o plano.

---

## ⚙️ Configuração na Cakto

### **1. Criar 4 Links de Checkout**

Crie um link de checkout para cada plano:

#### **Starter Mensal:**
- Nome: `SexyFlow Starter Mensal` (ou qualquer nome que contenha "starter mensal")
- Valor: **R$ 29,90** (exatamente este valor)
- Intervalo: Mensal (se for assinatura recorrente)

#### **Starter Anual:**
- Nome: `SexyFlow Starter Anual` (ou qualquer nome que contenha "starter anual")
- Valor: **R$ 299,00** (exatamente este valor)
- Intervalo: Anual

#### **Pro Mensal:**
- Nome: `SexyFlow Pro Mensal` (ou qualquer nome que contenha "pro mensal")
- Valor: **R$ 47,00** (exatamente este valor)
- Intervalo: Mensal

#### **Pro Anual:**
- Nome: `SexyFlow Pro Anual` (ou qualquer nome que contenha "pro anual")
- Valor: **R$ 470,00** (exatamente este valor)
- Intervalo: Anual

### **2. Configurar URLs de Callback**

Para cada checkout, configure:

- **URL de Sucesso:** `https://sexyflow.onrender.com/payment/success`
- **URL de Cancelamento:** `https://sexyflow.onrender.com/payment/cancel`
- **Webhook URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`

### **3. Configurar Webhook na Cakto**

No painel da Cakto, configure o webhook:

- **URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`
- **Método:** POST
- **Eventos:** Ative todos os eventos de pagamento e assinatura:
  - `payment.approved` / `payment.succeeded`
  - `payment.failed`
  - `payment.refunded`
  - `subscription.created`
  - `subscription.cancelled`
  - `subscription.renewed`

### **4. Adicionar Links nas Variáveis de Ambiente**

Após criar os 4 links, adicione no `.env.local`:

```env
CAKTO_CHECKOUT_STARTER_MONTHLY=https://checkout.cakto.com/seu-link-starter-mensal
CAKTO_CHECKOUT_STARTER_YEARLY=https://checkout.cakto.com/seu-link-starter-anual
CAKTO_CHECKOUT_PRO_MONTHLY=https://checkout.cakto.com/seu-link-pro-mensal
CAKTO_CHECKOUT_PRO_YEARLY=https://checkout.cakto.com/seu-link-pro-anual

CAKTO_WEBHOOK_SECRET=seu_webhook_secret_aqui
NEXT_PUBLIC_BASE_URL=https://sexyflow.onrender.com
```

---

## 🔍 Como o Sistema Identifica o Plano

### **Método 1: Valor do Pagamento (Principal)**

Quando a Cakto envia o webhook, o sistema verifica o valor:

```javascript
// Se o webhook enviar { amount: 2990 } -> identifica como plan-starter-monthly
// Se o webhook enviar { amount: 47000 } -> identifica como plan-pro-yearly
```

### **Método 2: Nome do Produto (Fallback)**

Se o valor não estiver mapeado, tenta identificar pelo nome:

- Nome contém "starter mensal" → `plan-starter-monthly`
- Nome contém "starter anual" → `plan-starter-yearly`
- Nome contém "pro mensal" → `plan-pro-monthly`
- Nome contém "pro anual" → `plan-pro-yearly`

### **Método 3: ID do Checkout (Opcional)**

Se você souber o ID único de cada checkout na Cakto, pode adicionar um mapeamento em `lib/cakto.ts`:

```typescript
const checkoutToPlan: Record<string, string> = {
  'checkout_id_starter_mensal': 'plan-starter-monthly',
  'checkout_id_starter_anual': 'plan-starter-yearly',
  'checkout_id_pro_mensal': 'plan-pro-monthly',
  'checkout_id_pro_anual': 'plan-pro-yearly',
};
```

---

## 📊 Formato Esperado do Webhook

O sistema processa webhooks no seguinte formato:

```json
{
  "type": "payment.approved",
  "data": {
    "id": "pay_123456",
    "amount": 2990,
    "customer_email": "usuario@example.com",
    "customer_id": "cus_123",
    "product_name": "SexyFlow Starter Mensal",
    "status": "paid"
  }
}
```

**Campos importantes:**
- `amount`: Valor em centavos (2990 = R$ 29,90)
- `customer_email`: Email do usuário (usado para buscar o usuário)
- `id` ou `payment_id`: ID do pagamento

---

## 🧪 Testando a Integração

### **1. Testar Identificação de Plano**

Você pode testar localmente modificando `lib/cakto.ts` temporariamente:

```typescript
// Adicione um console.log para ver o que está chegando
console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2));
```

### **2. Testar Webhook Manualmente**

```bash
curl -X POST https://sexyflow.onrender.com/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -H "x-cakto-signature: test" \
  -d '{
    "type": "payment.approved",
    "data": {
      "id": "pay_test_123",
      "amount": 2990,
      "customer_email": "usuario@teste.com",
      "product_name": "SexyFlow Starter Mensal",
      "status": "paid"
    }
  }'
```

### **3. Verificar Logs**

Acesse os logs do Render para ver:
- Se o plano foi identificado corretamente
- Se o usuário foi encontrado
- Se a subscription foi criada/ativada

---

## ⚠️ Troubleshooting

### **Plano não identificado:**

1. Verifique se o valor no checkout da Cakto está **exatamente** igual:
   - R$ 29,90 = 2990 centavos
   - R$ 299,00 = 29900 centavos
   - R$ 47,00 = 4700 centavos
   - R$ 470,00 = 47000 centavos

2. Verifique os logs para ver qual valor está chegando no webhook

3. Se necessário, adicione um mapeamento manual no código

### **Usuário não encontrado:**

1. Verifique se o email no webhook corresponde ao email do usuário cadastrado
2. A Cakto deve enviar o `customer_email` no webhook
3. O email deve ser exatamente igual (case-sensitive)

### **Subscription não criada:**

1. Verifique os logs do webhook
2. Veja se há erros no console
3. Verifique se o banco de dados está conectado

---

## 📝 Próximos Passos

1. **Criar os 4 checkouts na Cakto** com os valores exatos
2. **Configurar o webhook** apontando para `/api/webhooks/cakto`
3. **Adicionar os links** nas variáveis de ambiente
4. **Testar** fazendo um pagamento de teste
5. **Verificar logs** para confirmar que está funcionando

---

**Última atualização:** Janeiro 2024

