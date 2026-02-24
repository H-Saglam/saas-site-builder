import { describe, it, expect } from "bun:test";
import { generateOfflineHTML } from "./templates";
import type { SiteData, SlideData } from "@/lib/types";

describe("XSS Vulnerability in Offline Template", () => {
  it("should sanitize javascript: URL injection in image src (remove img tag)", () => {
    const maliciousSlide: SlideData = {
      order: 1,
      type: "photo",
      heading: "Malicious Slide",
      description: "Testing XSS",
      gradient: { from: "#000000", to: "#ffffff" },
      imageUrl: "javascript:alert('XSS')",
    };

    const siteData: SiteData = {
      id: "1",
      userId: "user1",
      slug: "test-site",
      title: "Test Site",
      recipientName: "Victim",
      templateId: "valentines",
      slides: [maliciousSlide],
      musicId: null,
      status: "active",
      packageType: "premium",
      isPrivate: false,
      passwordHash: null,
      publishedAt: new Date().toISOString(),
      expiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const html = generateOfflineHTML(siteData, {});

    // The image tag should be removed because localUrl becomes empty
    expect(html).not.toContain('src="javascript:alert(&#39;XSS&#39;)"');
    expect(html).not.toContain('<img src="javascript:alert');
  });

  it("should sanitize javascript: URL injection in collage (empty src)", () => {
    const maliciousSlide: SlideData = {
      order: 1,
      type: "collage",
      heading: "Malicious Collage",
      description: "Testing XSS",
      gradient: { from: "#000000", to: "#ffffff" },
      collageUrls: ["javascript:alert(1)", "https://example.com/safe.jpg", ""],
    };

    const siteData: SiteData = {
      id: "1",
      userId: "user1",
      slug: "test-site",
      title: "Test Site",
      recipientName: "Victim",
      templateId: "valentines",
      slides: [maliciousSlide],
      musicId: null,
      status: "active",
      packageType: "premium",
      isPrivate: false,
      passwordHash: null,
      publishedAt: new Date().toISOString(),
      expiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const html = generateOfflineHTML(siteData, {});

    expect(html).not.toContain('src="javascript:alert(1)"');
    // It should contain src="" for the first image
    expect(html).toContain('src="" class="c-img c-1');
  });
});
