import { MAX_TEXT_LENGTH, SPEED_MIN, SPEED_MAX } from "../config";
import { openai } from "../lib/openaiClient";
import { cacheKey, memGet, memSet, diskGet, diskSet } from "../lib/cache";
import { isRateLimited } from "../lib/rateLimit";
import { corsHeaders, SECURITY_HEADERS } from "../lib/cors";
import type { HeadersInit } from "bun";

function audioResponse(buffer: Buffer, cors: HeadersInit): Response {
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      ...SECURITY_HEADERS,
      ...cors as any
    },
  });
}

function jsonError(msg: string, status: number, cors: HeadersInit): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...cors as any },
  });
}

export async function handleTts(req: Request, ip: string): Promise<Response> {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);

  if (isRateLimited(ip)) return jsonError("Too many requests", 429, cors);

  let text: string;
  let speed: number;
  try {
    const body: any = await req.json();
    text = (body?.text ?? "").toString().trim();
    const rawSpeed: any = body?.speed;
    speed = rawSpeed !== undefined ? Number(rawSpeed) : 1.0;
  } catch {
    return jsonError("Invalid JSON body", 400, cors);
  }

  if (!text) return jsonError("text is required", 400, cors);
  if (text.length > MAX_TEXT_LENGTH)
    return jsonError(`text must be ≤ ${MAX_TEXT_LENGTH} characters`, 422, cors);
  if (isNaN(speed) || speed < SPEED_MIN || speed > SPEED_MAX)
    return jsonError(`speed must be between ${SPEED_MIN} and ${SPEED_MAX}`, 422, cors);

  const key = cacheKey(text, speed);

  const memHit = memGet(key);
  if (memHit) {
    console.log(`[mem]  ${text} (speed=${speed})`);
    return audioResponse(memHit, cors);
  }

  const diskHit = await diskGet(key);
  if (diskHit) {
    console.log(`[disk] ${text} (speed=${speed})`);
    memSet(key, diskHit);
    return audioResponse(diskHit, cors);
  }

  console.log(`[api]  ${text} (speed=${speed})`);
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
      speed,
    });
    const audioBuffer = Buffer.from(await mp3.arrayBuffer());
    memSet(key, audioBuffer);
    diskSet(key, audioBuffer); // fire-and-forget
    return audioResponse(audioBuffer, cors);
  } catch (err) {
    console.error("OpenAI TTS error:", err instanceof Error ? err.message : err);
    return jsonError("TTS generation failed", 502, cors);
  }
}
