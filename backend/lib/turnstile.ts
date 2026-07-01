import { TURNSTILE_SECRET, TURNSTILE_ENABLED } from "../config";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// ---------------------------------------------------------------------------
// Verified-IP session cache
// Turnstile tokens are single-use. Once an IP passes the challenge we remember
// it for SESSION_TTL_MS so subsequent TTS requests don't need a fresh token.
// ---------------------------------------------------------------------------
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const verifiedIps = new Map<string, number>(); // ip → verified-at timestamp

// Periodic cleanup of expired sessions
setInterval(() => {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [ip, ts] of verifiedIps) {
    if (ts < cutoff) verifiedIps.delete(ip);
  }
}, SESSION_TTL_MS);

export async function verifyTurnstile(
  token: string | null,
  remoteip?: string
): Promise<{ success: boolean; error?: string }> {
  // Skip verification if disabled (e.g. local dev)
  if (!TURNSTILE_ENABLED) return { success: true };

  // If this IP already passed a challenge recently, allow through
  if (remoteip && verifiedIps.has(remoteip)) {
    const verifiedAt = verifiedIps.get(remoteip)!;
    if (Date.now() - verifiedAt < SESSION_TTL_MS) {
      return { success: true };
    }
    verifiedIps.delete(remoteip);
  }

  if (!token) return { success: false, error: "Missing Turnstile token" };

  try {
    const body: Record<string, string> = {
      secret: TURNSTILE_SECRET,
      response: token,
    };
    if (remoteip) body.remoteip = remoteip;

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });

    const data: any = await res.json();

    if (data.success) {
      // Remember this IP so future requests skip re-verification
      if (remoteip) verifiedIps.set(remoteip, Date.now());
      return { success: true };
    }
    const errCodes: string[] = data["error-codes"] ?? [];
    return {
      success: false,
      error: errCodes.join(", ") || "Turnstile verification failed",
    };
  } catch (err) {
    console.error(
      "[turnstile] siteverify error:",
      err instanceof Error ? err.message : err
    );
    return { success: false, error: "Turnstile network error" };
  }
}
