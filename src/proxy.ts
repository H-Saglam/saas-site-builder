import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Korunan rotalar — sadece giriş yapmış kullanıcılar erişebilir
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    await auth.protect();
  }

  // Admin detay yetki kontrolü app/admin/layout.tsx içinde devam eder.
  // Burada en azından giriş yapmayan kullanıcıları ana sayfaya yönlendiriyoruz.
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Next.js internal dosyalarını ve static dosyaları atla
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API route'ları her zaman çalıştır
    "/(api|trpc)(.*)",
  ],
};
