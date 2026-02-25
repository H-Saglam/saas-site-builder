import { expect, test, describe } from "bun:test";
import { cn } from "./utils";

describe("cn utility", () => {
  test("merges single class strings", () => {
    expect(cn("foo")).toBe("foo");
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("merges multiple class strings", () => {
    expect(cn("foo bar", "baz")).toBe("foo bar baz");
  });

  test("handles conditional classes (object syntax)", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
    expect(cn({ foo: true, bar: true })).toBe("foo bar");
  });

  test("handles arrays of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
    expect(cn(["foo", ["bar", "baz"]])).toBe("foo bar baz");
  });

  test("handles mixed arguments", () => {
    expect(cn("foo", { bar: true, baz: false }, ["qux"])).toBe("foo bar qux");
  });

  test("ignores falsy values (null, undefined, boolean)", () => {
    // @ts-expect-error - intentionally passing invalid types to test runtime behaviour
    expect(cn("foo", null, undefined, false, true, "")).toBe("foo");
  });

  test("resolves Tailwind CSS conflicts", () => {
    // twMerge should handle conflicts, e.g., p-4 and p-8
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("handles complex nested structures", () => {
    expect(cn("base", ["nested", { conditional: true, hidden: false }], "end")).toBe("base nested conditional end");
  });
});
