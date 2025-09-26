import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, rateLimitConfigs } from '@/lib/rate-limit';

// Mock для NextRequest
const createMockRequest = (headers: Record<string, string> = {}) => {
  return {
    headers: {
      get: (name: string) => headers[name] || null,
      has: (name: string) => name in headers,
      forEach: (callback: (value: string, key: string) => void) => {
        Object.entries(headers).forEach(([key, value]) => callback(value, key));
      }
    },
    url: 'http://localhost:3000/api/test',
    method: 'GET'
  } as any;
};

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      max: 5,
      message: 'Rate limit exceeded'
    });
  });

  describe('checkLimit', () => {
    it('should allow first request', async () => {
      const req = createMockRequest();
      const result = await limiter.checkLimit(req);
      
      expect(result.allowed).toBe(true);
      expect(result.info.remaining).toBe(4);
      expect(result.info.limit).toBe(5);
    });

    it('should allow requests within limit', async () => {
      const req = createMockRequest();
      
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        const result = await limiter.checkLimit(req);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', async () => {
      const req = createMockRequest();
      
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit(req);
        expect(result.allowed).toBe(true);
      }
      
      // 6th request should be blocked
      const result = await limiter.checkLimit(req);
      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
    });

    it('should use custom key generator', async () => {
      const customLimiter = new RateLimiter({
        windowMs: 60000,
        max: 2,
        keyGenerator: (req) => 'custom-key'
      });

      const req1 = createMockRequest({ 'x-forwarded-for': '192.168.1.1' });
      const req2 = createMockRequest({ 'x-forwarded-for': '192.168.1.2' });
      
      // Both requests should use the same key
      const result1 = await customLimiter.checkLimit(req1);
      const result2 = await customLimiter.checkLimit(req2);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(false); // Second request should be blocked
    });
  });

  describe('rate limit configs', () => {
    it('should have correct API config', () => {
      expect(rateLimitConfigs.api.max).toBe(100);
      expect(rateLimitConfigs.api.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have correct auth config', () => {
      expect(rateLimitConfigs.auth.max).toBe(5);
      expect(rateLimitConfigs.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have correct AI config', () => {
      expect(rateLimitConfigs.ai.max).toBe(10);
      expect(rateLimitConfigs.ai.windowMs).toBe(60 * 1000);
    });

    it('should have correct upload config', () => {
      expect(rateLimitConfigs.upload.max).toBe(5);
      expect(rateLimitConfigs.upload.windowMs).toBe(60 * 1000);
    });
  });
});

describe('Rate Limit Utils', () => {
  describe('isSuspiciousIP', () => {
    it('should identify suspicious IPs', () => {
      const { rateLimitUtils } = require('@/lib/rate-limit');
      
      expect(rateLimitUtils.isSuspiciousIP('10.0.0.1')).toBe(true);
      expect(rateLimitUtils.isSuspiciousIP('192.168.1.1')).toBe(true);
      expect(rateLimitUtils.isSuspiciousIP('127.0.0.1')).toBe(true);
      expect(rateLimitUtils.isSuspiciousIP('::1')).toBe(true);
    });

    it('should not flag normal IPs', () => {
      const { rateLimitUtils } = require('@/lib/rate-limit');
      
      expect(rateLimitUtils.isSuspiciousIP('8.8.8.8')).toBe(false);
      expect(rateLimitUtils.isSuspiciousIP('1.1.1.1')).toBe(false);
      expect(rateLimitUtils.isSuspiciousIP('203.0.113.1')).toBe(false);
    });
  });

  describe('generateIPKey', () => {
    it('should generate IP key', () => {
      const { rateLimitUtils } = require('@/lib/rate-limit');
      
      const key = rateLimitUtils.generateIPKey('192.168.1.1');
      expect(key).toBe('rate_limit:ip:192.168.1.1');
    });

    it('should generate IP key with user agent', () => {
      const { rateLimitUtils } = require('@/lib/rate-limit');
      
      const key = rateLimitUtils.generateIPKey('192.168.1.1', 'Mozilla/5.0');
      expect(key).toBe('rate_limit:ip:192.168.1.1:Mozilla/5.0');
    });
  });

  describe('generateUserKey', () => {
    it('should generate user key', () => {
      const { rateLimitUtils } = require('@/lib/rate-limit');
      
      const key = rateLimitUtils.generateUserKey('user-123');
      expect(key).toBe('rate_limit:user:user-123');
    });

    it('should generate user key with action', () => {
      const { rateLimitUtils } = require('@/lib/rate-limit');
      
      const key = rateLimitUtils.generateUserKey('user-123', 'login');
      expect(key).toBe('rate_limit:user:user-123:login');
    });
  });
});

describe('Rate Limit Middleware', () => {
  it('should create rate limit response', () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 5,
      message: 'Rate limit exceeded'
    });

    const response = limiter['createRateLimitResponse'](30);
    
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
  });

  it('should create response with rate limit info', () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 5
    });

    const info = {
      limit: 5,
      remaining: 3,
      reset: Date.now() + 60000
    };

    const response = limiter['createResponseWithInfo'](info);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('3');
  });
});

describe('Rate Limit Integration', () => {
  it('should handle multiple users', async () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 2
    });

    const req1 = createMockRequest({ 'x-forwarded-for': '192.168.1.1' });
    const req2 = createMockRequest({ 'x-forwarded-for': '192.168.1.2' });
    
    // Both users should be able to make requests
    const result1 = await limiter.checkLimit(req1);
    const result2 = await limiter.checkLimit(req2);
    
    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
  });

  it('should reset after window expires', async () => {
    const limiter = new RateLimiter({
      windowMs: 100, // Very short window
      max: 1
    });

    const req = createMockRequest();
    
    // First request should be allowed
    const result1 = await limiter.checkLimit(req);
    expect(result1.allowed).toBe(true);
    
    // Second request should be blocked
    const result2 = await limiter.checkLimit(req);
    expect(result2.allowed).toBe(false);
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Request after window should be allowed
    const result3 = await limiter.checkLimit(req);
    expect(result3.allowed).toBe(true);
  });
});
