const AUTH_COOKIE = "auth_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.APP_PASSWORD;
  if (!secret) {
    throw new Error("SESSION_SECRET or APP_PASSWORD must be configured.");
  }
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signPayload(payload: string): Promise<string> {
  const keyData = new TextEncoder().encode(getSessionSecret());
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  const payloadEncoded = bytesToBase64Url(new TextEncoder().encode(payload));
  const signature = await signPayload(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export async function verifySessionToken(token?: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [payloadEncoded, providedSig] = token.split(".");
  if (!payloadEncoded || !providedSig) {
    return false;
  }

  const expectedSig = await signPayload(payloadEncoded);
  if (expectedSig !== providedSig) {
    return false;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payloadEncoded))
    ) as { exp?: number };

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const authCookieName = AUTH_COOKIE;
