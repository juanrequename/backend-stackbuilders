export class HnCache {
  private html: string | null = null;
  private cachedAt = 0;

  get(ttlMs: number): string | null {
    if (this.html && ttlMs > 0 && Date.now() - this.cachedAt < ttlMs) {
      return this.html;
    }
    return null;
  }

  set(html: string): void {
    this.html = html;
    this.cachedAt = Date.now();
  }

  clear(): void {
    this.html = null;
    this.cachedAt = 0;
  }
}

export const hnCache = new HnCache();
