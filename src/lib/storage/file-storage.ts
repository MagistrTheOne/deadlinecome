import { writeFile, readFile, unlink, mkdir, stat } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { createHash } from 'crypto';
import { LoggerService } from '@/lib/logger';

interface FileUpload {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  hash: string;
  uploadedAt: Date;
}

interface StorageConfig {
  uploadDir: string;
  maxFileSize: number; // в байтах
  allowedMimeTypes: string[];
  generateThumbnails: boolean;
  thumbnailSizes: number[];
}

class FileStorageService {
  private config: StorageConfig;
  private uploadDir: string;

  constructor() {
    this.config = {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-zip-compressed'
      ],
      generateThumbnails: true,
      thumbnailSizes: [150, 300, 600]
    };

    this.uploadDir = this.config.uploadDir;
  }

  // Инициализация storage
  async initialize(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true });
      await mkdir(join(this.uploadDir, 'thumbnails'), { recursive: true });
      await mkdir(join(this.uploadDir, 'avatars'), { recursive: true });
      await mkdir(join(this.uploadDir, 'documents'), { recursive: true });
      await mkdir(join(this.uploadDir, 'attachments'), { recursive: true });
      
      LoggerService.api.info('File storage initialized', { uploadDir: this.uploadDir });
    } catch (error: any) {
      LoggerService.error.error('Failed to initialize file storage', { error: error.message });
      throw error;
    }
  }

  // Загрузка файла
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    category: 'avatar' | 'document' | 'attachment' = 'attachment'
  ): Promise<FileUpload> {
    try {
      // Валидация файла
      this.validateFile(file, mimeType);

      // Генерируем уникальное имя файла
      const hash = this.generateFileHash(file);
      const extension = extname(originalName);
      const filename = `${hash}${extension}`;
      
      // Определяем директорию для категории
      const categoryDir = join(this.uploadDir, category + 's');
      const filePath = join(categoryDir, filename);

      // Сохраняем файл
      await writeFile(filePath, file);

      // Генерируем превью для изображений
      if (this.isImage(mimeType) && this.config.generateThumbnails) {
        await this.generateThumbnails(filePath, filename);
      }

      const upload: FileUpload = {
        originalName,
        filename,
        path: filePath,
        size: file.length,
        mimeType,
        hash,
        uploadedAt: new Date()
      };

      LoggerService.api.info('File uploaded successfully', {
        originalName,
        filename,
        size: file.length,
        mimeType,
        category
      });

      return upload;
    } catch (error: any) {
      LoggerService.error.error('Failed to upload file', {
        error: error.message,
        originalName,
        mimeType
      });
      throw error;
    }
  }

  // Получение файла
  async getFile(filename: string, category: 'avatar' | 'document' | 'attachment' = 'attachment'): Promise<Buffer | null> {
    try {
      const categoryDir = join(this.uploadDir, category + 's');
      const filePath = join(categoryDir, filename);
      
      const fileBuffer = await readFile(filePath);
      return fileBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to get file', {
        error: error.message,
        filename,
        category
      });
      return null;
    }
  }

  // Удаление файла
  async deleteFile(filename: string, category: 'avatar' | 'document' | 'attachment' = 'attachment'): Promise<boolean> {
    try {
      const categoryDir = join(this.uploadDir, category + 's');
      const filePath = join(categoryDir, filename);
      
      await unlink(filePath);

      // Удаляем превью если это изображение
      if (this.isImageFile(filename)) {
        await this.deleteThumbnails(filename);
      }

      LoggerService.api.info('File deleted successfully', { filename, category });
      return true;
    } catch (error: any) {
      LoggerService.error.error('Failed to delete file', {
        error: error.message,
        filename,
        category
      });
      return false;
    }
  }

  // Получение превью
  async getThumbnail(filename: string, size: number = 300): Promise<Buffer | null> {
    try {
      if (!this.isImageFile(filename)) {
        return null;
      }

      const thumbnailPath = join(this.uploadDir, 'thumbnails', `${size}_${filename}`);
      const thumbnailBuffer = await readFile(thumbnailPath);
      return thumbnailBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to get thumbnail', {
        error: error.message,
        filename,
        size
      });
      return null;
    }
  }

  // Получение информации о файле
  async getFileInfo(filename: string, category: 'avatar' | 'document' | 'attachment' = 'attachment'): Promise<any> {
    try {
      const categoryDir = join(this.uploadDir, category + 's');
      const filePath = join(categoryDir, filename);
      
      const stats = await stat(filePath);
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        path: filePath
      };
    } catch (error: any) {
      LoggerService.error.error('Failed to get file info', {
        error: error.message,
        filename,
        category
      });
      return null;
    }
  }

  // Валидация файла
  private validateFile(file: Buffer, mimeType: string): void {
    // Проверка размера
    if (file.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
    }

    // Проверка типа файла
    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    // Дополнительные проверки для изображений
    if (this.isImage(mimeType)) {
      this.validateImageFile(file, mimeType);
    }
  }

  // Валидация изображения
  private validateImageFile(file: Buffer, mimeType: string): void {
    // Проверка заголовков файла
    const header = file.slice(0, 10);
    
    switch (mimeType) {
      case 'image/jpeg':
        if (!header.slice(0, 2).equals(Buffer.from([0xFF, 0xD8]))) {
          throw new Error('Invalid JPEG file');
        }
        break;
      case 'image/png':
        if (!header.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
          throw new Error('Invalid PNG file');
        }
        break;
      case 'image/gif':
        if (!header.slice(0, 6).equals(Buffer.from('GIF87a')) && !header.slice(0, 6).equals(Buffer.from('GIF89a'))) {
          throw new Error('Invalid GIF file');
        }
        break;
    }
  }

  // Генерация хэша файла
  private generateFileHash(file: Buffer): string {
    return createHash('sha256').update(file).digest('hex');
  }

  // Проверка является ли файл изображением
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private isImageFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  }

  // Генерация превью
  private async generateThumbnails(filePath: string, filename: string): Promise<void> {
    try {
      // Динамический импорт sharp для обработки изображений
      const sharp = await import('sharp');
      
      for (const size of this.config.thumbnailSizes) {
        const thumbnailPath = join(this.uploadDir, 'thumbnails', `${size}_${filename}`);
        
        await sharp.default(filePath)
          .resize(size, size, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
      }

      LoggerService.api.info('Thumbnails generated', { filename, sizes: this.config.thumbnailSizes });
    } catch (error: any) {
      LoggerService.error.error('Failed to generate thumbnails', {
        error: error.message,
        filename
      });
    }
  }

  // Удаление превью
  private async deleteThumbnails(filename: string): Promise<void> {
    try {
      for (const size of this.config.thumbnailSizes) {
        const thumbnailPath = join(this.uploadDir, 'thumbnails', `${size}_${filename}`);
        try {
          await unlink(thumbnailPath);
        } catch (error) {
          // Игнорируем ошибки если файл не существует
        }
      }
    } catch (error: any) {
      LoggerService.error.error('Failed to delete thumbnails', {
        error: error.message,
        filename
      });
    }
  }

  // Очистка старых файлов
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let deletedCount = 0;
      
      // Очищаем все категории
      const categories = ['avatars', 'documents', 'attachments'];
      
      for (const category of categories) {
        const categoryDir = join(this.uploadDir, category);
        // TODO: Реализовать рекурсивный обход директории и удаление старых файлов
      }

      LoggerService.api.info('File cleanup completed', { deletedCount, daysOld });
      return deletedCount;
    } catch (error: any) {
      LoggerService.error.error('Failed to cleanup old files', {
        error: error.message,
        daysOld
      });
      return 0;
    }
  }

  // Получение статистики storage
  async getStorageStats(): Promise<any> {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        categories: {
          avatars: { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          attachments: { count: 0, size: 0 }
        }
      };

      // TODO: Реализовать подсчет файлов и размеров
      
      return stats;
    } catch (error: any) {
      LoggerService.error.error('Failed to get storage stats', { error: error.message });
      return null;
    }
  }
}

// Экспорт сервиса
export const fileStorageService = new FileStorageService();
