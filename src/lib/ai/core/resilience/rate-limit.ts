export class TokenBucket {
  private tokens: number; private last = Date.now();
  constructor(private capacity: number, private refillPerSec: number) { this.tokens = capacity; }
  allow(cost = 1): boolean {
    const now = Date.now(); const delta = (now - this.last) / 1000; this.last = now;
    this.tokens = Math.min(this.capacity, this.tokens + delta * this.refillPerSec);
    if (this.tokens >= cost) { this.tokens -= cost; return true; }
    return false;
  }
}
