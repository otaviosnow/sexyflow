/**
 * Dropbox Storage Integration
 * Sistema de armazenamento em nuvem com Dropbox para SexyFlow
 */

import { Dropbox } from 'dropbox';

export interface DropboxUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface DropboxConfig {
  accessToken: string;
  appKey: string;
  appSecret: string;
}

class DropboxService {
  private dropbox: Dropbox;
  private config: DropboxConfig;

  constructor() {
    this.config = {
      accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
      appKey: process.env.DROPBOX_APP_KEY || '',
      appSecret: process.env.DROPBOX_APP_SECRET || ''
    };

    // Inicializar Dropbox
    this.dropbox = new Dropbox({
      accessToken: this.config.accessToken,
      clientId: this.config.appKey,
      clientSecret: this.config.appSecret
    });
  }

  /**
   * Upload de arquivo para Dropbox
   */
  async uploadFile(
    file: File | Buffer,
    fileName: string,
    folder: string = 'sexyflow',
    userId?: string
  ): Promise<DropboxUploadResponse> {
    try {
      console.log('📤 Iniciando upload para Dropbox:', fileName);

      // Organizar por usuário
      const userFolder = userId ? `users/${userId}` : 'anonymous';
      const dropboxPath = `/${folder}/${userFolder}/${fileName}`;

      // Converter File para Buffer se necessário
      let fileBuffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else {
        fileBuffer = file;
      }

      // Upload para Dropbox
      const result = await this.dropbox.filesUpload({
        path: dropboxPath,
        contents: fileBuffer,
        mode: 'overwrite',
        autorename: true
      });

      // Gerar URL pública
      const shareResult = await this.dropbox.sharingCreateSharedLinkWithSettings({
        path: dropboxPath,
        settings: {
          requested_visibility: 'public',
          audience: 'public'
        }
      });

      const publicUrl = shareResult.result.url.replace('?dl=0', '?raw=1');

      console.log('✅ Upload concluído no Dropbox:', publicUrl);
      console.log('📁 Caminho:', dropboxPath);
      console.log('🔗 URL pública:', publicUrl);

      return {
        success: true,
        url: publicUrl,
        path: dropboxPath
      };

    } catch (error) {
      console.error('❌ Erro no upload para Dropbox:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Deletar arquivo do Dropbox
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      console.log('🗑️ Deletando arquivo do Dropbox:', path);
      
      await this.dropbox.filesDeleteV2({
        path: path
      });
      
      console.log('✅ Arquivo deletado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return false;
    }
  }

  /**
   * Obter URL otimizada para exibição
   */
  getOptimizedUrl(publicUrl: string, options: {
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}): string {
    const { width, height, format = 'jpeg' } = options;
    
    // Dropbox não suporta transformações diretas na URL
    // Retornar URL original (você pode implementar transformações no frontend)
    return publicUrl;
  }

  /**
   * Listar arquivos por pasta
   */
  async listFiles(folder: string = 'sexyflow', maxResults: number = 100) {
    try {
      const result = await this.dropbox.filesListFolder({
        path: `/${folder}`,
        limit: maxResults
      });

      return result.result.entries;
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Obter informações do arquivo
   */
  async getFileInfo(path: string) {
    try {
      const result = await this.dropbox.filesGetMetadata({
        path: path
      });

      return result.result;
    } catch (error) {
      console.error('❌ Erro ao obter informações do arquivo:', error);
      return null;
    }
  }

  /**
   * Migrar arquivos existentes do local para Dropbox
   */
  async migrateLocalFiles(): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    console.log('🔄 Iniciando migração de arquivos locais para Dropbox...');
    
    const results = {
      success: 0,
      failed: 0,
      total: 0
    };

    try {
      // Implementar lógica de migração aqui
      // 1. Listar arquivos em /public/uploads/
      // 2. Upload cada arquivo para Dropbox
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
   * Obter estatísticas de uso
   */
  async getUsageStats() {
    try {
      const result = await this.dropbox.usersGetSpaceUsage();
      
      return {
        used: result.result.used,
        allocation: result.result.allocation,
        usage_percentage: (result.result.used / result.result.allocation['.tag'] === 'individual' 
          ? result.result.allocation.allocated 
          : result.result.allocation.allocated) * 100
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Criar pasta no Dropbox
   */
  async createFolder(path: string): Promise<boolean> {
    try {
      await this.dropbox.filesCreateFolderV2({
        path: path,
        autorename: false
      });
      
      console.log('✅ Pasta criada:', path);
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar pasta:', error);
      return false;
    }
  }
}

// Instância singleton
export const dropboxService = new DropboxService();

// Funções auxiliares
export const uploadToDropbox = (file: File | Buffer, fileName: string, folder?: string, userId?: string) => 
  dropboxService.uploadFile(file, fileName, folder, userId);

export const deleteFromDropbox = (path: string) => 
  dropboxService.deleteFile(path);

export const getDropboxFileUrl = (publicUrl: string, options?: {
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp';
}) => dropboxService.getOptimizedUrl(publicUrl, options);
