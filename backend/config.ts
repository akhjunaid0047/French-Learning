// All server configuration — loaded once from environment variables

export const PORT = Number(process.env.PORT ?? 3001);
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";

// TTS validation
export const MAX_TEXT_LENGTH = 200;
export const SPEED_MIN = 0.25;
export const SPEED_MAX = 1.0;

// Cache
export const CACHE_DIR = "./cache";
export const MEM_CACHE_MAX = 500; // covers 1000 words × 2 speeds with headroom

// Rate limiter
export const RATE_LIMIT_MAX = 60;
export const RATE_LIMIT_WINDOW_MS = 60_000;

// Security — only trust x-forwarded-for when behind a known reverse proxy
export const TRUSTED_PROXY = process.env.TRUSTED_PROXY === "true";

// Cloudflare Turnstile
export const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET ?? "";
export const TURNSTILE_ENABLED = process.env.TURNSTILE_ENABLED !== "false";
