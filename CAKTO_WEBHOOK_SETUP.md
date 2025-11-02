# 🔔 Configuração de Webhooks da Cakto

## 📋 Problema: Como Identificar o Plano Comprado?

Com 4 links de checkout diferentes, precisamos que a Cakto envie informações no webhook para identificar qual plano foi comprado.

## ✅ Soluções Implementadas

### **1. Parâmetros na URL de Checkout**

O sistema adiciona automaticamente `planId` e `userId` na URL de checkout:

```
https://checkout.cakto.com/seu-link?planId=plan-starter-monthly&userId=user_123
```

### **2. Configuração de Metadata na Cakto**

Ao criar cada link de checkout na Cakto, configure campos de metadata/custom data:

#### **Opção A: Campos Customizados (Recomendado)**

Na configuração do checkout na Cakto, adicione campos customizados:

- **Campo 1:** `userId` (tipo: texto oculto)
- **Campo 2:** `planId` (tipo: texto oculto)
- **Campo 3:** `realPlanName` (tipo: texto oculto) - Ex: `STARTER` ou `PRO`
- **Campo 4:** `billingCycle` (tipo: texto oculto) - Ex: `monthly` ou `yearly`

Esses campos serão preenchidos automaticamente via URL quando o usuário clicar no checkout.

#### **Opção B: Metadata no Webhook**

Configure a Cakto para incluir metadata no webhook:

```json
{
  "type": "payment.approved",
  "data": {
    "id": "pay_123",
    "metadata": {
      "userId": "user_123",
      "planId": "plan-starter-monthly",
      "realPlanName": "STARTER",
      "billingCycle": "monthly"
    }
  }
}
```

## 🔧 Como o Sistema Processa

O webhook tenta extrair informações de **3 formas**:

1. **Metadata do evento** (`event.data.metadata`)
2. **Query parameters** (`event.data.query_params`)
3. **Campos diretos** (`event.data.userId`, `event.data.planId`)

Se não encontrar, tenta buscar uma subscription pendente pelo `paymentId`.

## 📝 Configuração Passo a Passo

### **1. Na Cakto - Ao Criar Checkout**

Para cada link de checkout (Starter Mensal, Starter Anual, Pro Mensal, Pro Anual):

1. Crie o checkout normalmente
2. Configure campos customizados:
   - `userId`: Preencher via URL query parameter `?userId={userId}`
   - `planId`: Preencher via URL query parameter `?planId={planId}`
   - `realPlanName`: Valor fixo (`STARTER` ou `PRO`)
   - `billingCycle`: Valor fixo (`monthly` ou `yearly`)

3. Configure webhook para enviar esses campos no payload

### **2. URLs de Callback**

Configure as URLs com parâmetros:

- **Sucesso:** `https://sexyflow.onrender.com/payment/success?planId={planId}&userId={userId}`
- **Webhook:** `https://sexyflow.onrender.com/api/webhooks/cakto`

### **3. Teste do Webhook**

Você pode testar manualmente:

```bash
curl -X POST https://sexyflow.onrender.com/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -H "x-cakto-signature: test" \
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

## 🔍 Troubleshooting

### **Webhook não identifica o plano:**

1. Verifique se a Cakto está enviando metadata
2. Veja os logs: `GET /api/webhooks/cakto` mostra eventos suportados
3. Verifique o formato do evento que a Cakto envia
4. Se necessário, ajuste a extração de dados em `handlePaymentApproved`

### **Subscription não é ativada:**

1. Verifique se `userId` e `planId` estão no webhook
2. Verifique logs do webhook para ver o evento completo
3. O sistema cria uma subscription se não encontrar uma pendente

## 📞 Suporte da Cakto

Se precisar de ajuda para configurar metadata nos checkouts:

- 📧 Email: suporte@cakto.com
- 📚 Documentação: https://docs.cakto.com/webhooks
- Pergunte especificamente: "Como incluir campos customizados/metadata nos webhooks?"

---

**Nota:** O sistema é flexível e tenta várias formas de extrair as informações. Se a Cakto enviar os dados de forma diferente, podemos ajustar o código para processar corretamente.

