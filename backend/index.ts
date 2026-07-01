import { mkdir } from "node:fs/promises";
import {
  PORT,
  CACHE_DIR,
  ALLOWED_ORIGIN,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  TRUSTED_PROXY,
} from "./config";
import { handlePreflight, SECURITY_HEADERS } from "./lib/cors";
import { handleTts } from "./handlers/tts";

// Ensure cache directory exists before serving
await mkdir(CACHE_DIR, { recursive: true });
console.log(`Cache directory ready: ${CACHE_DIR}`);

Bun.serve({
  port: PORT,

  async fetch(req: any, server: any) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin");

    // CORS preflight
    if (req.method === "OPTIONS") return handlePreflight(origin);

    // Health check
    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json", ...SECURITY_HEADERS as any},
      });
    }

    // TTS endpoint
    if (req.method === "POST" && url.pathname === "/tts") {
      const realIp = TRUSTED_PROXY
        ? (req.headers.get("cf-connecting-ip") ??
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            server.requestIP(req)?.address ??
            "unknown")
        : (server.requestIP(req)?.address ?? "unknown");
      return handleTts(req, realIp);
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`TTS server running on http://localhost:${PORT}`);
console.log(`Allowed origin: ${ALLOWED_ORIGIN}`);
console.log(`Rate limit: ${RATE_LIMIT_MAX} req / ${RATE_LIMIT_WINDOW_MS / 1000}s per IP`);