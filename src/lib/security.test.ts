import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { isSafeUrl, safeCompare } from "./security";

describe("safeCompare", () => {
  it("should return true for identical strings", () => {
    expect(safeCompare("secret-token-123", "secret-token-123")).toBe(true);
    expect(safeCompare("", "")).toBe(true);
  });

  it("should return false for different strings of the same length", () => {
    expect(safeCompare("secret-token-123", "secret-token-124")).toBe(false);
    expect(safeCompare("a", "b")).toBe(false);
  });

  it("should return false for strings of different lengths", () => {
    expect(safeCompare("secret-token-123", "secret-token-1234")).toBe(false);
    expect(safeCompare("secret-token", "secret")).toBe(false);
  });

  it("should handle null or undefined gracefully", () => {
    expect(safeCompare(null, null)).toBe(false);
    expect(safeCompare(undefined, undefined)).toBe(false);
    expect(safeCompare("string", null)).toBe(false);
    expect(safeCompare(undefined, "string")).toBe(false);
  });
});

describe("isSafeUrl", () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_ENV;
  });

  it("should allow URLs from the configured Supabase domain", () => {
    expect(isSafeUrl("https://example.supabase.co/storage/v1/object/public/test.jpg")).toBe(true);
  });

  it("should reject URLs from other domains", () => {
    expect(isSafeUrl("https://malicious.com/test.jpg")).toBe(false);
    expect(isSafeUrl("https://google.com")).toBe(false);
  });

  it("should reject URLs with http protocol", () => {
    expect(isSafeUrl("http://example.supabase.co/test.jpg")).toBe(false);
  });

  it("should reject internal IP addresses", () => {
    expect(isSafeUrl("https://127.0.0.1/test.jpg")).toBe(false);
    expect(isSafeUrl("https://169.254.169.254/latest/meta-data/")).toBe(false);
  });

  it("should reject invalid URLs", () => {
    expect(isSafeUrl("not-a-url")).toBe(false);
    expect(isSafeUrl("ftp://example.supabase.co/test.jpg")).toBe(false);
  });

  it("should return false if Supabase URL is not configured", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    expect(isSafeUrl("https://example.supabase.co/test.jpg")).toBe(false);
  });
});
