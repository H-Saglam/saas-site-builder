import { describe, it, expect } from "bun:test";
import { safeCompare } from "./security-server";

describe("safeCompare", () => {
  it("should return true for identical strings", () => {
    expect(safeCompare("secret", "secret")).toBe(true);
    expect(safeCompare("", "")).toBe(true);
  });

  it("should return false for different strings", () => {
    expect(safeCompare("secret", "not-secret")).toBe(false);
    expect(safeCompare("secret", "secrett")).toBe(false);
    expect(safeCompare("", "secret")).toBe(false);
  });
});
