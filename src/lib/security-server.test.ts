import { describe, it, expect } from "bun:test";
import { safeCompare } from "./security-server";

describe("safeCompare", () => {
  it("returns true for identical strings", () => {
    expect(safeCompare("secret123", "secret123")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(safeCompare("secret123", "secret124")).toBe(false);
  });

  it("returns false for different strings of different lengths", () => {
    expect(safeCompare("secret123", "secret")).toBe(false);
  });

  it("handles empty strings", () => {
    expect(safeCompare("", "")).toBe(true);
    expect(safeCompare("", "a")).toBe(false);
  });
});
