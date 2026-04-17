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
    expect(safeCompare("secret", "secret")).toBe(true);
  });

  it("should return false for different strings", () => {
    expect(safeCompare("secret", "different")).toBe(false);
  });

  it("should return false for different length strings", () => {
    expect(safeCompare("secret", "secrett")).toBe(false);
  });

  it("should return true for both null", () => {
    expect(safeCompare(null, null)).toBe(true);
  });

  it("should return true for both undefined", () => {
    expect(safeCompare(undefined, undefined)).toBe(true);
  });

  it("should return false when one is null", () => {
    expect(safeCompare("secret", null)).toBe(false);
    expect(safeCompare(null, "secret")).toBe(false);
  });

  it("should return false when one is undefined", () => {
    expect(safeCompare("secret", undefined)).toBe(false);
    expect(safeCompare(undefined, "secret")).toBe(false);
  });
});
