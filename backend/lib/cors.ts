import type { HeadersInit } from "bun";
import { ALLOWED_ORIGIN } from "../config";

export function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function handlePreflight(origin: string | null): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin) as any});
}

export const SECURITY_HEADERS: HeadersInit = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};
