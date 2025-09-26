import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/lib/storage/file-storage';
import { LoggerService } from '@/lib/logger';

interface RouteParams {
  params: {
    category: string;
    filename: string;
  };
}

// GET /api/files/[category]/[filename]/thumbnail - Получение превью изображения
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { category, filename } = params;
    const { searchParams } = new URL(request.url);
    const size = parseInt(searchParams.get('size') || '300');

    // Валидация категории
    if (!['avatar', 'document', 'attachment'].includes(category)) {
      return new NextResponse('Invalid category', { status: 400 });
    }

    // Валидация размера превью
    const allowedSizes = [150, 300, 600];
    if (!allowedSizes.includes(size)) {
      return new NextResponse('Invalid thumbnail size', { status: 400 });
    }

    // Получаем превью
    const thumbnailBuffer = await fileStorageService.getThumbnail(filename, size);

    if (!thumbnailBuffer) {
      return new NextResponse('Thumbnail not found', { status: 404 });
    }

    LoggerService.api.info('Thumbnail served', { category, filename, size, thumbnailSize: thumbnailBuffer.length });

    return new NextResponse(thumbnailBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': thumbnailBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // 1 год кэширования
        'ETag': `"${filename}_${size}"`
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'thumbnail-serve', filename: params.filename });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
