# 🔐 Variáveis de Ambiente no Render - Cakto

## ✅ Variáveis OBRIGATÓRIAS

### **1. CAKTO_WEBHOOK_SECRET** ✅ **OBRIGATÓRIO**

```
CAKTO_WEBHOOK_SECRET=6c8513c9-b645-4f9b-9a7c-e709199466b9
```

**O que faz:** Valida que os webhooks realmente vêm da Cakto (segurança)

**Onde adicionar:** Render → Environment Variables

---

## ⬜ Variáveis OPCIONAIS

### **2. NEXT_PUBLIC_BASE_URL** ⬜ Opcional (tem fallback)

```
NEXT_PUBLIC_BASE_URL=https://sexyflow.onrender.com
```

**O que faz:** Usado para construir URLs de retorno e webhook

**Status:** Tem valor padrão (`https://sexyflow.onrender.com`), então não é obrigatório

**Recomendação:** Se sua URL já está como padrão, pode deixar sem essa variável

---

### **3. CAKTO_CHECKOUT_*** ⬜ Opcional (já estão no código)

```
CAKTO_CHECKOUT_STARTER_MONTHLY=https://pay.cakto.com.br/wceycj4
CAKTO_CHECKOUT_STARTER_YEARLY=https://pay.cakto.com.br/34h9um7
CAKTO_CHECKOUT_PRO_MONTHLY=https://pay.cakto.com.br/3c62vfj
CAKTO_CHECKOUT_PRO_YEARLY=https://pay.cakto.com.br/366psux
```

**O que faz:** Links de checkout (caso queira sobrescrever os do código)

**Status:** Os links já estão hardcoded no código, então não precisa adicionar

**Quando adicionar:** Apenas se quiser mudar os links sem fazer deploy

---

### **4. CAKTO_API_KEY, CAKTO_SECRET_KEY** ⬜ Não necessários

**O que faz:** Usados para criar checkouts via API

**Status:** Não são necessários, pois você está usando links de checkout manuais

**Quando adicionar:** Apenas se quiser criar checkouts dinamicamente via API (não é o caso atual)

---

## 📋 Resumo

### **Para funcionar, você só precisa de:**

✅ **1 variável:**
```
CAKTO_WEBHOOK_SECRET=6c8513c9-b645-4f9b-9a7c-e709199466b9
```

### **Opcional (mas recomendado):**

⬜ `NEXT_PUBLIC_BASE_URL` - Se sua URL for diferente de `https://sexyflow.onrender.com`

---

## ✅ Checklist Final

No Render, adicione **apenas**:

- [ ] `CAKTO_WEBHOOK_SECRET` = `6c8513c9-b645-4f9b-9a7c-e709199466b9`

**Pronto!** Com essa única variável, a integração está completa.

---

**Última atualização:** Janeiro 2024

