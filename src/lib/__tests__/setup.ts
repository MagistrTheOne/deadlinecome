import { vi } from 'vitest';

// Mock для Next.js
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {}
    headers = new Map();
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => new Response(JSON.stringify(data), init)
  }
}));

// Mock для Winston
vi.mock('@/lib/logger', () => ({
  LoggerService: {
    logApiRequest: vi.fn(),
    logError: vi.fn(),
    logSecurity: vi.fn(),
    logPerformance: vi.fn(),
    logAI: vi.fn(),
    logUserAction: vi.fn(),
    logSystemEvent: vi.fn(),
    logWebSocketEvent: vi.fn(),
    logDatabase: vi.fn(),
    logCache: vi.fn(),
    logExternalAPI: vi.fn()
  }
}));

// Mock для Redis
vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    keys: vi.fn(),
    ping: vi.fn()
  }))
}));

// Mock для PostgreSQL
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
    on: vi.fn()
  }))
}));

// Mock для fs
vi.mock('fs/promises', () => ({
  access: vi.fn(),
  stat: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

// Mock для os
vi.mock('os', () => ({
  totalmem: vi.fn(() => 8589934592), // 8GB
  freemem: vi.fn(() => 4294967296),  // 4GB
  loadavg: vi.fn(() => [0.5, 0.3, 0.1])
}));

// Mock для fetch
global.fetch = vi.fn();

// Mock для console
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};
