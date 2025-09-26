import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';
import { schemas } from './schemas';

export class ValidationError extends Error {
  constructor(
    public errors: ZodError,
    public message: string = 'Ошибка валидации данных'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationService {
  /**
   * Валидация данных по схеме
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }
  }

  /**
   * Валидация с безопасным парсингом
   */
  static safeValidate<T>(schema: ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
  } {
    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Неожиданная ошибка валидации']
      };
    }
  }

  /**
   * Валидация тела запроса
   */
  static async validateRequestBody<T>(schema: ZodSchema<T>, request: NextRequest): Promise<T> {
    try {
      const body = await request.json();
      return this.validate(schema, body);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        new ZodError([{
          code: 'custom',
          message: 'Некорректный JSON в теле запроса',
          path: []
        }])
      );
    }
  }

  /**
   * Валидация параметров URL
   */
  static validateUrlParams<T>(schema: ZodSchema<T>, params: Record<string, string | string[] | undefined>): T {
    return this.validate(schema, params);
  }

  /**
   * Валидация query параметров
   */
  static validateQueryParams<T>(schema: ZodSchema<T>, searchParams: URLSearchParams): T {
    const params: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return this.validate(schema, params);
  }

  /**
   * Создание ответа с ошибкой валидации
   */
  static createValidationErrorResponse(error: ValidationError): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка валидации данных',
        message: error.message,
        details: error.errors.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  /**
   * Создание успешного ответа
   */
  static createSuccessResponse<T>(data: T, message?: string): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Создание ответа с ошибкой
   */
  static createErrorResponse(error: string, status: number = 500, details?: any): NextResponse {
    return NextResponse.json({
      success: false,
      error,
      details,
      timestamp: new Date().toISOString()
    }, { status });
  }
}

/**
 * Middleware для валидации API запросов
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (validatedData: T, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const validatedData = await ValidationService.validateRequestBody(schema, request);
      return await handler(validatedData, request);
    } catch (error) {
      if (error instanceof ValidationError) {
        return ValidationService.createValidationErrorResponse(error);
      }
      return ValidationService.createErrorResponse(
        'Внутренняя ошибка сервера',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}

/**
 * Middleware для валидации query параметров
 */
export function withQueryValidation<T>(
  schema: ZodSchema<T>,
  handler: (validatedData: T, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const validatedData = ValidationService.validateQueryParams(schema, searchParams);
      return await handler(validatedData, request);
    } catch (error) {
      if (error instanceof ValidationError) {
        return ValidationService.createValidationErrorResponse(error);
      }
      return ValidationService.createErrorResponse(
        'Внутренняя ошибка сервера',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}

/**
 * Middleware для валидации URL параметров
 */
export function withParamsValidation<T>(
  schema: ZodSchema<T>,
  handler: (validatedData: T, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest, { params }: { params: Record<string, string> }): Promise<NextResponse> => {
    try {
      const validatedData = ValidationService.validateUrlParams(schema, params);
      return await handler(validatedData, request);
    } catch (error) {
      if (error instanceof ValidationError) {
        return ValidationService.createValidationErrorResponse(error);
      }
      return ValidationService.createErrorResponse(
        'Внутренняя ошибка сервера',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}

/**
 * Валидация файлов
 */
export function validateFile(file: File, schema: z.ZodSchema): { success: boolean; errors?: string[] } {
  const fileData = {
    type: file.type.split('/')[0],
    size: file.size,
    mimeType: file.type
  };

  return ValidationService.safeValidate(schema, fileData);
}

/**
 * Валидация изображений
 */
export function validateImage(file: File): { success: boolean; errors?: string[] } {
  const imageSchema = z.object({
    type: z.literal('image'),
    size: z.number().max(5 * 1024 * 1024, 'Изображение слишком большое (максимум 5MB)'),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
      errorMap: () => ({ message: 'Неподдерживаемый формат изображения' })
    })
  });

  return validateFile(file, imageSchema);
}

/**
 * Валидация документов
 */
export function validateDocument(file: File): { success: boolean; errors?: string[] } {
  const documentSchema = z.object({
    type: z.literal('document'),
    size: z.number().max(10 * 1024 * 1024, 'Документ слишком большой (максимум 10MB)'),
    mimeType: z.enum([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ], {
      errorMap: () => ({ message: 'Неподдерживаемый формат документа' })
    })
  });

  return validateFile(file, documentSchema);
}

/**
 * Валидация ID
 */
export function validateId(id: string): boolean {
  return schemas.id.safeParse(id).success;
}

/**
 * Валидация email
 */
export function validateEmail(email: string): boolean {
  return schemas.email.safeParse(email).success;
}

/**
 * Валидация URL
 */
export function validateUrl(url: string): boolean {
  return schemas.url.safeParse(url).success;
}

/**
 * Валидация даты
 */
export function validateDate(date: string | Date): boolean {
  return schemas.date.safeParse(date).success;
}

/**
 * Валидация JSON
 */
export function validateJson(json: string): { success: boolean; data?: any; error?: string } {
  try {
    const parsed = JSON.parse(json);
    const result = schemas.json.safeParse(parsed);
    return {
      success: result.success,
      data: result.success ? result.data : undefined,
      error: result.success ? undefined : 'Некорректный JSON'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Некорректный JSON'
    };
  }
}

/**
 * Валидация пагинации
 */
export function validatePagination(page?: string, limit?: string): {
  success: boolean;
  data?: { page: number; limit: number };
  errors?: string[];
} {
  const paginationData = {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20
  };

  return ValidationService.safeValidate(schemas.pagination, paginationData);
}

/**
 * Валидация сортировки
 */
export function validateSorting(sortBy?: string, sortOrder?: string): {
  success: boolean;
  data?: { sortBy: string; sortOrder: 'asc' | 'desc' };
  errors?: string[];
} {
  const sortingData = {
    sortBy: sortBy || 'createdAt',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
  };

  const schema = z.object({
    sortBy: z.string().min(1),
    sortOrder: z.enum(['asc', 'desc'])
  });

  return ValidationService.safeValidate(schema, sortingData);
}

/**
 * Валидация фильтров
 */
export function validateFilters(filters: Record<string, any>): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  return ValidationService.safeValidate(schemas.filter, filters);
}

/**
 * Валидация поиска
 */
export function validateSearch(query: string, type?: string): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  const searchData = {
    query,
    type: type || 'all'
  };

  return ValidationService.safeValidate(schemas.search, searchData);
}

/**
 * Валидация экспорта
 */
export function validateExport(format: string, type: string, filters?: any): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  const exportData = {
    format,
    type,
    filters
  };

  return ValidationService.safeValidate(schemas.export, exportData);
}

/**
 * Валидация настроек
 */
export function validateSettings(settings: any): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  return ValidationService.safeValidate(schemas.settings, settings);
}

/**
 * Валидация WebSocket событий
 */
export function validateWebSocketEvent(event: any): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  return ValidationService.safeValidate(schemas.websocketEvent, event);
}

/**
 * Валидация уведомлений
 */
export function validateNotification(notification: any): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  return ValidationService.safeValidate(schemas.notification, notification);
}

/**
 * Валидация AI чата
 */
export function validateAIChat(chat: any): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  return ValidationService.safeValidate(schemas.aiChat, chat);
}

// Экспорт всех валидаторов
export const validators = {
  validateId,
  validateEmail,
  validateUrl,
  validateDate,
  validateJson,
  validatePagination,
  validateSorting,
  validateFilters,
  validateSearch,
  validateExport,
  validateSettings,
  validateWebSocketEvent,
  validateNotification,
  validateAIChat,
  validateImage,
  validateDocument,
} as const;
