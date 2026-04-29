import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { isSafeUrl, safeCompare } from "./security";

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

describe("safeCompare", () => {
  it("should return true for identical strings", () => {
    expect(safeCompare("secret123", "secret123")).toBe(true);
    expect(safeCompare("", "")).toBe(true);
  });

  it("should return false for different strings of the same length", () => {
    expect(safeCompare("secret123", "secret321")).toBe(false);
  });

  it("should return false for different strings of different lengths", () => {
    expect(safeCompare("secret123", "secret")).toBe(false);
    expect(safeCompare("secret", "secret123")).toBe(false);
    expect(safeCompare("secret123", "")).toBe(false);
    expect(safeCompare("", "secret123")).toBe(false);
  });

  it("should not crash on very long strings", () => {
    const longString1 = "A".repeat(10000);
    const longString2 = "A".repeat(10000);
    const longString3 = "B".repeat(10000);
    expect(safeCompare(longString1, longString2)).toBe(true);
    expect(safeCompare(longString1, longString3)).toBe(false);
  });
});
