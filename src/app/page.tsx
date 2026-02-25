import type { Metadata } from "next";
import LandingPageContent from "@/components/LandingPageContent";

export const metadata: Metadata = {
  title: "Özel Bir Anı — Dijital Hikaye Siteleri",
  description:
    "Fotoğraflarınız, müzikleriniz ve özel mesajlarınızla Instagram Stories tarzında interaktif hikaye siteleri tasarlayın.",
};

export default function Home() {
  return <LandingPageContent />;
}
