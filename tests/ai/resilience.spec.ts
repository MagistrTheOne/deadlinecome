import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from '@/src/lib/ai/core/resilience/circuit-breaker';
import { TokenBucket } from '@/src/lib/ai/core/resilience/rate-limit';

describe('CB', () => {
  it('opens after threshold', async () => {
    const cb = new CircuitBreaker({ threshold: 2, cooldownMs: 100 });
    await expect(cb.exec(() => Promise.reject(new Error('x')))).rejects.toThrow();
    await expect(cb.exec(() => Promise.reject(new Error('x')))).rejects.toThrow();
    await expect(cb.exec(() => Promise.resolve(1))).rejects.toThrow(); // open
  });
});

describe('TokenBucket', () => {
  it('limits', () => {
    const b = new TokenBucket(1, 0);
    expect(b.allow()).toBe(true);
    expect(b.allow()).toBe(false);
  });
});
