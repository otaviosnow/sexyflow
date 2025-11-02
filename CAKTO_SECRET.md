# 🔐 Secret do Webhook da Cakto

## ✅ Secret Configurado

O secret do webhook da Cakto foi encontrado e está configurado:

```
6c8513c9-b645-4f9b-9a7c-e709199466b9
```

## 📝 Onde Adicionar

### **No Render (Produção):**

1. Acesse o dashboard do Render
2. Vá em **Environment** ou **Environment Variables**
3. Adicione a variável:
   - **Key:** `CAKTO_WEBHOOK_SECRET`
   - **Value:** `6c8513c9-b645-4f9b-9a7c-e709199466b9`
4. Salve e faça um novo deploy (ou o Render vai atualizar automaticamente)

### **Localmente (.env.local):**

Se estiver testando localmente, adicione no arquivo `.env.local`:

```env
CAKTO_WEBHOOK_SECRET=6c8513c9-b645-4f9b-9a7c-e709199466b9
```

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- NÃO compartilhe este secret publicamente
- NÃO commite o `.env.local` no Git (já deve estar no `.gitignore`)
- Mantenha este secret seguro

## ✅ Verificação

Após adicionar o secret:

1. O sistema irá validar a assinatura dos webhooks
2. Webhooks sem assinatura válida serão rejeitados
3. Você pode testar verificando os logs do Render

---

**Configurado em:** Janeiro 2024

