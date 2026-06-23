import { TURNSTILE_SECRET, TURNSTILE_ENABLED } from "../config";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | null,
  remoteip?: string
): Promise<{ success: boolean; error?: string }> {
  // Skip verification if disabled (e.g. local dev)
  if (!TURNSTILE_ENABLED) return { success: true };

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

    if (data.success) return { success: true };
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
