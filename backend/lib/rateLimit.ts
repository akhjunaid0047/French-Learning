import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "../config";

interface RateLimitEntry { count: number; windowStart: number; }
const map = new Map<string, RateLimitEntry>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = map.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    map.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, entry] of map) {
    if (entry.windowStart < cutoff) map.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);
