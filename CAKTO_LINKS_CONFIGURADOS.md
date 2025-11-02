# 🔗 Links de Checkout da Cakto - Configurados

## ✅ Links Configurados

Os seguintes links de checkout foram configurados no sistema:

| Plano | Link | Valor |
|-------|------|-------|
| **Starter Mensal** | `https://pay.cakto.com.br/wceycj4` | R$ 29,90 |
| **Starter Anual** | `https://pay.cakto.com.br/34h9um7` | R$ 299,00 |
| **Pro Mensal** | `https://pay.cakto.com.br/3c62vfj` | R$ 47,00 |
| **Pro Anual** | `https://pay.cakto.com.br/366psux` | R$ 470,00 |

## 📋 Configuração Atual

Os links estão configurados diretamente no código em `lib/cakto.ts`. 

### Opção 1: Usar links do código (atual)

Os links já estão hardcoded no código, então funcionam imediatamente.

### Opção 2: Usar variáveis de ambiente (recomendado para produção)

Se preferir usar variáveis de ambiente (para facilitar mudanças sem deploy), adicione no `.env.local`:

```env
CAKTO_CHECKOUT_STARTER_MONTHLY=https://pay.cakto.com.br/wceycj4
CAKTO_CHECKOUT_STARTER_YEARLY=https://pay.cakto.com.br/34h9um7
CAKTO_CHECKOUT_PRO_MONTHLY=https://pay.cakto.com.br/3c62vfj
CAKTO_CHECKOUT_PRO_YEARLY=https://pay.cakto.com.br/366psux
```

Quando as variáveis de ambiente estiverem configuradas, elas terão prioridade sobre os valores hardcoded.

## ⚠️ Importante

**Certifique-se de que os valores nos checkouts da Cakto estão EXATAMENTE como abaixo:**

- Starter Mensal: **R$ 29,90** (29.90)
- Starter Anual: **R$ 299,00** (299.00 ou 299)
- Pro Mensal: **R$ 47,00** (47.00 ou 47)
- Pro Anual: **R$ 470,00** (470.00 ou 470)

Se os valores forem diferentes, o sistema não conseguirá identificar o plano no webhook!

## 🔍 Verificação

Você pode verificar se os links estão corretos acessando:
- Starter Mensal: https://pay.cakto.com.br/wceycj4
- Starter Anual: https://pay.cakto.com.br/34h9um7
- Pro Mensal: https://pay.cakto.com.br/3c62vfj
- Pro Anual: https://pay.cakto.com.br/366psux

---

**Configurado em:** Janeiro 2024

