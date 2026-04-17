import crypto from "crypto";

const DEFAULT_ORDER_ACCESS_TTL_MS = 15 * 60 * 1000;

interface OrderAccessTokenPayload {
  orderId: string;
  orderNumber: string;
  exp: number;
}

export interface OrderAccessClaims {
  orderId: string;
  orderNumber: string;
  expiresAt: Date;
}

function getOrderAccessSecret() {
  return process.env.ORDER_ACCESS_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-order-access-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadBase64: string) {
  return crypto.createHmac("sha256", getOrderAccessSecret()).update(payloadBase64).digest("base64url");
}

export function createOrderAccessToken(
  input: { orderId: string; orderNumber: string },
  ttlMs = DEFAULT_ORDER_ACCESS_TTL_MS
) {
  const payload: OrderAccessTokenPayload = {
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    exp: Date.now() + ttlMs,
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function verifyOrderAccessToken(token: string): OrderAccessClaims | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = sign(payloadBase64);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64)) as OrderAccessTokenPayload;
    if (!payload.orderId || !payload.orderNumber || typeof payload.exp !== "number") {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    return {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      expiresAt: new Date(payload.exp),
    };
  } catch {
    return null;
  }
}