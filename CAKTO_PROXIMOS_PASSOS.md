# ✅ Próximos Passos - Integração Cakto

## 📋 Checklist de Implementação

### **1. Verificar Valores nos Checkouts da Cakto** ⚠️ **CRÍTICO**

Acesse cada link e verifique se os valores estão **exatamente** como abaixo:

| Link | Valor Esperado | Verificação |
|------|----------------|-------------|
| [Starter Mensal](https://pay.cakto.com.br/wceycj4) | **R$ 29,90** | ✅ Verificar se mostra R$ 29,90 |
| [Starter Anual](https://pay.cakto.com.br/34h9um7) | **R$ 299,00** | ✅ Verificar se mostra R$ 299,00 |
| [Pro Mensal](https://pay.cakto.com.br/3c62vfj) | **R$ 47,00** | ✅ Verificar se mostra R$ 47,00 |
| [Pro Anual](https://pay.cakto.com.br/366psux) | **R$ 470,00** | ✅ Verificar se mostra R$ 470,00 |

**⚠️ IMPORTANTE:** Se algum valor estiver diferente, o sistema não conseguirá identificar o plano no webhook!

Se precisar ajustar valores, edite no painel da Cakto e atualize aqui também.

---

### **2. Configurar Webhook na Cakto** 🔔

1. **Acesse o painel da Cakto**
2. **Vá em "Integrações" → "Webhooks"**
3. **Clique em "Adicionar" ou "Criar Webhook"**
4. **Configure:**

   - **Nome:** SexyFlow Webhooks
   - **URL:** `https://sexyflow.onrender.com/api/webhooks/cakto`
   - **Eventos para ativar:**
     - ✅ **Compra aprovada** (`purchase_approved`) - OBRIGATÓRIO
     - ✅ **Compra recusada** (`purchase_refused`) - OBRIGATÓRIO
     - ✅ **Assinatura cancelada** (`subscription_canceled`) - OBRIGATÓRIO
     - ✅ **Assinatura renovada** (`subscription_renewed`) - OBRIGATÓRIO
     - ✅ **Reembolso** (`refund`) - OBRIGATÓRIO
     - ✅ **Chargeback** (`chargeback`) - RECOMENDADO
     - ⬜ **Assinatura criada** (`subscription_created`) - OPIONAL (geralmente já coberto por `purchase_approved`)
     - ⬜ **Pix gerado, Boleto gerado, etc** - OPIONAL (não usados no sistema)

5. **Salve o webhook**

---

#### **📝 Onde encontrar o Secret?**

Após salvar o webhook, o secret geralmente aparece em um destes lugares:

**Opção 1: Na lista de webhooks**
- Após criar, volte para a lista de webhooks
- Cada webhook deve mostrar o secret (pode ter um botão "Mostrar" ou "Copiar")

**Opção 2: Nos detalhes do webhook**
- Clique no webhook criado para ver os detalhes
- O secret deve estar visível ou com um botão para revelar

**Opção 3: Na configuração inicial**
- Algumas vezes o secret é mostrado logo após criar (anote antes de fechar!)

**Opção 4: Se não encontrar**
- O secret geralmente vem no campo `secret` dos webhooks que a Cakto envia
- Você pode testar primeiro sem o secret e verificar nos logs qual secret a Cakto está enviando
- Ou entre em contato com o suporte da Cakto para obter o secret

**Formato do secret:**
- Geralmente é um UUID como: `8402b43f-c839-4090-bbd1-186725d185c7`
- Ou uma string alfanumérica

**⚠️ IMPORTANTE:** 
- Se você não configurar o `CAKTO_WEBHOOK_SECRET`, o sistema ainda funcionará, mas não verificará a assinatura do webhook (menos seguro)
- Para produção, é recomendado configurar o secret para validar que os webhooks realmente vêm da Cakto

---

### **3. Configurar Variáveis de Ambiente** 🔐

Adicione no arquivo `.env.local` (ou nas variáveis de ambiente do Render):

```env
# Links de Checkout (opcional - já estão no código, mas podem ser sobrescritos)
CAKTO_CHECKOUT_STARTER_MONTHLY=https://pay.cakto.com.br/wceycj4
CAKTO_CHECKOUT_STARTER_YEARLY=https://pay.cakto.com.br/34h9um7
CAKTO_CHECKOUT_PRO_MONTHLY=https://pay.cakto.com.br/3c62vfj
CAKTO_CHECKOUT_PRO_YEARLY=https://pay.cakto.com.br/366psux

# Webhook Secret (OBRIGATÓRIO - Secret configurado na Cakto)
CAKTO_WEBHOOK_SECRET=6c8513c9-b645-4f9b-9a7c-e709199466b9

# Base URL (para webhooks e redirects)
NEXT_PUBLIC_BASE_URL=https://sexyflow.onrender.com
```

**✅ Secret encontrado e configurado:** `6c8513c9-b645-4f9b-9a7c-e709199466b9`

**⚠️ IMPORTANTE:** 
- Se você não configurar o `CAKTO_WEBHOOK_SECRET`, o sistema não verificará a assinatura do webhook (pode ser inseguro)
- No Render, adicione essas variáveis nas configurações do serviço

---

### **4. Configurar URLs de Callback nos Checkouts** 🔗

Para cada checkout na Cakto, configure as URLs de retorno:

1. **Acesse cada checkout no painel da Cakto**
2. **Configure:**

   - **URL de Sucesso:** `https://sexyflow.onrender.com/payment/success`
   - **URL de Cancelamento:** `https://sexyflow.onrender.com/payment/cancel`
   - **Webhook URL:** `https://sexyflow.onrender.com/api/webhooks/cakto` (já configurado acima)

3. **Salve as configurações**

---

### **5. Testar a Integração** 🧪

#### **A. Testar Criação de Checkout**

1. Acesse `/choose-plan` no seu site
2. Escolha um plano (ex: Starter Mensal)
3. Clique em "Assinar"
4. **Deve redirecionar para:** `https://pay.cakto.com.br/wceycj4`

#### **B. Testar Webhook Manualmente**

Use este comando para simular um webhook:

```bash
curl -X POST https://sexyflow.onrender.com/api/webhooks/cakto \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "seu-secret-aqui",
    "event": "purchase_approved",
    "data": {
      "id": "test_payment_123",
      "customer": {
        "email": "seu-email@teste.com",
        "name": "Teste"
      },
      "offer": {
        "price": 29.90,
        "name": "Starter Mensal"
      },
      "subscription": {
        "id": "test_sub_123",
        "status": "active",
        "amount": "29.90",
        "recurrence_period": 30,
        "next_payment_date": "2025-02-15T00:00:00-03:00"
      },
      "status": "paid",
      "amount": 29.90
    }
  }'
```

**Substitua:**
- `"seu-secret-aqui"` pelo secret configurado
- `"seu-email@teste.com"` por um email de usuário existente no sistema

#### **C. Verificar Logs**

Acesse os logs do Render para ver:
- ✅ Se o webhook chegou
- ✅ Se o plano foi identificado
- ✅ Se o usuário foi encontrado
- ✅ Se a subscription foi criada/ativada

---

### **6. Fazer Teste Real (Sandbox)** 💳

1. **Use cartão de teste da Cakto** (se tiver ambiente sandbox)
2. **Faça um pagamento de teste**
3. **Verifique:**
   - ✅ Se o webhook chegou
   - ✅ Se a subscription foi criada no banco
   - ✅ Se o usuário foi atualizado com o plano
   - ✅ Se aparece em `/my-plan`

---

### **7. Verificar Funcionamento** ✅

Depois de um pagamento real, verifique:

1. **Banco de dados:**
   - Subscription criada com status `active`
   - `planId` correto
   - `realPlanName` e `billingCycle` corretos

2. **Interface:**
   - Usuário vê o plano em `/my-plan`
   - Funcionalidades do plano estão liberadas

3. **Logs:**
   - Sem erros nos webhooks
   - Webhooks sendo processados com sucesso

---

## 🔍 Troubleshooting

### **Webhook não está chegando:**

1. ✅ Verifique se a URL está correta e acessível
2. ✅ Verifique se o webhook está ativado na Cakto
3. ✅ Verifique os logs do Render
4. ✅ Teste manualmente com `curl`

### **Plano não está sendo identificado:**

1. ✅ Verifique os valores nos checkouts (devem ser exatos)
2. ✅ Veja os logs do webhook - mostrará qual valor chegou
3. ✅ Ajuste o mapeamento em `lib/cakto.ts` se necessário

### **Usuário não encontrado:**

1. ✅ Verifique se o email no webhook corresponde ao email cadastrado
2. ✅ O email deve ser exatamente igual (case-sensitive)
3. ✅ Verifique se o usuário existe no banco

### **Subscription não está sendo criada:**

1. ✅ Verifique logs para erros
2. ✅ Verifique se o banco está conectado
3. ✅ Veja se há validações bloqueando

---

## 📞 Próximos Passos Após Configuração

1. **Monitorar webhooks:** Verifique logs regularmente
2. **Testar renovações:** Aguarde uma renovação automática
3. **Testar cancelamentos:** Cancele uma assinatura e veja se funciona
4. **Monitorar erros:** Configure alertas se possível

---

## ✅ Checklist Final

- [ ] Valores dos checkouts verificados e corretos
- [ ] Webhook configurado na Cakto
- [ ] URLs de callback configuradas nos checkouts
- [ ] Variáveis de ambiente configuradas
- [ ] Teste manual do webhook realizado
- [ ] Teste real (sandbox) realizado
- [ ] Verificação no banco de dados feita
- [ ] Interface testada

---

**Última atualização:** Janeiro 2024

