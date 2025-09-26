import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/lib/storage/file-storage';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/upload - Загрузка файла
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'attachment';

    if (!file) {
      return ValidationService.createErrorResponse('No file provided', 400);
    }

    // Валидация категории
    if (!['avatar', 'document', 'attachment'].includes(category)) {
      return ValidationService.createErrorResponse('Invalid category', 400);
    }

    // Конвертируем File в Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Загружаем файл
    const upload = await fileStorageService.uploadFile(
      buffer,
      file.name,
      file.type,
      category as 'avatar' | 'document' | 'attachment'
    );

    LoggerService.api.info('File uploaded via API', {
      originalName: upload.originalName,
      filename: upload.filename,
      size: upload.size,
      category
    });

    return ValidationService.createSuccessResponse({
      success: true,
      file: {
        id: upload.hash,
        filename: upload.filename,
        originalName: upload.originalName,
        size: upload.size,
        mimeType: upload.mimeType,
        url: `/api/files/${category}/${upload.filename}`,
        thumbnailUrl: upload.mimeType.startsWith('image/') 
          ? `/api/files/${category}/${upload.filename}/thumbnail` 
          : null,
        uploadedAt: upload.uploadedAt
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'file-upload' });
    
    if (error.message.includes('File size exceeds')) {
      return ValidationService.createErrorResponse('File too large', 413);
    }
    
    if (error.message.includes('not allowed')) {
      return ValidationService.createErrorResponse('File type not allowed', 415);
    }
    
    return ValidationService.createErrorResponse('Upload failed', 500);
  }
}
