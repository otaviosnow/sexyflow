# 🌩️ Configuração de Armazenamento em Nuvem

## ⚠️ **IMPORTANTE: Terabox não possui API oficial**

Após pesquisa, descobrimos que o **Terabox não oferece API pública oficial**. Por isso, recomendamos usar **Cloudinary** como alternativa mais confiável.

## 🌟 **Opções Recomendadas:**

### **1. Cloudinary (RECOMENDADO) ⭐**

#### **Vantagens:**
- ✅ **API oficial** e estável
- ✅ **25GB gratuito** por mês
- ✅ **Otimização automática** de imagens
- ✅ **CDN global** para velocidade
- ✅ **Transformações** em tempo real
- ✅ **Suporte a vídeos**

#### **Como Configurar:**

1. **Criar conta gratuita:**
   - Acesse [cloudinary.com](https://cloudinary.com)
   - Clique em "Sign Up for Free"
   - Complete o cadastro

2. **Obter credenciais:**
   - No dashboard, vá em "Settings" → "API Keys"
   - Copie: `Cloud Name`, `API Key`, `API Secret`

3. **Configurar variáveis:**
   ```env
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   ```

4. **Instalar dependência:**
   ```bash
   npm install cloudinary
   ```

### **2. AWS S3 (Alternativa)**

#### **Vantagens:**
- ✅ **API oficial** da Amazon
- ✅ **5GB gratuito** no primeiro ano
- ✅ **Altamente confiável**
- ✅ **Escalabilidade** ilimitada

#### **Como Configurar:**

1. **Criar conta AWS:**
   - Acesse [aws.amazon.com](https://aws.amazon.com)
   - Crie uma conta (requer cartão de crédito)

2. **Configurar S3:**
   - Acesse AWS Console → S3
   - Crie um bucket
   - Configure permissões

3. **Instalar dependência:**
   ```bash
   npm install @aws-sdk/client-s3
   ```

### **3. Google Cloud Storage (Alternativa)**

#### **Vantagens:**
- ✅ **API oficial** do Google
- ✅ **5GB gratuito** por mês
- ✅ **Integração** com outros serviços Google

## 🚀 **Implementação com Cloudinary**

### **Código Atualizado:**

```typescript
// lib/cloudinary-storage.ts
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload de arquivo
const result = await cloudinary.uploader.upload(file, {
  folder: 'sexyflow/users/user-123',
  resource_type: 'auto',
  quality: 'auto',
  fetch_format: 'auto'
});
```

### **API Route Atualizada:**

```typescript
// app/api/upload/cloudinary/route.ts
import { cloudinaryService } from '@/lib/cloudinary-storage';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const result = await cloudinaryService.uploadFile(
    file, 
    file.name, 
    'sexyflow-images',
    userId
  );
  
  return NextResponse.json(result);
}
```

## 📊 **Comparação de Serviços:**

| Serviço | API Oficial | Gratuito | CDN | Otimização | Confiabilidade |
|---------|-------------|----------|-----|-------------|----------------|
| **Cloudinary** | ✅ | 25GB/mês | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **AWS S3** | ✅ | 5GB/ano | ✅ | ❌ | ⭐⭐⭐⭐⭐ |
| **Google Cloud** | ✅ | 5GB/mês | ✅ | ❌ | ⭐⭐⭐⭐⭐ |
| **Terabox** | ❌ | 1TB | ✅ | ❌ | ⭐⭐ |

## 🔧 **Migração de Terabox para Cloudinary**

### **1. Atualizar Dependências:**
```bash
# Remover dependência do Terabox (se instalada)
npm uninstall terabox-api

# Instalar Cloudinary
npm install cloudinary
```

### **2. Atualizar Código:**
```typescript
// Substituir imports
import { cloudinaryService } from '@/lib/cloudinary-storage';

// Atualizar chamadas de API
const result = await cloudinaryService.uploadFile(file, fileName, folder, userId);
```

### **3. Migrar Arquivos Existentes:**
```bash
# Executar script de migração
node scripts/migrate-to-cloudinary.js
```

## 🛡️ **Segurança e Boas Práticas**

### **Credenciais Seguras:**
- ✅ **Nunca commitar** credenciais no Git
- ✅ **Usar variáveis** de ambiente
- ✅ **Rotacionar** chaves periodicamente
- ✅ **Monitorar** uso da API

### **Otimização:**
- ✅ **Comprimir** imagens antes do upload
- ✅ **Usar formatos** otimizados (WebP)
- ✅ **Implementar cache** local
- ✅ **Lazy loading** de imagens

## 📈 **Monitoramento**

### **Métricas Importantes:**
- **Espaço usado** na conta
- **Bandwidth** consumido
- **Transformações** realizadas
- **Requests** por minuto

### **Alertas:**
- **Quota próxima** do limite
- **Uploads falhando**
- **Custos** inesperados
- **Performance** degradada

## 🔗 **Links Úteis**

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [AWS S3 Console](https://console.aws.amazon.com/s3/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**💡 Recomendação:** Use **Cloudinary** para máxima confiabilidade e funcionalidades avançadas!
