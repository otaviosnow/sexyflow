# 📝 Lista de Alterações Necessárias para Migração

## 🔍 Arquivos que contêm referências ao Render que precisam ser atualizados:

### 1. Arquivos de Código (já usam variáveis de ambiente - OK)

Estes arquivos **JÁ ESTÃO CORRETOS** porque usam variáveis de ambiente:
- ✅ `middleware.ts` - Usa `process.env.BASE_DOMAIN`
- ✅ `lib/cakto.ts` - Usa `process.env.NEXT_PUBLIC_BASE_URL`
- ✅ `app/api/webhooks/cakto/route.ts` - Usa `process.env.NEXT_PUBLIC_BASE_URL`
- ✅ `models/Project.ts` - Usa `process.env.BASE_DOMAIN`

### 2. Arquivos que precisam ser atualizados manualmente

#### `app/custom-domain/page.tsx`
**Linha ~277:**
```typescript
// ANTES:
<li>Configure um registro CNAME apontando www.{'{'}domínio{'}'} para sexyflow.onrender.com</li>

// DEPOIS:
<li>Configure um registro CNAME apontando www.{'{'}domínio{'}'} para seu-dominio.com.br</li>
```

**Linha ~337:**
```typescript
// ANTES:
<span className="text-gray-900 font-mono ml-2">sexyflow.onrender.com</span>

// DEPOIS:
<span className="text-gray-900 font-mono ml-2">seu-dominio.com.br</span>
```

**Linha ~340:**
```typescript
// ANTES:
onClick={() => copyToClipboard('sexyflow.onrender.com')}

// DEPOIS:
onClick={() => copyToClipboard('seu-dominio.com.br')}
```

#### `app/api/custom-domains/[id]/verify/route.ts`
**Linha ~11:**
```typescript
// ANTES:
const targetHost = process.env.BASE_DOMAIN || 'sexyflow.onrender.com';

// DEPOIS (já está OK se BASE_DOMAIN estiver configurado):
// Deixe como está, mas certifique-se de que BASE_DOMAIN está no .env.local
```

**Linha ~135:**
```typescript
// ANTES:
error: 'Verificação falhou. Verifique se configurou o registro CNAME apontando www.{seu-dominio} para sexyflow.onrender.com nas configurações DNS do seu domínio.',

// DEPOIS:
error: 'Verificação falhou. Verifique se configurou o registro CNAME apontando www.{seu-dominio} para seu-dominio.com.br nas configurações DNS do seu domínio.',
```

**Linha ~138:**
```typescript
// ANTES:
targetValue: process.env.BASE_DOMAIN || 'sexyflow.onrender.com'

// DEPOIS (já está OK):
// Deixe como está
```

#### `app/projects/create/page.tsx`
**Linha ~203:**
```typescript
// ANTES:
Escolha entre usar um subdomínio (ex: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">seunegocio.sexyflow.onrender.com</span>)

// DEPOIS:
Escolha entre usar um subdomínio (ex: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">seunegocio.seu-dominio.com.br</span>)
```

**Linha ~246:**
```typescript
// ANTES:
<p className="text-xs text-gray-500 mt-1">seunegocio.sexyflow.onrender.com</p>

// DEPOIS:
<p className="text-xs text-gray-500 mt-1">seunegocio.seu-dominio.com.br</p>
```

**Linha ~285:**
```typescript
// ANTES:
<span className="text-gray-500 text-xs">.sexyflow.onrender.com</span>

// DEPOIS:
<span className="text-gray-500 text-xs">.seu-dominio.com.br</span>
```

#### `app/projects/page.tsx`
**Linha ~351:**
```typescript
// ANTES:
{project.subdomain}.sexyflow.onrender.com

// DEPOIS:
{project.subdomain}.seu-dominio.com.br
```

#### `app/admin/users/[id]/page.tsx`
**Linha ~561:**
```typescript
// ANTES:
{project.subdomain}.sexyflow.onrender.com

// DEPOIS:
{project.subdomain}.seu-dominio.com.br
```

#### `app/api/projects/route.ts`
**Linhas ~194 e ~303:**
```typescript
// ANTES:
url: customDomain ? `https://${customDomain.domain}` : `https://${anyExistingProject.subdomain}.sexyflow.onrender.com`
projectUrl = `https://${project.subdomain}.sexyflow.onrender.com`;

// DEPOIS (melhor usar variável):
const baseDomain = process.env.BASE_DOMAIN || 'seu-dominio.com.br';
url: customDomain ? `https://${customDomain.domain}` : `https://${anyExistingProject.subdomain}.${baseDomain}`
projectUrl = `https://${project.subdomain}.${baseDomain}`;
```

#### `app/site/[subdomain]/not-found.tsx`
**Linha ~33:**
```typescript
// ANTES:
href="https://sexyflow.onrender.com"

// DEPOIS:
href={process.env.NEXT_PUBLIC_BASE_URL || 'https://seu-dominio.com.br'}
```

### 3. Arquivos de documentação (opcional atualizar)

Estes são apenas documentação, não afetam o funcionamento:
- `CAKTO_*.md` - Documentação
- `GUIA_*.md` - Documentação
- `README.md` - Documentação

---

## 🔧 Script para atualizar automaticamente (Execute na VPS)

```bash
cd /var/www/sexyflow

# Substituir todas as referências (substitua SEU-DOMINIO pelo seu domínio real)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "./node_modules/*" ! -path "./.next/*" | \
  xargs sed -i 's/sexyflow\.onrender\.com/SEU-DOMINIO.com.br/g'

# Verificar se funcionou
grep -r "sexyflow.onrender.com" . --exclude-dir=node_modules --exclude-dir=.next
```

**⚠️ IMPORTANTE:** Substitua `SEU-DOMINIO` pelo seu domínio real antes de executar!

---

## ✅ Checklist de Verificação

Após fazer as alterações, verifique:

- [ ] Não há mais referências a `sexyflow.onrender.com` nos arquivos de código
- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] `BASE_DOMAIN` está configurado no `.env.local`
- [ ] `NEXT_PUBLIC_BASE_URL` está configurado no `.env.local`
- [ ] `NEXTAUTH_URL` está configurado no `.env.local`
- [ ] DNS está apontando para o IP da VPS
- [ ] SSL está configurado e funcionando
- [ ] Dropbox OAuth redirect URI foi atualizado
- [ ] Cakto webhook URL foi atualizado

---

## 🎯 Resumo

**Total de arquivos que precisam ser atualizados:** ~7 arquivos

**Prioridade:**
1. **Alta**: `app/custom-domain/page.tsx` (usuários veem isso)
2. **Alta**: `app/api/projects/route.ts` (URLs de projetos)
3. **Média**: `app/projects/create/page.tsx` (exemplo visual)
4. **Média**: `app/projects/page.tsx` (exemplo visual)
5. **Baixa**: Arquivos de documentação (opcional)

**Tempo estimado:** 15-30 minutos para atualizar todos manualmente

