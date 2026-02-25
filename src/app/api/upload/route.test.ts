import { describe, it, expect, mock, spyOn, beforeEach, afterEach, type Mock } from "bun:test";

// Mock @clerk/nextjs/server
mock.module("@clerk/nextjs/server", () => ({
  auth: () => Promise.resolve({ userId: "test-user-id" }),
}));

// Mock @/lib/supabase
mock.module("@/lib/supabase", () => ({
  getServiceSupabase: () => ({}),
}));

// Mock next/server
mock.module("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      return {
        json: () => Promise.resolve(body),
        status: (init as { status?: number })?.status || 200,
      };
    },
  },
  NextRequest: class {},
}));

describe("POST /api/upload", () => {
  let consoleSpy: Mock<typeof console.error>;

  beforeEach(() => {
    consoleSpy = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should log error when request fails", async () => {
    // Import dynamically so mocks are applied
    const { POST } = await import("./route");

    // Create a mock request that throws when formData() is called
    const req = {
      formData: () => Promise.reject(new Error("Simulated FormData error")),
    } as unknown as Request;

    const res = await POST(req);

    // Check response status
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Yükleme hatası");

    // Check if console.error was called
    expect(consoleSpy).toHaveBeenCalled();
  });
});
