import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/lib/storage/file-storage';
import { LoggerService } from '@/lib/logger';

interface RouteParams {
  params: {
    category: string;
    filename: string;
  };
}

// GET /api/files/[category]/[filename] - Получение файла
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { category, filename } = params;

    // Валидация категории
    if (!['avatar', 'document', 'attachment'].includes(category)) {
      return new NextResponse('Invalid category', { status: 400 });
    }

    // Получаем файл
    const fileBuffer = await fileStorageService.getFile(
      filename,
      category as 'avatar' | 'document' | 'attachment'
    );

    if (!fileBuffer) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Получаем информацию о файле для определения MIME типа
    const fileInfo = await fileStorageService.getFileInfo(
      filename,
      category as 'avatar' | 'document' | 'attachment'
    );

    // Определяем MIME тип по расширению файла
    const mimeType = getMimeType(filename);

    LoggerService.api.info('File served', { category, filename, size: fileBuffer.length });

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // 1 год кэширования
        'ETag': `"${filename}"`
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'file-serve', filename: params.filename });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/files/[category]/[filename] - Удаление файла
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { category, filename } = params;

    // Валидация категории
    if (!['avatar', 'document', 'attachment'].includes(category)) {
      return new NextResponse('Invalid category', { status: 400 });
    }

    // Удаляем файл
    const success = await fileStorageService.deleteFile(
      filename,
      category as 'avatar' | 'document' | 'attachment'
    );

    if (!success) {
      return new NextResponse('File not found or could not be deleted', { status: 404 });
    }

    LoggerService.api.info('File deleted', { category, filename });

    return new NextResponse('File deleted successfully', { status: 200 });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'file-delete', filename: params.filename });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Функция для определения MIME типа по расширению файла
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip'
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}
