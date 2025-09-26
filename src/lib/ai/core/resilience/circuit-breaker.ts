export class CircuitBreaker {
  private failures = 0; private state: 'closed'|'open'|'half' = 'closed'; private nextTry = 0;
  constructor(private opts: { threshold: number; cooldownMs: number }) {}
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (this.state === 'open' && now < this.nextTry) throw new Error('cb-open');
    if (this.state === 'open' && now >= this.nextTry) this.state = 'half';
    try {
      const out = await fn();
      this.failures = 0; this.state = 'closed'; return out;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.opts.threshold) { this.state = 'open'; this.nextTry = Date.now() + this.opts.cooldownMs; }
      throw e;
    }
  }
}
