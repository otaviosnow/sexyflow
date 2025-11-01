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
  refreshToken?: string;
}

class DropboxService {
  private dropbox?: Dropbox;
  private config: DropboxConfig;

  constructor() {
    this.config = {
      accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
      appKey: process.env.DROPBOX_APP_KEY || '',
      appSecret: process.env.DROPBOX_APP_SECRET || '',
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN || ''
    };

    // Inicializar Dropbox apenas se estiver configurado
    const useDropbox = process.env.USE_DROPBOX === 'true';
    const hasCredentials = !!(
      (this.config.accessToken || this.config.refreshToken) &&
      this.config.appKey && 
      this.config.appSecret
    );
    
    if (useDropbox && hasCredentials) {
      const fetchImpl: any = (globalThis as any).fetch;
      // Usar access_token se disponível, senão inicializar sem token (será renovado quando necessário)
      this.dropbox = new Dropbox({
        accessToken: this.config.accessToken || undefined,
        clientId: this.config.appKey,
        clientSecret: this.config.appSecret,
        fetch: fetchImpl
      } as any);
    }
  }

  /**
   * Garantir que temos um access_token válido (renova se necessário)
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.dropbox) return;
    
    // Se não temos access_token mas temos refresh_token, renova
    if (!this.config.accessToken && this.config.refreshToken) {
      await this.renewToken();
    }
  }

  /**
   * Renovar access_token e atualizar instância do Dropbox
   */
  private async renewToken(): Promise<boolean> {
    const newToken = await this.refreshAccessToken();
    if (newToken && this.dropbox) {
      // Recriar instância do Dropbox com novo token
      const fetchImpl: any = (globalThis as any).fetch;
      this.dropbox = new Dropbox({
        accessToken: newToken,
        clientId: this.config.appKey,
        clientSecret: this.config.appSecret,
        fetch: fetchImpl
      } as any);
      return true;
    }
    return false;
  }

  /**
   * Verificar se erro é de autenticação e tentar renovar token
   */
  private async handleAuthError(error: any): Promise<boolean> {
    // Verificar se é erro de autenticação (401, 403, ou invalid_access_token)
    const isAuthError = 
      error?.status === 401 || 
      error?.status === 403 ||
      error?.error?.error_summary?.includes('invalid_access_token') ||
      error?.error?.error?.includes('invalid_access_token');
    
    if (isAuthError && this.config.refreshToken) {
      console.log('🔄 Access_token expirado ou inválido, tentando renovar...');
      const renewed = await this.renewToken();
      if (renewed) {
        console.log('✅ Token renovado com sucesso, tentando novamente...');
        return true;
      }
    }
    return false;
  }

