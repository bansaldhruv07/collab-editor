class SimpleCache {
  constructor() {
    this.store = new Map();
  }
  set(key, data, ttlMs = 30000) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }
  invalidate(key) {
    this.store.delete(key);
  }
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
  clear() {
    this.store.clear();
  }
}
const cache = new SimpleCache();
export default cache;