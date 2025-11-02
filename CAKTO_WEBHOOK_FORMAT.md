# 📋 Formato Real dos Webhooks da Cakto

## 🎯 Eventos Suportados

Com base na documentação real da Cakto, estes são os eventos que o sistema processa:

| Evento (Cakto) | Valor no JSON | Descrição |
|---------------|---------------|-----------|
| `purchase_approved` | `"purchase_approved"` | Compra/pagamento aprovado |
| `purchase_refused` | `"purchase_refused"` | Compra/pagamento recusado |
| `subscription_canceled` | `"subscription_canceled"` | Assinatura cancelada |
| `subscription_renewed` | `"subscription_renewed"` | Assinatura renovada |
| `refund` | `"refund"` | Reembolso processado |
| `chargeback` | `"chargeback"` | Chargeback |

**Nota:** O sistema também aceita formatos alternativos para retrocompatibilidade.

---

## 📊 Estrutura do Webhook

Todos os webhooks seguem este formato base:

```json
{
  "secret": "seu-webhook-secret",
  "event": "nome_do_evento",
  "data": {
    // Dados específicos do evento
  }
}
```

---

## ✅ Evento: purchase_approved (Compra Aprovada)

### Quando é enviado:
- Primeira compra de uma assinatura
- Renovação de assinatura paga com sucesso

### Estrutura completa:

```json
{
  "secret": "8402b43f-c839-4090-bbd1-186725d185c7",
  "event": "purchase_approved",
  "data": {
    "id": "1f1c81d2-088a-412d-8bb7-3d5269d64f58",
    "refId": "6HngVo6",
    "customer": {
      "name": "Tulio sabino",
      "email": "tokipi8246@gamebcs.com",
      "phone": "5534991462388",
      "docNumber": "59089477098"
    },
    "offer": {
      "id": "jbwjmis",
      "name": "Subscription [Stg]",
      "price": 5
    },
    "product": {
      "name": "Subscription [Stg]",
      "id": "f947c21c-d8f0-41a1-a0a6-fede9f27b3b7",
      "type": "subscription"
    },
    "subscription": {
      "id": "d464132a-fcfa-4693-a6aa-a99483f06740",
      "status": "active",
      "amount": "5.00",
      "recurrence_period": 2,
      "next_payment_date": "2025-04-08T14:43:39.724743-03:00"
    },
    "status": "paid",
    "amount": 5,
    "baseAmount": 5,
    "paidAt": "2025-04-08T14:43:43.575271-03:00"
  }
}
```

### Como o sistema identifica o plano:

1. **Por valor** (`data.offer.price` ou `data.subscription.amount`):
   - R$ 29,90 → `plan-starter-monthly`
   - R$ 299,00 → `plan-starter-yearly`
   - R$ 47,00 → `plan-pro-monthly`
   - R$ 470,00 → `plan-pro-yearly`

2. **Por nome** (`data.offer.name` ou `data.product.name`):
   - Se contém "starter mensal" → `plan-starter-monthly`
   - Se contém "starter anual" → `plan-starter-yearly`
   - Se contém "pro mensal" → `plan-pro-monthly`
   - Se contém "pro anual" → `plan-pro-yearly`

### Como o sistema identifica o usuário:

- **Pelo email**: `data.customer.email`
- O sistema busca o usuário no banco pelo email exato

---

## 🚫 Evento: subscription_canceled (Assinatura Cancelada)

### Estrutura:

```json
{
  "secret": "76a41004-31bb-4d99-a7d2-6f1a24ecfe3f",
  "event": "subscription_canceled",
  "data": {
    "id": "2a348a25-2c26-4c1e-a905-436d52f8e29e",
    "customer": {
      "email": "teste@gmail.com"
    },
    "subscription": {
      "id": "21401964-7dd5-4f24-a5d1-22ce473968c7",
      "status": "canceled",
      "canceledAt": "2025-05-15T16:19:33.336005-03:00"
    }
  }
}
```

### O que o sistema faz:

1. Busca subscription pelo `data.subscription.id`
2. Se não encontrar, busca pelo email do usuário
3. Marca subscription como `canceled`
4. Salva `canceledAt`

---

## 🔄 Evento: subscription_renewed (Renovação)

### Estrutura:

```json
{
  "secret": "9000e9a0-341c-4755-8a91-c93da53a00e3",
  "event": "subscription_renewed",
  "data": {
    "id": "da74a88a-418a-4417-bf41-8a7c27ac008a",
    "customer": {
      "email": "eeeeeeeee@mobilesm.com"
    },
    "subscription": {
      "id": "398573e9-59de-41eb-b02c-620c2863f9f2",
      "status": "active",
      "amount": "21.31",
      "recurrence_period": 30,
      "next_payment_date": "2025-04-22T16:09:04.032882-03:00"
    }
  }
}
```

### O que o sistema faz:

1. Busca subscription pelo `data.subscription.id`
2. Atualiza `currentPeriodEnd` baseado em `next_payment_date` ou `recurrence_period`
3. Atualiza status para `active`
4. Atualiza `planEndDate` do usuário

---

## 💸 Evento: refund (Reembolso)

### Estrutura:

Similar ao `purchase_approved`, mas com:
- `event`: `"refund"`
- `data.refundedAt`: data do reembolso

### O que o sistema faz:

1. Busca subscription pelo `subscription.id` ou email
2. Marca como `canceled`
3. Salva `canceledAt`

---

## ⚠️ Evento: purchase_refused (Compra Recusada)

### Estrutura:

Similar ao `purchase_approved`, mas com:
- `event`: `"purchase_refused"`
- `status`: `"refused"`

### O que o sistema faz:

1. Busca subscription pelo `subscription.id` ou email
2. Marca como `unpaid`

---

## 🔐 Verificação de Segurança

O webhook verifica o `secret` enviado:

```typescript
// Verificar se o secret no webhook corresponde ao configurado
const webhookSecret = event.secret;
if (webhookSecret !== CAKTO_WEBHOOK_SECRET) {
  // Rejeitar webhook inválido
}
```

**Importante:** Configure `CAKTO_WEBHOOK_SECRET` no `.env.local` com o secret que você configurou na Cakto.

---

## 📝 Notas Importantes

1. **Valores em REAIS**: A Cakto envia valores em reais (29.90, 299.00), não centavos
2. **Email é obrigatório**: O sistema precisa do `customer.email` para identificar o usuário
3. **IDs da Cakto**: O sistema salva `subscription.id` da Cakto em `stripeSubscriptionId` para referência futura
4. **Períodos**: Para renovações, o sistema usa `next_payment_date` ou `recurrence_period` (em dias)

---

## 🧪 Testando

### Testar evento de compra aprovada:

```bash
curl -X POST https://sexyflow.onrender.com/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "seu-secret",
    "event": "purchase_approved",
    "data": {
      "id": "test_123",
      "customer": {
        "email": "usuario@teste.com"
      },
      "offer": {
        "price": 29.90,
        "name": "Starter Mensal"
      },
      "subscription": {
        "id": "sub_123",
        "status": "active",
        "amount": "29.90"
      },
      "status": "paid"
    }
  }'
```

---

**Última atualização:** Janeiro 2024

