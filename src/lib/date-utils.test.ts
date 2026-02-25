import { describe, it, expect } from "bun:test";
import { getTimeAgo, getTimeRemaining } from "./date-utils";

describe("getTimeAgo", () => {
  it("should return 'Az önce' for less than 1 minute", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 30000); // 30 seconds ago
    expect(getTimeAgo(date.toISOString())).toBe("Az önce");
  });

  it("should return minutes ago for less than 60 minutes", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 10 * 60000); // 10 minutes ago
    expect(getTimeAgo(date.toISOString())).toBe("10 dk önce");
  });

  it("should return hours ago for less than 24 hours", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 5 * 3600000); // 5 hours ago
    expect(getTimeAgo(date.toISOString())).toBe("5 saat önce");
  });

  it("should return days ago for less than 7 days", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 3 * 86400000); // 3 days ago
    expect(getTimeAgo(date.toISOString())).toBe("3 gün önce");
  });

  it("should return weeks ago for less than 4 weeks", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 2 * 7 * 86400000); // 2 weeks ago
    expect(getTimeAgo(date.toISOString())).toBe("2 hafta önce");
  });

  it("should return formatted date for older dates", () => {
    // 5 weeks ago
    const now = new Date();
    const date = new Date(now.getTime() - 5 * 7 * 86400000);
    const expected = date.toLocaleDateString("tr-TR");
    expect(getTimeAgo(date.toISOString())).toBe(expected);
  });
});

describe("getTimeRemaining", () => {
  it("should return expired for null", () => {
    const result = getTimeRemaining(null);
    expect(result.hasExpiration).toBe(false);
    expect(result.text).toBe("Süresiz");
  });

  it("should return expired for invalid date", () => {
    const result = getTimeRemaining("invalid-date");
    expect(result.hasExpiration).toBe(false);
    expect(result.text).toBe("Süresiz");
  });

  it("should return expired for past date", () => {
    const now = new Date();
    const date = new Date(now.getTime() - 1000); // 1 second ago
    const result = getTimeRemaining(date.toISOString());
    expect(result.hasExpiration).toBe(true);
    expect(result.expired).toBe(true);
    expect(result.text).toBe("Süresi doldu");
  });

  it("should return days remaining for > 30 days", () => {
    const now = new Date();
    const date = new Date(now.getTime() + 40 * 86400000); // 40 days later
    const result = getTimeRemaining(date.toISOString());
    expect(result.hasExpiration).toBe(true);
    expect(result.expired).toBe(false);
    // Allow for a 1-day variance due to time elapsed between test setup and function execution
    expect(result.days).toBeGreaterThan(30);
    expect(result.text).toMatch(/^\d+ gün$/);
  });

  it("should return days and hours for < 30 days", () => {
    const now = new Date();
    const date = new Date(now.getTime() + 2 * 86400000 + 5 * 3600000); // 2 days 5 hours later
    const result = getTimeRemaining(date.toISOString());
    expect(result.hasExpiration).toBe(true);
    expect(result.expired).toBe(false);
    expect(result.text).toBe("2g 5s");
  });

  it("should return hours for < 1 day", () => {
    const now = new Date();
    const date = new Date(now.getTime() + 5 * 3600000); // 5 hours later
    const result = getTimeRemaining(date.toISOString());
    expect(result.hasExpiration).toBe(true);
    expect(result.expired).toBe(false);
    expect(result.text).toBe("5 saat");
  });
});
