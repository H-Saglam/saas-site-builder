import { describe, it, expect } from "bun:test";
import { slugSchema } from "./validators";

describe("slugSchema", () => {
  describe("Valid Scenarios", () => {
    it("should accept valid slugs", () => {
      const validSlugs = [
        "valid-slug",
        "slug-123",
        "a-b-c",
        "123",
        "hello-world",
        "test-case-1",
        "my-long-slug-example",
      ];

      validSlugs.forEach((slug) => {
        const result = slugSchema.safeParse(slug);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(slug);
        }
      });
    });

    it("should accept slugs with minimum length (3 chars)", () => {
      const result = slugSchema.safeParse("abc");
      expect(result.success).toBe(true);
    });

    it("should accept slugs with maximum length (50 chars)", () => {
      const slug = "a".repeat(50);
      const result = slugSchema.safeParse(slug);
      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Scenarios", () => {
    it("should reject slugs shorter than 3 characters", () => {
      const result = slugSchema.safeParse("ab");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("URL en az 3 karakter olmalı");
      }
    });

    it("should reject slugs longer than 50 characters", () => {
      const slug = "a".repeat(51);
      const result = slugSchema.safeParse(slug);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("URL en fazla 50 karakter olabilir");
      }
    });

    it("should reject uppercase letters", () => {
      const result = slugSchema.safeParse("Invalid-Slug");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });

    it("should reject spaces", () => {
      const result = slugSchema.safeParse("invalid slug");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });

    it("should reject special characters", () => {
      const result = slugSchema.safeParse("slug!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });

    it("should reject underscores", () => {
      const result = slugSchema.safeParse("slug_with_underscore");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });

    it("should reject leading hyphens", () => {
      const result = slugSchema.safeParse("-slug");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });

    it("should reject trailing hyphens", () => {
      const result = slugSchema.safeParse("slug-");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });

    it("should reject consecutive hyphens", () => {
      const result = slugSchema.safeParse("slug--example");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "URL sadece küçük harf, rakam ve tire (-) içerebilir"
        );
      }
    });
  });
});
