import { expect, test, describe } from "bun:test";
import { isWebP } from "./file-validation";

describe("isWebP", () => {
  test("returns true for valid WebP buffer", () => {
    const buffer = Buffer.alloc(12);
    buffer.write("RIFF", 0);
    buffer.write("WEBP", 8);
    expect(isWebP(buffer)).toBe(true);
  });

  test("returns false for buffer too short", () => {
    const buffer = Buffer.alloc(11);
    buffer.write("RIFF", 0);
    expect(isWebP(buffer)).toBe(false);
  });

  test("returns false for invalid magic bytes", () => {
    const buffer = Buffer.alloc(12);
    buffer.write("RIFF", 0);
    buffer.write("JPEG", 8);
    expect(isWebP(buffer)).toBe(false);
  });

  test("returns false for empty buffer", () => {
    const buffer = Buffer.alloc(0);
    expect(isWebP(buffer)).toBe(false);
  });
});
