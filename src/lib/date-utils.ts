export function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffWeeks < 4) return `${diffWeeks} hafta önce`;
  return date.toLocaleDateString("tr-TR");
}

export function getTimeRemaining(expiresAtValue: string | null): {
  hasExpiration: boolean;
  expired: boolean;
  text: string;
  days: number;
} {
  if (!expiresAtValue) {
    return {
      hasExpiration: false,
      expired: false,
      text: "Süresiz",
      days: Number.POSITIVE_INFINITY,
    };
  }

  const expiresAt = new Date(expiresAtValue);
  if (Number.isNaN(expiresAt.getTime())) {
    return {
      hasExpiration: false,
      expired: false,
      text: "Süresiz",
      days: Number.POSITIVE_INFINITY,
    };
  }

  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return { hasExpiration: true, expired: true, text: "Süresi doldu", days: 0 };

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 30) return { hasExpiration: true, expired: false, text: `${days} gün`, days };
  if (days > 0) return { hasExpiration: true, expired: false, text: `${days}g ${hours}s`, days };
  return { hasExpiration: true, expired: false, text: `${Math.max(1, hours)} saat`, days };
}
