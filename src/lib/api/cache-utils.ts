import crypto from 'node:crypto';

/**
 * API Cache Utilities for DeadLine
 * Implements ETag, HTTP caching, and pagination helpers
 */

export interface CacheOptions {
  maxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  private?: boolean; // private cache only
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generate ETag for response data
 */
export function generateETag(data: any): string {
  const body = JSON.stringify(data);
  return 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
}

/**
 * Check if request has valid ETag
 */
export function hasValidETag(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  return ifNoneMatch === etag;
}

/**
 * Create cache control header
 */
export function createCacheControl(options: CacheOptions = {}): string {
  const { maxAge = 60, staleWhileRevalidate = 300, private: isPrivate = false } = options;

  let cacheControl = isPrivate ? 'private' : 'public';
  cacheControl += `, max-age=${maxAge}`;
  cacheControl += `, stale-while-revalidate=${staleWhileRevalidate}`;

  return cacheControl;
}

/**
 * Handle cached GET response with ETag
 */
export function createCachedResponse(
  data: any,
  request: Request,
  cacheOptions?: CacheOptions
): Response {
  const body = JSON.stringify(data);
  const etag = generateETag(data);

  // Check for ETag match
  if (hasValidETag(request, etag)) {
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': createCacheControl(cacheOptions)
      }
    });
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'ETag': etag,
      'Cache-Control': createCacheControl(cacheOptions)
    }
  });
}

/**
 * Parse pagination parameters from request
 */
export function parsePagination(request: Request, options: PaginationOptions = {}): {
  page: number;
  limit: number;
  offset: number;
} {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(
    options.maxLimit || 100,
    Math.max(1, parseInt(url.searchParams.get('limit') || '20'))
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: { page: number; limit: number }
): PaginatedResponse<T> {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Idempotency key validation and storage
 */
export class IdempotencyManager {
  private static instance: IdempotencyManager;
  private cache = new Map<string, { result: any; expires: number }>();
  private readonly TTL = 3600 * 1000; // 1 hour in milliseconds

  static getInstance(): IdempotencyManager {
    if (!IdempotencyManager.instance) {
      IdempotencyManager.instance = new IdempotencyManager();
    }
    return IdempotencyManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  async set(key: string, result: any): Promise<void> {
    this.cache.set(key, {
      result,
      expires: Date.now() + this.TTL
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Auto cleanup every 5 minutes
setInterval(() => {
  IdempotencyManager.getInstance().cleanup();
}, 5 * 60 * 1000);

/**
 * Handle idempotent POST requests
 */
export async function handleIdempotentPost<T>(
  request: Request,
  operation: () => Promise<T>,
  key?: string
): Promise<Response> {
  const idempotencyKey = key || request.headers.get('Idempotency-Key');

  if (!idempotencyKey) {
    return new Response(
      JSON.stringify({ error: 'Missing Idempotency-Key header' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const manager = IdempotencyManager.getInstance();
  const existing = await manager.get<T>(idempotencyKey);

  if (existing) {
    return new Response(JSON.stringify(existing), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const result = await operation();
    await manager.set(idempotencyKey, result);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Operation failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
