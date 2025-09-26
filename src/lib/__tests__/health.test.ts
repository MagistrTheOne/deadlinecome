import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthService, HealthCheck } from '@/lib/health';

// Mock для health checks
class MockHealthCheck extends HealthCheck {
  name = 'mock';
  private shouldFail: boolean = false;
  private responseTime: number = 100;

  constructor(shouldFail: boolean = false, responseTime: number = 100) {
    super();
    this.shouldFail = shouldFail;
    this.responseTime = responseTime;
  }

  async check() {
    // Симулируем задержку
    await new Promise(resolve => setTimeout(resolve, this.responseTime));
    
    if (this.shouldFail) {
      return {
        name: this.name,
        status: 'unhealthy',
        responseTime: this.responseTime,
        message: 'Mock check failed',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      name: this.name,
      status: 'healthy',
      responseTime: this.responseTime,
      message: 'Mock check passed',
      timestamp: new Date().toISOString()
    };
  }
}

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
  });

  describe('performHealthChecks', () => {
    it('should return healthy status when all checks pass', async () => {
      // Заменяем все проверки на успешные моки
      healthService['checks'] = [
        new MockHealthCheck(false, 50),
        new MockHealthCheck(false, 75),
        new MockHealthCheck(false, 100)
      ];

      const result = await healthService.performHealthChecks();
      
      expect(result.overall).toBe('healthy');
      expect(result.checks).toHaveLength(3);
      expect(result.checks.every(check => check.status === 'healthy')).toBe(true);
    });

    it('should return degraded status when some checks fail', async () => {
      healthService['checks'] = [
        new MockHealthCheck(false, 50),
        new MockHealthCheck(true, 75),
        new MockHealthCheck(false, 100)
      ];

      const result = await healthService.performHealthChecks();
      
      expect(result.overall).toBe('degraded');
      expect(result.checks).toHaveLength(3);
      expect(result.checks.filter(check => check.status === 'healthy')).toHaveLength(2);
      expect(result.checks.filter(check => check.status === 'unhealthy')).toHaveLength(1);
    });

    it('should return unhealthy status when all checks fail', async () => {
      healthService['checks'] = [
        new MockHealthCheck(true, 50),
        new MockHealthCheck(true, 75),
        new MockHealthCheck(true, 100)
      ];

      const result = await healthService.performHealthChecks();
      
      expect(result.overall).toBe('unhealthy');
      expect(result.checks).toHaveLength(3);
      expect(result.checks.every(check => check.status === 'unhealthy')).toBe(true);
    });

    it('should include system metrics', async () => {
      healthService['checks'] = [new MockHealthCheck(false, 50)];
      
      const result = await healthService.performHealthChecks();
      
      expect(result.metrics).toBeDefined();
      expect(result.metrics?.memory).toBeDefined();
      expect(result.metrics?.cpu).toBeDefined();
      expect(result.metrics?.disk).toBeDefined();
    });

    it('should include uptime and version', async () => {
      healthService['checks'] = [new MockHealthCheck(false, 50)];
      
      const result = await healthService.performHealthChecks();
      
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.version).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('checkService', () => {
    it('should check specific service', async () => {
      const mockCheck = new MockHealthCheck(false, 50);
      healthService['checks'] = [mockCheck];
      
      const result = await healthService.checkService('mock');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('mock');
      expect(result?.status).toBe('healthy');
    });

    it('should return null for non-existent service', async () => {
      const result = await healthService.checkService('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('addCheck and removeCheck', () => {
    it('should add custom check', () => {
      const customCheck = new MockHealthCheck(false, 50);
      customCheck.name = 'custom';
      
      healthService.addCheck(customCheck);
      
      expect(healthService['checks']).toContain(customCheck);
    });

    it('should remove check', () => {
      const mockCheck = new MockHealthCheck(false, 50);
      mockCheck.name = 'to-remove';
      
      healthService.addCheck(mockCheck);
      expect(healthService['checks']).toContain(mockCheck);
      
      healthService.removeCheck('to-remove');
      expect(healthService['checks']).not.toContain(mockCheck);
    });
  });
});

describe('Health Utils', () => {
  describe('checkUrl', () => {
    it('should check URL availability', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200
      });
      
      const result = await healthUtils.checkUrl('https://example.com');
      expect(result).toBe(true);
    });

    it('should handle URL check failure', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fetch to throw error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await healthUtils.checkUrl('https://example.com');
      expect(result).toBe(false);
    });

    it('should handle timeout', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fetch to never resolve
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );
      
      const result = await healthUtils.checkUrl('https://example.com', 100);
      expect(result).toBe(false);
    });
  });

  describe('checkFile', () => {
    it('should check file existence', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fs.access
      const fs = await import('fs/promises');
      vi.spyOn(fs, 'access').mockResolvedValue(undefined);
      
      const result = await healthUtils.checkFile('/path/to/file');
      expect(result).toBe(true);
    });

    it('should handle file not found', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fs.access to throw error
      const fs = await import('fs/promises');
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'));
      
      const result = await healthUtils.checkFile('/path/to/nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('checkDirectory', () => {
    it('should check directory existence', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fs.stat
      const fs = await import('fs/promises');
      vi.spyOn(fs, 'stat').mockResolvedValue({
        isDirectory: () => true
      } as any);
      
      const result = await healthUtils.checkDirectory('/path/to/dir');
      expect(result).toBe(true);
    });

    it('should handle directory not found', async () => {
      const { healthUtils } = require('@/lib/health');
      
      // Mock fs.stat to throw error
      const fs = await import('fs/promises');
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error('ENOENT'));
      
      const result = await healthUtils.checkDirectory('/path/to/nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('createCustomCheck', () => {
    it('should create custom health check', () => {
      const { healthUtils } = require('@/lib/health');
      
      const customCheck = healthUtils.createCustomCheck('test', async () => ({
        name: 'test',
        status: 'healthy',
        responseTime: 100,
        message: 'Test check',
        timestamp: new Date().toISOString()
      }));
      
      expect(customCheck.name).toBe('test');
      expect(customCheck.check).toBeDefined();
    });
  });
});

describe('Health API', () => {
  it('should handle health check request', async () => {
    const { GET } = require('@/lib/health');
    
    // Mock HealthService
    const mockHealthService = {
      performHealthChecks: vi.fn().mockResolvedValue({
        overall: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: 1000,
        version: '1.0.0',
        environment: 'test',
        checks: []
      }),
      checkService: vi.fn()
    };
    
    // Replace global healthService
    vi.doMock('@/lib/health', () => ({
      healthService: mockHealthService
    }));
    
    const request = new Request('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });

  it('should handle service-specific check', async () => {
    const { GET } = require('@/lib/health');
    
    const mockHealthService = {
      checkService: vi.fn().mockResolvedValue({
        name: 'database',
        status: 'healthy',
        responseTime: 50,
        message: 'Database is healthy',
        timestamp: new Date().toISOString()
      })
    };
    
    vi.doMock('@/lib/health', () => ({
      healthService: mockHealthService
    }));
    
    const request = new Request('http://localhost:3000/api/health?service=database');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });

  it('should handle health check error', async () => {
    const { GET } = require('@/lib/health');
    
    const mockHealthService = {
      performHealthChecks: vi.fn().mockRejectedValue(new Error('Health check failed'))
    };
    
    vi.doMock('@/lib/health', () => ({
      healthService: mockHealthService
    }));
    
    const request = new Request('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.status).toBe(500);
  });
});
