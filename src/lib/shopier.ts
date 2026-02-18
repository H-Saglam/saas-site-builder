import crypto from "crypto";
import type { PackageType } from "@/lib/types";

const SHOPIER_TOKEN_TTL_MS = 30 * 60 * 1000;

export const SHOPIER_PACKAGE_PRICES: Record<PackageType, string> = {
  standard: "149",
  premium: "249",
};

interface CheckoutTokenInput {
  siteId: string;
  packageType: PackageType;
  orderId: string;
  issuedAt: number;
}

function buildTokenPayload(input: CheckoutTokenInput): string {
  return `${input.siteId}|${input.packageType}|${input.orderId}|${input.issuedAt}`;
}

function hmacHex(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeCompareHex(input: string, expected: string): boolean {
  try {
    const inputBuffer = Buffer.from(input, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (inputBuffer.length === 0 || inputBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function createShopierCheckoutToken(input: CheckoutTokenInput, secret: string): string {
  const signature = hmacHex(buildTokenPayload(input), secret);
  return `${input.issuedAt}.${signature}`;
}

export function verifyShopierCheckoutToken(
  token: string,
  expectedInput: Omit<CheckoutTokenInput, "issuedAt">,
  secret: string
): boolean {
  const [issuedAtRaw, signature] = token.split(".");
  if (!issuedAtRaw || !signature) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;

  const now = Date.now();
  if (issuedAt > now + 60_000) return false;
  if (now - issuedAt > SHOPIER_TOKEN_TTL_MS) return false;

  const expectedSignature = hmacHex(
    buildTokenPayload({
      ...expectedInput,
      issuedAt,
    }),
    secret
  );

  return safeCompareHex(signature, expectedSignature);
}

export function buildShopierCallbackSignature(orderId: string, secret: string): string {
  return hmacHex(orderId, secret);
}

export function isPackageType(value: string): value is PackageType {
  return value === "standard" || value === "premium";
}
