# 🔗 Configuração dos Links de Checkout da Cakto

## 📋 Como Funciona

Você cria os links de checkout manualmente no painel da Cakto e configura aqui. O sistema apenas redireciona o usuário para o link correto baseado no plano escolhido.

## ⚙️ Configuração

### **Opção 1: Via Variáveis de Ambiente (Recomendado)**

Adicione no seu `.env.local`:

```env
# Links de checkout da Cakto (cole os links completos que você criou no painel)
CAKTO_CHECKOUT_STARTER_MONTHLY=https://checkout.cakto.com/seu-link-starter-mensal
CAKTO_CHECKOUT_STARTER_YEARLY=https://checkout.cakto.com/seu-link-starter-anual
CAKTO_CHECKOUT_PRO_MONTHLY=https://checkout.cakto.com/seu-link-pro-mensal
CAKTO_CHECKOUT_PRO_YEARLY=https://checkout.cakto.com/seu-link-pro-anual
```

### **Opção 2: Diretamente no Código**

Se preferir, você pode editar `lib/cakto.ts` e substituir as strings vazias:

```typescript
export const CAKTO_CHECKOUT_LINKS = {
  'plan-starter-monthly': 'https://checkout.cakto.com/seu-link-starter-mensal',
  'plan-starter-yearly': 'https://checkout.cakto.com/seu-link-starter-anual',
  'plan-pro-monthly': 'https://checkout.cakto.com/seu-link-pro-mensal',
  'plan-pro-yearly': 'https://checkout.cakto.com/seu-link-pro-anual',
};
```

## 🎯 O Que Configurar na Cakto

Ao criar os links de checkout na Cakto, configure:

1. **URL de Sucesso:** `https://sexyflow.onrender.com/payment/success`
2. **URL de Cancelamento:** `https://sexyflow.onrender.com/payment/cancel`
3. **Webhook URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`

### **Metadata Importante:**

Quando configurar o checkout na Cakto, certifique-se de que o webhook inclua informações como:
- `userId` - ID do usuário no seu sistema
- `planId` - ID do plano (ex: `plan-starter-monthly`)
- `realPlanName` - Nome do plano (`STARTER` ou `PRO`)
- `billingCycle` - Ciclo (`monthly` ou `yearly`)

A Cakto pode ter um campo de "Metadata" ou "Custom Data" onde você pode configurar isso, ou pode ser passado como query parameters na URL de sucesso.

## 🔍 Como Obter os Links

1. Acesse o painel da Cakto
2. Vá em "Checkouts" ou "Links de Pagamento"
3. Para cada plano, crie ou copie o link de checkout
4. Cole o link completo (com https://) nas variáveis de ambiente

## ✅ Testando

Após configurar:

1. Acesse `/choose-plan`
2. Escolha um plano
3. Clique em "Assinar"
4. Você deve ser redirecionado para o link da Cakto configurado

Se aparecer erro, verifique se:
- O link está completo (começa com `https://`)
- O link está acessível
- A variável de ambiente está configurada corretamente

