import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';
import connectDB from './db';
import { FileUpload } from '@/models';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileId?: string;
}

export async function uploadFile(
  file: File,
  userId: string,
  type: 'image' | 'video'
): Promise<UploadResult> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verificar tamanho do arquivo (2GB)
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '2147483648');
    if (buffer.length > maxSize) {
      return {
        success: false,
        error: 'Arquivo muito grande. Máximo permitido: 2GB'
      };
    }

    // Verificar tipo de arquivo
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    const allowedTypes = type === 'image' ? allowedImageTypes : allowedVideoTypes;
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      };
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', userId);
    await mkdir(uploadDir, { recursive: true });

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Salvar informações no banco de dados
    await connectDB();
    const fileUrl = `/uploads/${userId}/${fileName}`;
    const uploadedFile = await FileUpload.create({
      filename: fileName,
      originalName: file.name,
      mimetype: file.type,
      size: buffer.length,
      url: fileUrl,
      userId: userId,
    });

    return {
      success: true,
      url: fileUrl,
      fileId: uploadedFile.id
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    return {
      success: false,
      error: 'Erro interno no servidor'
    };
  }
}

export async function deleteFile(fileId: string, userId: string): Promise<boolean> {
  try {
    await connectDB();
    const file = await FileUpload.findOne({
      _id: fileId,
      userId: userId
    });

    if (!file) {
      return false;
    }

    // Remover arquivo físico
    const filePath = join(process.cwd(), 'public', file.url);
    await unlink(filePath).catch(() => {}); // Ignorar erro se arquivo não existir

    // Remover do banco de dados
    await FileUpload.findByIdAndDelete(fileId);

    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
}

export function getFileUrl(filePath: string): string {
  if (filePath.startsWith('http')) {
    return filePath;
  }
  return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${filePath}`;
}
