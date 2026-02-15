import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LoveSite — Sevdiklerinize Özel Dijital Hikayeler",
  description:
    "Sevdikleriniz için kişiselleştirilmiş, müzikli, animasyonlu dijital hikaye siteleri oluşturun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="tr">
        <body className={`${outfit.variable} antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
