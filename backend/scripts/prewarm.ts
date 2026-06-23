/**
 * prewarm.ts — Pre-generate TTS audio for all French vocabulary words.
 *
 * Generates MP3s for every word at both speed=1.0 (normal) and speed=0.75
 * (slow mode), writing them into the disk cache used by the main server.
 * Safe to re-run: already-cached files are skipped without calling OpenAI.
 *
 * Usage (from repo root after deploying):
 *   docker compose run --rm backend bun run prewarm
 */

import { mkdir } from "node:fs/promises";
import { CACHE_DIR } from "../config";
import { cacheKey, diskGet, diskSet } from "../lib/cache";
import { openai } from "../lib/openaiClient";

// Read the vocabulary JSON directly — same file the frontend bundles
import rawVocab from "../../frontend/french1000.json";

const SPEEDS = [1.0, 0.75] as const;
const CONCURRENCY = 3; // simultaneous OpenAI calls — stay well within rate limits

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAndCache(text: string, speed: number): Promise<"hit" | "miss" | "error"> {
  const key = cacheKey(text, speed);

  // Already on disk — skip entirely
  const existing = await diskGet(key);
  if (existing) return "hit";

  // Call OpenAI TTS
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
      speed,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await diskSet(key, buffer);
    return "miss";
  } catch (err: any) {
    // Retry once on transient errors
    if (err?.status === 429 || err?.status >= 500) {
      await sleep(2000);
      try {
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: text,
          response_format: "mp3",
          speed,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await diskSet(key, buffer);
        return "miss";
      } catch {
        // Give up after retry
      }
    }
    return "error";
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

await mkdir(CACHE_DIR, { recursive: true });

const words: string[] = (rawVocab as any[]).map((w: any) => String(w.french).trim()).filter(Boolean);
const total = words.length * SPEEDS.length;

console.log(`\n🎙  FrenchFlow TTS Pre-warmer`);
console.log(`   Words: ${words.length}  ×  Speeds: ${SPEEDS.join(", ")}  =  ${total} files`);
console.log(`   Cache dir: ${CACHE_DIR}`);
console.log(`   Concurrency: ${CONCURRENCY}\n`);

// Build the full task list: [{text, speed}, ...]
const tasks: { text: string; speed: number }[] = [];
for (const text of words) {
  for (const speed of SPEEDS) {
    tasks.push({ text, speed });
  }
}

let done = 0;
let hits = 0;
let misses = 0;
let errors = 0;

// Process in sliding-window batches of CONCURRENCY
for (let i = 0; i < tasks.length; i += CONCURRENCY) {
  const batch = tasks.slice(i, i + CONCURRENCY);

  const results = await Promise.all(
    batch.map(({ text, speed }) => fetchAndCache(text, speed))
  );

  for (let j = 0; j < results.length; j++) {
    done++;
    const { text, speed } = batch[j];
    const result = results[j];

    if (result === "hit")   hits++;
    if (result === "miss")  misses++;
    if (result === "error") errors++;

    const pct = ((done / total) * 100).toFixed(1);
    const tag = result === "hit" ? "cached" : result === "miss" ? "  NEW " : " ERR  ";
    console.log(`[${String(done).padStart(4)}/${total}] ${pct.padStart(5)}%  ${tag}  "${text}" (speed=${speed})`);
  }

  // Brief pause between batches to be polite to the API
  if (i + CONCURRENCY < tasks.length) {
    await sleep(300);
  }
}

console.log(`\n✅  Done.`);
console.log(`   Already cached : ${hits}`);
console.log(`   Newly generated: ${misses}`);
if (errors > 0) {
  console.warn(`   Errors (skipped): ${errors} — re-run the script to retry`);
}
console.log();
