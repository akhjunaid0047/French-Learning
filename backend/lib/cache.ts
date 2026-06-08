import { createHash } from "node:crypto";
import { CACHE_DIR, MEM_CACHE_MAX } from "../config";

// ---------------------------------------------------------------------------
// L1: In-memory LRU cache
// ---------------------------------------------------------------------------
const memCache = new Map<string, Buffer>();

export function memGet(key: string): Buffer | undefined {
  const value = memCache.get(key);
  if (value !== undefined) {
    // Refresh recency: delete + re-insert moves it to the end
    memCache.delete(key);
    memCache.set(key, value);
  }
  return value;
}

export function memSet(key: string, value: Buffer): void {
  if (memCache.has(key)) memCache.delete(key);
  if (memCache.size >= MEM_CACHE_MAX) {
    // Evict oldest entry (first in insertion order)
    memCache.delete(memCache.keys().next().value!);
  }
  memCache.set(key, value);
}

// ---------------------------------------------------------------------------
// L2: Disk cache
// ---------------------------------------------------------------------------
let diskWriteFailures = 0;

export async function diskGet(key: string): Promise<Buffer | null> {
  try {
    const file = Bun.file(`${CACHE_DIR}/${key}.mp3`);
    if (await file.exists()) return Buffer.from(await file.arrayBuffer());
  } catch {
    // Cache miss or read error — treat as miss
  }
  return null;
}

export async function diskSet(key: string, data: Buffer): Promise<void> {
  try {
    await Bun.write(`${CACHE_DIR}/${key}.mp3`, data);
    diskWriteFailures = 0;
  } catch (err) {
    diskWriteFailures++;
    if (diskWriteFailures >= 3) {
      console.error(`Disk cache has failed ${diskWriteFailures} times in a row. Check disk space / permissions.`);
    } else {
      console.warn("Failed to write audio to disk cache:", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Cache key
// ---------------------------------------------------------------------------
export function cacheKey(text: string, speed: number): string {
  // Include speed so different speeds cache independently
  return createHash("sha256")
    .update(`${text.toLowerCase().trim()}@${speed.toFixed(2)}`)
    .digest("hex");
}
