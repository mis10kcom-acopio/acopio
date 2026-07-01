import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";

const COOKIE_NAME = "has_avistamiento_rl";
const MAX_AVISTAMIENTOS_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

export const AVISTAMIENTO_RATE_LIMIT_MESSAGE =
  "Has alcanzado el límite de 5 pistas por hora. Intenta de nuevo más tarde.";

type RateLimitPayload = {
  ip: string;
  ts: number[];
};

function getSigningSecret(): string {
  const secret =
    process.env.RATE_LIMIT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "Configura RATE_LIMIT_SECRET o SUPABASE_SERVICE_ROLE_KEY para el rate limiting.",
    );
  }
  return secret;
}

function hashClientIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function getClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function encodePayload(payload: RateLimitPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodePayload(value: string): RateLimitPayload | null {
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex <= 0) return null;

  const encoded = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);
  const expected = sign(encoded);

  try {
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as RateLimitPayload;
    if (!parsed || typeof parsed.ip !== "string" || !Array.isArray(parsed.ts)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function pruneTimestamps(timestamps: number[], now: number): number[] {
  const windowStart = now - WINDOW_MS;
  return timestamps.filter((timestamp) => timestamp > windowStart);
}

async function readPayload(ipHash: string): Promise<RateLimitPayload> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const decoded = raw ? decodePayload(raw) : null;

  if (!decoded || decoded.ip !== ipHash) {
    return { ip: ipHash, ts: [] };
  }

  return {
    ip: ipHash,
    ts: pruneTimestamps(decoded.ts, Date.now()),
  };
}

async function writePayload(payload: RateLimitPayload): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodePayload(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.ceil(WINDOW_MS / 1000),
    path: "/",
  });
}

export async function assertAvistamientoRateLimit(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const headerStore = await headers();
  const ipHash = hashClientIp(getClientIp(headerStore));
  const payload = await readPayload(ipHash);

  if (payload.ts.length >= MAX_AVISTAMIENTOS_PER_HOUR) {
    return { ok: false, message: AVISTAMIENTO_RATE_LIMIT_MESSAGE };
  }

  return { ok: true };
}

export async function recordSuccessfulAvistamiento(): Promise<void> {
  const headerStore = await headers();
  const ipHash = hashClientIp(getClientIp(headerStore));
  const payload = await readPayload(ipHash);

  await writePayload({
    ip: ipHash,
    ts: [...payload.ts, Date.now()],
  });
}