  /**
   * Renovar access_token usando refresh_token
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (!this.config.refreshToken || !this.config.appKey || !this.config.appSecret) {
      console.error('❌ Credenciais incompletas para renovação');
      return null;
    }

    // Validar formato do refresh_token (deve começar com algo válido)
    const trimmedToken = this.config.refreshToken.trim();
    if (!trimmedToken || trimmedToken.length < 20) {
      console.error('❌ Refresh token parece estar malformado (muito curto ou vazio)');
      return null;
    }

    try {
      console.log('🔄 Renovando access_token usando refresh_token...');
      console.log(`📋 Refresh token length: ${trimmedToken.length}, starts with: ${trimmedToken.substring(0, 10)}...`);
      
      const fetchImpl: any = (globalThis as any).fetch;
      const res = await fetchImpl('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: trimmedToken,
          client_id: this.config.appKey,
          client_secret: this.config.appSecret
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Erro HTTP ao renovar token:', res.status, errorData);
        if (errorData.error === 'invalid_grant') {
          console.error('❌ Refresh token inválido ou expirado. Você precisa gerar um novo token.');
        }
        return null;
      }

      const data = await res.json();
      if (data.access_token) {
        console.log('✅ Access_token renovado com sucesso');
        // Atualizar config com novo access_token
        this.config.accessToken = data.access_token;
        return data.access_token;
      } else {
        console.error('❌ Resposta não contém access_token:', data);
      }
    } catch (e) {
      console.error('❌ Erro ao renovar access_token:', e);
    }
    return null;
  }

  /**
   * Verificar se Dropbox está configurado e ativo
   */
  isConfigured(): boolean {
    const useDropbox = process.env.USE_DROPBOX === 'true';
    const hasCredentials = !!(
      (this.config.accessToken || this.config.refreshToken) &&
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
      (process.env.DROPBOX_ACCESS_TOKEN || process.env.DROPBOX_REFRESH_TOKEN) &&
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

      // Garantir que temos um access_token válido
      await this.ensureValidToken();

      // Criar pastas necessárias antes do upload
      await this.ensureFolderExists(`/${folder}`);
      await this.ensureFolderExists(`/${folder}/${userFolder}`);

      // Upload para Dropbox (com retry automático se token expirou)
      let result;
      let shareResult;
      try {
        result = await this.dropbox!.filesUpload({
          path: dropboxPath,
          contents: fileBuffer,
          mode: 'overwrite' as any,
          autorename: true
        });

        // Gerar URL pública
        shareResult = await this.dropbox!.sharingCreateSharedLinkWithSettings({
          path: dropboxPath,
          settings: {
            requested_visibility: 'public' as any,
            audience: 'public' as any
          }
        });
      } catch (uploadError: any) {
        // Se erro de autenticação, tentar renovar e repetir
        const renewed = await this.handleAuthError(uploadError);
        if (renewed) {
          // Tentar novamente após renovar token
          result = await this.dropbox!.filesUpload({
            path: dropboxPath,
            contents: fileBuffer,
            mode: 'overwrite' as any,
            autorename: true
          });
          shareResult = await this.dropbox!.sharingCreateSharedLinkWithSettings({
            path: dropboxPath,
            settings: {
              requested_visibility: 'public' as any,
              audience: 'public' as any
            }
          });
        } else {
          throw uploadError;
        }
      }

      // Converter URL do Dropbox para formato de imagem direta
      // Dropbox pode retornar: ?dl=0 ou &dl=0, precisamos trocar para raw=1
      let publicUrl = shareResult.result.url;
      if (publicUrl.includes('?dl=0')) {
        publicUrl = publicUrl.replace('?dl=0', '?raw=1');
      } else if (publicUrl.includes('&dl=0')) {
        publicUrl = publicUrl.replace('&dl=0', '&raw=1');
      } else {
        // Se não tem dl=0, adicionar raw=1
        publicUrl += (publicUrl.includes('?') ? '&' : '?') + 'raw=1';
      }

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
      // Garantir que temos um access_token válido
      await this.ensureValidToken();

      let result;
      try {
        result = await this.dropbox.filesListFolder({
          path: `/${folder}`,
          limit: maxResults
        });
      } catch (listError: any) {
        // Se erro de autenticação, tentar renovar e repetir
        const renewed = await this.handleAuthError(listError);
        if (renewed) {
          result = await this.dropbox.filesListFolder({
            path: `/${folder}`,
            limit: maxResults
          });
        } else {
          throw listError;
        }
      }

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
      // Converter URL do Dropbox para formato de imagem direta
      let url = shareResult.result.url;
      if (url.includes('?dl=0')) {
        url = url.replace('?dl=0', '?raw=1');
      } else if (url.includes('&dl=0')) {
        url = url.replace('&dl=0', '&raw=1');
      } else {
        url += (url.includes('?') ? '&' : '?') + 'raw=1';
      }
      return url;
    } catch (err: any) {
      // Se já existe, listar link existente
      try {
        const list = await this.dropbox.sharingListSharedLinks({ path });
        const link = list.result.links?.[0]?.url;
        if (!link) return null;
        // Converter URL do Dropbox para formato de imagem direta
        let url = link;
        if (url.includes('?dl=0')) {
          url = url.replace('?dl=0', '?raw=1');
        } else if (url.includes('&dl=0')) {
          url = url.replace('&dl=0', '&raw=1');
        } else {
          url += (url.includes('?') ? '&' : '?') + 'raw=1';
        }
        return url;
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
   * Garantir que uma pasta existe (cria se não existir)
   */
  private async ensureFolderExists(path: string): Promise<void> {
    if (!this.dropbox) return;

    try {
      // Tentar criar a pasta
      await this.dropbox.filesCreateFolderV2({
        path: path,
        autorename: false
      });
      console.log('✅ Pasta criada:', path);
    } catch (error: any) {
      // Se a pasta já existe, ignorar o erro
      if (error?.error?.error_summary?.includes('path/conflict/folder')) {
        // Pasta já existe, tudo bem
        return;
      }
      // Outros erros podem ser ignorados (ex: sem permissão, mas tentamos criar)
      console.log('ℹ️ Pasta pode já existir ou erro ao criar:', path);
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
