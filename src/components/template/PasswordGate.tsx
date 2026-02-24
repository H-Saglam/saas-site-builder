"use client";

import Link from "next/link";
import { useState } from "react";
import type { SlideGradient } from "@/lib/types";

interface PasswordGateProps {
  gradient: SlideGradient;
  slug: string;
  onVerified?: () => void;
}

export default function PasswordGate({ gradient, slug, onVerified }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (onVerified) {
          onVerified();
        } else {
          window.location.reload();
        }
      } else {
        setError(data.message || "Şifre yanlış");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("Bir hata oluştu, tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="password-gate"
      style={{
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      }}
    >
      <div className="lock-icon">🔒</div>
      <h2>Bu site şifre korumalıdır</h2>
      <p className="subtitle">Devam etmek için şifreyi girin</p>

      <form className="password-form" onSubmit={handleSubmit}>
        <input
          type="password"
          className={`password-input ${shake ? "shake" : ""}`}
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          disabled={isLoading}
        />
        <button type="submit" className="submit-btn" disabled={isLoading || !password.trim()}>
          {isLoading ? "Kontrol ediliyor..." : "Giriş"}
        </button>
        <div className="error-message">{error}</div>
      </form>

      <div className="branding">
        <Link href="/">💝 Özel Bir Anı ile oluşturuldu</Link>
      </div>
    </div>
  );
}
