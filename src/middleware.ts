import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Korunan rotalar — sadece giriş yapmış kullanıcılar erişebilir
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
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
