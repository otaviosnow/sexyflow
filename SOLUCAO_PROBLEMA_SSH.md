# 🔧 Solução: Problema de "Permission denied" no SSH

## ❌ Você está vendo este erro?

```
Permission denied, please try again.
root@sexyflow.com.br: Permission denied (publickey, password).
```

## ✅ Soluções passo a passo:

### **Solução 1: Resetar a senha no painel da Hostinger**

1. **Acesse o painel da Hostinger:**
   - Vá para: https://www.hostinger.com.br
   - Faça login

2. **Encontrar sua VPS:**
   - Clique em **"VPS"** ou **"Servidores"** no menu
   - Clique no seu servidor

3. **Resetar senha SSH:**
   - Procure por **"Reset Password"** ou **"Redefinir Senha"** ou **"SSH Password"**
   - Clique nessa opção
   - Gere uma nova senha
   - **IMPORTANTE**: Copie e salve essa senha em um lugar seguro!

4. **Aguardar:**
   - Aguarde 2-3 minutos para a senha ser atualizada no servidor

5. **Tentar conectar novamente:**
   ```bash
   ssh root@72.61.216.143
   ```
   (Use o IP da sua VPS, não o domínio)

6. **Quando pedir a senha:**
   - Cole ou digite a **nova senha** que você acabou de criar
   - **Lembre-se**: A senha não aparece na tela (é normal!)
   - Pressione Enter

---

### **Solução 2: Verificar qual usuário usar**

Algumas VPS não usam `root`. Tente descobrir:

1. **No painel da Hostinger:**
   - Procure por **"SSH User"** ou **"Usuário SSH"**
   - Ou veja nas informações do servidor

2. **Usuários comuns:**
   - `root` (mais comum)
   - `admin`
   - `ubuntu` (se for Ubuntu)
   - `debian` (se for Debian)
   - O nome do seu usuário (se você criou um)

3. **Tentar com o usuário correto:**
   ```bash
   ssh USUARIO@72.61.216.143
   ```
   (Substitua USUARIO pelo usuário correto)

---

### **Solução 3: Usar Console Web da Hostinger**

Se o SSH não funcionar, use o terminal web:

1. **No painel da Hostinger:**
   - Vá em **"VPS"**
   - Clique no seu servidor
   - Procure por **"Console"** ou **"Web Terminal"** ou **"Terminal Web"**
   - Clique nessa opção

2. **Você verá um terminal no navegador:**
   - Funciona igual ao SSH
   - Faça login aqui primeiro
   - Depois você pode configurar o SSH

3. **Depois de logado no console web:**
   - Você pode resetar a senha SSH
   - Ou configurar chaves SSH

---

### **Solução 4: Verificar se a VPS está ativa**

1. **No painel da Hostinger:**
   - Verifique se a VPS está **"Running"** ou **"Ativa"**
   - Se estiver **"Stopped"** ou **"Parada"**, clique em **"Start"**

2. **Aguardar:**
   - Aguarde 2-3 minutos para a VPS iniciar completamente

---

### **Solução 5: Verificar Firewall**

1. **No painel da Hostinger:**
   - Procure por **"Firewall"** ou **"Segurança"**
   - Verifique se a porta **22** (SSH) está aberta
   - Se não estiver, adicione uma regra:
     - **Tipo**: TCP
     - **Porta**: 22
     - **Ação**: Permitir

---

## 🔍 Checklist de Verificação

Antes de desistir, verifique:

- [ ] A senha está correta? (tente resetar)
- [ ] O usuário está correto? (geralmente `root`)
- [ ] O IP está correto? (use o IP, não o domínio)
- [ ] A VPS está rodando? (verifique no painel)
- [ ] A porta 22 está aberta? (verifique firewall)
- [ ] Aguardou alguns minutos após resetar senha? (2-3 minutos)

---

## 📞 Se ainda não funcionar:

1. **Contatar suporte da Hostinger:**
   - Eles podem verificar problemas no servidor
   - Eles podem resetar tudo para você
   - Eles podem ajudar com configurações específicas

2. **Informações para o suporte:**
   - IP da VPS: `72.61.216.143`
   - Domínio: `sexyflow.com.br`
   - Erro: "Permission denied (publickey, password)"
   - O que você já tentou: Resetar senha, verificar usuário, etc.

---

## 💡 Dica: Use o IP ao invés do domínio

Quando estiver tendo problemas, sempre use o IP diretamente:

```bash
ssh root@72.61.216.143
```

Ao invés de:

```bash
ssh root@sexyflow.com.br
```

Isso evita problemas de DNS e é mais confiável.

---

**Última atualização:** 2025-01-XX

