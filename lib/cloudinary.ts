import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Função para upload de imagens
export const uploadImage = async (file: File | Buffer, folder: string = 'sexyflow'): Promise<string> => {
  try {
    // Converter File para Buffer se necessário
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // Upload para Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return (result as any).secure_url;
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw new Error('Falha no upload da imagem');
  }
};

// Função para upload de vídeos
export const uploadVideo = async (file: File | Buffer, folder: string = 'sexyflow/videos'): Promise<string> => {
  try {
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'video',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return (result as any).secure_url;
  } catch (error) {
    console.error('Erro no upload de vídeo para Cloudinary:', error);
    throw new Error('Falha no upload do vídeo');
  }
};

// Função para deletar arquivo
export const deleteFile = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Erro ao deletar arquivo do Cloudinary:', error);
    return false;
  }
};

// Função para obter URL otimizada
export const getOptimizedUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string => {
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Se já é uma URL do Cloudinary, aplicar transformações
  if (url.includes('cloudinary.com')) {
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const path = url.split('/upload/')[1];
    
    let transformations = '';
    if (width) transformations += `w_${width},`;
    if (height) transformations += `h_${height},`;
    if (quality) transformations += `q_${quality},`;
    if (format) transformations += `f_${format},`;
    
    if (transformations) {
      transformations = transformations.slice(0, -1); // Remove última vírgula
      return `${baseUrl}${transformations}/${path}`;
    }
  }
  
  return url;
};
