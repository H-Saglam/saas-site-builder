import { describe, it, expect, test } from "bun:test";
import { slugSchema, slideSchema } from "./validators";

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

describe("slideSchema", () => {
  const validGradient = { from: "#ffffff", to: "#000000" };

  test("should validate a valid generic slide (cover)", () => {
    const slide = {
      type: "cover",
      heading: "Test Heading",
      description: "Test Description",
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
  });

  test("should validate a valid specific slide (text) with heading", () => {
    const slide = {
      type: "text",
      heading: "Required Heading",
      description: "Description",
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
  });

  test("should validate a valid specific slide (finale) with heading", () => {
    const slide = {
      type: "finale",
      heading: "Required Heading",
      description: "Description",
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
  });

  test("should invalidate a specific slide (text) without heading", () => {
    const slide = {
      type: "text",
      heading: "", // Empty heading
      description: "Description",
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Bu slide tipi için başlık zorunlu");
    }
  });

  test("should invalidate a specific slide (finale) without heading", () => {
    const slide = {
      type: "finale",
      heading: "   ", // Whitespace heading
      description: "Description",
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Bu slide tipi için başlık zorunlu");
    }
  });

  test("should validate a slide with max length heading", () => {
    const slide = {
      type: "cover",
      heading: "a".repeat(100),
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
  });

  test("should invalidate a slide with exceeding max length heading", () => {
    const slide = {
      type: "cover",
      heading: "a".repeat(101),
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Başlık en fazla 100 karakter olabilir");
    }
  });

  test("should invalidate a slide with exceeding max length description", () => {
    const slide = {
      type: "cover",
      heading: "Heading",
      description: "a".repeat(501),
      gradient: validGradient,
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Açıklama en fazla 500 karakter olabilir");
    }
  });

  test("should invalidate a slide with invalid gradient hex", () => {
    const slide = {
      type: "cover",
      heading: "Heading",
      gradient: { from: "invalid", to: "#000000" },
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("gradient") && i.path.includes("from"));
      expect(issue?.message).toBe("Geçerli hex renk giriniz");
    }
  });

  test("should validate a slide with valid image URL", () => {
    const slide = {
      type: "photo",
      heading: "Heading",
      gradient: validGradient,
      imageUrl: "https://example.com/image.jpg",
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
  });

  test("should invalidate a slide with invalid image URL", () => {
    const slide = {
      type: "photo",
      heading: "Heading",
      gradient: validGradient,
      imageUrl: "not-a-url",
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("imageUrl"));
      expect(issue?.message).toBe("Geçerli resim URL'si giriniz");
    }
  });

  test("should validate a slide with valid collage URLs", () => {
    const slide = {
      type: "collage",
      heading: "Heading",
      gradient: validGradient,
      collageUrls: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
  });

  test("should invalidate a slide with invalid collage URLs", () => {
    const slide = {
      type: "collage",
      heading: "Heading",
      gradient: validGradient,
      collageUrls: ["https://example.com/1.jpg", "not-a-url"],
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("collageUrls"));
      expect(issue?.message).toBe("Geçerli resim URL'si giriniz");
    }
  });

  test("should validate a slide with optional fields missing (except required)", () => {
    const slide = {
      type: "cover",
      gradient: validGradient,
      // missing heading (defaulted), description (defaulted), imageUrl, collageUrls, handPointerText
    };
    const result = slideSchema.safeParse(slide);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heading).toBe("");
      expect(result.data.description).toBe("");
    }
  });
});
