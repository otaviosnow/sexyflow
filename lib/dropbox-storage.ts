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
  private dropbox?: Dropbox;
  private config: DropboxConfig;

  constructor() {
    this.config = {
      accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
      appKey: process.env.DROPBOX_APP_KEY || '',
      appSecret: process.env.DROPBOX_APP_SECRET || ''
    };

    // Inicializar Dropbox apenas se estiver configurado
    const useDropbox = process.env.USE_DROPBOX === 'true';
    const hasCredentials = !!(
      this.config.accessToken && 
      this.config.appKey && 
      this.config.appSecret
    );
    
    if (useDropbox && hasCredentials) {
    this.dropbox = new Dropbox({
      accessToken: this.config.accessToken,
      clientId: this.config.appKey,
      clientSecret: this.config.appSecret
    });
    }
  }

  /**
   * Verificar se Dropbox está configurado e ativo
   */
  isConfigured(): boolean {
    const useDropbox = process.env.USE_DROPBOX === 'true';
    const hasCredentials = !!(
      this.config.accessToken && 
      this.config.appKey && 
      this.config.appSecret
    );
    return useDropbox && hasCredentials;
  }

  /**
   * Método estático para verificar se Dropbox está disponível (sem instanciar)
   */
  static isAvailable(): boolean {
    const useDropbox = process.env.USE_DROPBOX === 'true';
    const hasCredentials = !!(
      process.env.DROPBOX_ACCESS_TOKEN && 
      process.env.DROPBOX_APP_KEY && 
      process.env.DROPBOX_APP_SECRET
    );
    return useDropbox && hasCredentials;
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
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Dropbox não está configurado. Configure as variáveis de ambiente DROPBOX_ACCESS_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET e USE_DROPBOX=true'
      };
    }

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
      const result = await this.dropbox!.filesUpload({
        path: dropboxPath,
        contents: fileBuffer,
        mode: 'overwrite' as any,
        autorename: true
      });

      // Gerar URL pública
      const shareResult = await this.dropbox!.sharingCreateSharedLinkWithSettings({
        path: dropboxPath,
        settings: {
          requested_visibility: 'public' as any,
          audience: 'public' as any
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
        error: error instanceof Error ? error.message : JSON.stringify(error)
      };
    }
  }

  /**
   * Deletar arquivo do Dropbox
   */
  async deleteFile(path: string): Promise<boolean> {
    if (!this.dropbox) {
      console.error('❌ Dropbox não está configurado');
      return false;
    }

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
    if (!this.dropbox) {
      console.error('❌ Dropbox não está configurado');
      return [];
    }

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
    if (!this.dropbox) {
      console.error('❌ Dropbox não está configurado');
      return null;
    }

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
   * Obter (ou criar) link público de um arquivo
   */
  async getPublicUrl(path: string): Promise<string | null> {
    if (!this.dropbox) {
      console.error('❌ Dropbox não está configurado');
      return null;
    }
    try {
      const shareResult = await this.dropbox.sharingCreateSharedLinkWithSettings({
        path,
        settings: { requested_visibility: 'public' as any, audience: 'public' as any }
      });
      return shareResult.result.url.replace('?dl=0', '?raw=1');
    } catch (err: any) {
      // Se já existe, listar link existente
      try {
        const list = await this.dropbox.sharingListSharedLinks({ path });
        const link = list.result.links?.[0]?.url;
        return link ? link.replace('?dl=0', '?raw=1') : null;
      } catch (e) {
        console.error('❌ Erro ao obter link público:', e);
        return null;
      }
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
    if (!this.dropbox) {
      console.error('❌ Dropbox não está configurado');
      return null;
    }

    try {
      const result = await this.dropbox.usersGetSpaceUsage();
      
      return {
        used: result.result.used,
        allocation: result.result.allocation,
    usage_percentage: (result.result.used / (result.result.allocation as any).allocated) * 100
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
    if (!this.dropbox) {
      console.error('❌ Dropbox não está configurado');
      return false;
    }

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
