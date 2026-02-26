import { describe, it, expect, mock } from "bun:test";

// Mock dependencies to avoid runtime errors during import
mock.module("@clerk/nextjs/server", () => ({
  clerkMiddleware: (handler: any) => handler,
  createRouteMatcher: (routes: string[]) => (req: any) => false,
  auth: () => Promise.resolve({ userId: "test-user" }), // Add auth to prevent breakage in other tests
}));

mock.module("next/server", () => ({
  NextResponse: {
    redirect: (url: any) => ({ url }),
    next: () => ({}),
  },
}));

// Import the middleware config
// We use require because we want to test the exports after mocking
const { config } = await import("./middleware");

describe("Middleware Configuration", () => {
  it("should verify middleware.ts exists and exports config", () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });

  it("should have a matcher configuration", () => {
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
  });

  it("should include API routes in the matcher", () => {
    const matcher = config.matcher as string[];
    const apiRoutePattern = "/(api|trpc)(.*)";
    expect(matcher).toContain(apiRoutePattern);
  });

  it("should exclude static files and _next internals", () => {
    const matcher = config.matcher as string[];
    const staticFilePattern = "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)";
    expect(matcher).toContain(staticFilePattern);
  });
});
