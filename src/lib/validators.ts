import { z } from "zod";

// ============================================
// Slug Validasyonu
// ============================================
export const slugSchema = z
  .string()
  .min(3, "URL en az 3 karakter olmalı")
  .max(50, "URL en fazla 50 karakter olabilir")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "URL sadece küçük harf, rakam ve tire (-) içerebilir"
  );

// ============================================
// Slide Validasyonu
// ============================================
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli hex renk giriniz");

const gradientSchema = z.object({
  from: hexColorSchema,
  to: hexColorSchema,
});

// URL must be http or https
const safeUrlSchema = z
  .string()
  .url("Geçerli resim URL'si giriniz")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "Sadece http ve https protokolleri desteklenir"
  );

export const slideSchema = z.object({
  type: z.enum(["cover", "photo", "collage", "text", "finale"]),
  heading: z.string().max(100, "Başlık en fazla 100 karakter olabilir").default(""),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .default(""),
  gradient: gradientSchema,
  imageUrl: safeUrlSchema.optional().or(z.literal("")),
  collageUrls: z
    .array(safeUrlSchema.or(z.literal("")))
    .optional(),
  handPointerText: z.string().max(50).optional(),
}).superRefine((slide, ctx) => {
  if ((slide.type === "text" || slide.type === "finale") && slide.heading.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["heading"],
      message: "Bu slide tipi için başlık zorunlu",
    });
  }
});

// ============================================
// Site Form Validasyonu
// ============================================
export const siteFormSchema = z
  .object({
    title: z
      .string()
      .min(2, "Başlık en az 2 karakter olmalı")
      .max(100, "Başlık en fazla 100 karakter olabilir"),
    recipientName: z
      .string()
      .min(1, "Alıcı ismi boş olamaz")
      .max(50, "İsim en fazla 50 karakter olabilir"),
    slug: slugSchema,
    templateId: z.string().default("valentines"),
    slides: z
      .array(slideSchema)
      .min(3, "En az 3 slide olmalı")
      .max(12, "En fazla 12 slide olabilir"),
    musicId: z.string().min(1, "Geçersiz müzik seçimi").nullable().optional(),
    isPrivate: z.boolean().default(false),
    password: z
      .string()
      .min(4, "Şifre en az 4 karakter olmalı")
      .max(20, "Şifre en fazla 20 karakter olabilir")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.isPrivate) {
        return !!data.password && data.password.length >= 4;
      }
      return true;
    },
    {
      message: "Private site için şifre belirlemelisiniz (min 4 karakter)",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.isPrivate && data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Şifreler eşleşmiyor",
      path: ["confirmPassword"],
    }
  );

export const siteUpdateSchema = z
  .object({
    id: z.string().uuid("Geçersiz site ID").optional(),
    siteId: z.string().uuid("Geçersiz site ID").optional(),
    title: z
      .string()
      .min(2, "Başlık en az 2 karakter olmalı")
      .max(100, "Başlık en fazla 100 karakter olabilir")
      .optional(),
    recipientName: z
      .string()
      .min(1, "Alıcı ismi boş olamaz")
      .max(50, "İsim en fazla 50 karakter olabilir")
      .optional(),
    slug: slugSchema.optional(),
    slides: z
      .array(slideSchema)
      .min(3, "En az 3 slide olmalı")
      .max(12, "En fazla 12 slide olabilir")
      .optional(),
    musicId: z.string().min(1, "Bir müzik seçmelisiniz").nullable().optional(),
    isPrivate: z.boolean().optional(),
    password: z
      .string()
      .min(4, "Şifre en az 4 karakter olmalı")
      .max(20, "Şifre en fazla 20 karakter olabilir")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .strict()
  .refine((data) => !!(data.id || data.siteId), {
    message: "Site ID gerekli",
    path: ["siteId"],
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      return !data.confirmPassword || data.password === data.confirmPassword;
    },
    {
      message: "Şifreler eşleşmiyor",
      path: ["confirmPassword"],
    }
  );

// ============================================
// Şifre Doğrulama
// ============================================
export const verifyPasswordSchema = z.object({
  slug: z.string().min(1),
  password: z.string().min(1, "Şifre giriniz"),
});

// ============================================
// Export Types
// ============================================
export type SiteFormValues = z.infer<typeof siteFormSchema>;
export type SiteUpdateValues = z.infer<typeof siteUpdateSchema>;
export type VerifyPasswordValues = z.infer<typeof verifyPasswordSchema>;
