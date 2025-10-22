/**
 * Cloudinary Storage Integration
 * Sistema de armazenamento em nuvem confiável para imagens e vídeos
 */

import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResponse {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

class CloudinaryService {
  private config: CloudinaryConfig;

  constructor() {
    this.config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || ''
    };

    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: this.config.cloud_name,
      api_key: this.config.api_key,
      api_secret: this.config.api_secret
    });
  }

  /**
   * Upload de arquivo para Cloudinary
   */
  async uploadFile(
    file: File | Buffer,
    fileName: string,
    folder: string = 'sexyflow',
    userId?: string
  ): Promise<CloudinaryUploadResponse> {
    try {
      console.log('📤 Iniciando upload para Cloudinary:', fileName);

      // Organizar por usuário
      const userFolder = userId ? `users/${userId}` : 'anonymous';
      const finalFolder = `${folder}/${userFolder}`;

      // Configurações de upload
      const uploadOptions = {
        folder: finalFolder,
        resource_type: 'auto' as const, // Detecta automaticamente se é imagem ou vídeo
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      };

      // Upload para Cloudinary
      const result = await cloudinary.uploader.upload(
        file instanceof File ? file : Buffer.from(file),
        uploadOptions
      );

      console.log('✅ Upload concluído no Cloudinary:', result.secure_url);
      console.log('📁 Pasta:', finalFolder);
      console.log('🆔 Public ID:', result.public_id);

      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id
      };

    } catch (error) {
      console.error('❌ Erro no upload para Cloudinary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Deletar arquivo do Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deletando arquivo do Cloudinary:', publicId);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log('✅ Arquivo deletado com sucesso');
        return true;
      } else {
        console.error('❌ Erro ao deletar arquivo:', result.result);
        return false;
      }

    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return false;
    }
  }

  /**
   * Obter URL otimizada para exibição
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'auto';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}): string {
    const { 
      width, 
      height, 
      quality = 'auto', 
      format = 'auto',
      crop = 'fill'
    } = options;
    
    // Construir URL com transformações
    let url = `https://res.cloudinary.com/${this.config.cloud_name}/image/upload/`;
    
    // Adicionar transformações
    const transformations = [];
    if (width || height) {
      transformations.push(`${crop}_${width || 'auto'},${height || 'auto'}`);
    }
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    
    if (transformations.length > 0) {
      url += transformations.join(',') + '/';
    }
    
    url += publicId;
    
    return url;
  }

  /**
   * Migrar arquivos existentes do local para Cloudinary
   */
  async migrateLocalFiles(): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    console.log('🔄 Iniciando migração de arquivos locais para Cloudinary...');
    
    const results = {
      success: 0,
      failed: 0,
      total: 0
    };

    try {
      // Implementar lógica de migração aqui
      // 1. Listar arquivos em /public/uploads/
      // 2. Upload cada arquivo para Cloudinary
      // 3. Atualizar referências no banco de dados
      // 4. Deletar arquivos locais após confirmação

      console.log('✅ Migração concluída:', results);
      return results;

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return results;
    }
  }

  /**
   * Listar arquivos por pasta
   */
  async listFiles(folder: string, maxResults: number = 100) {
    try {
      const result = await cloudinary.search
        .expression(`folder:${folder}`)
        .max_results(maxResults)
        .execute();

      return result.resources;
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de uso
   */
  async getUsageStats() {
    try {
      const result = await cloudinary.api.usage();
      return {
        plan: result.plan,
        objects: result.objects,
        bandwidth: result.bandwidth,
        storage: result.storage,
        requests: result.requests
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }
}

// Instância singleton
export const cloudinaryService = new CloudinaryService();

// Funções auxiliares
export const uploadToCloudinary = (file: File | Buffer, fileName: string, folder?: string, userId?: string) => 
  cloudinaryService.uploadFile(file, fileName, folder, userId);

export const deleteFromCloudinary = (publicId: string) => 
  cloudinaryService.deleteFile(publicId);

export const getOptimizedImageUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
}) => cloudinaryService.getOptimizedUrl(publicId, options);
