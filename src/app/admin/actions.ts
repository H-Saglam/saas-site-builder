"use server";

import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin-auth";

type SupportedStatus = "active" | "premium" | "draft";

function resolveStatus(value: string): SupportedStatus | null {
  if (value === "active" || value === "premium" || value === "draft") return value;
  return null;
}

function buildStandardExpiry(): string {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt.toISOString();
}

export async function updateSiteStatus(siteId: string, newStatus: string, isPremium: boolean) {
  if (!(await isCurrentUserAdmin())) {
    throw new Error("Bu işlem için admin yetkisi gerekli.");
  }

  const normalizedSiteId = siteId?.trim();
  if (!normalizedSiteId) {
    throw new Error("Geçersiz site ID.");
  }

  const normalizedStatus = resolveStatus(newStatus);
  if (!normalizedStatus) {
    throw new Error("Desteklenmeyen site durumu.");
  }
  if (isPremium && normalizedStatus === "draft") {
    throw new Error("Premium yalnızca premium/aktif durum ile kullanılabilir.");
  }
  if (!isPremium && normalizedStatus === "premium") {
    throw new Error("Premium durum için premium aksiyonu kullanılmalı.");
  }

  const supabase = getServiceSupabase();
  const updatedAt = new Date().toISOString();

  const updatePayload: {
    status: SupportedStatus;
    package_type?: "standard" | "premium";
    published_at: string | null;
    expires_at: string | null;
    updated_at: string;
  } = {
    status: normalizedStatus === "premium" ? "active" : normalizedStatus,
    published_at: null,
    expires_at: null,
    updated_at: updatedAt,
  };

  if (isPremium) {
    // Public site rendering currently expects "active" to allow site access.
    updatePayload.status = "active";
    updatePayload.package_type = "premium";
    updatePayload.published_at = updatedAt;
    updatePayload.expires_at = null;
  } else if (normalizedStatus === "active") {
    updatePayload.package_type = "standard";
    updatePayload.published_at = updatedAt;
    updatePayload.expires_at = buildStandardExpiry();
  } else {
    updatePayload.published_at = null;
    updatePayload.expires_at = null;
  }

  const { data, error } = await supabase
    .from("sites")
    .update(updatePayload)
    .eq("id", normalizedSiteId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Admin site status update error:", error);
    throw new Error("Site durumu güncellenemedi.");
  }

  if (!data) {
    throw new Error("Site bulunamadı.");
  }

  revalidatePath("/admin");
}
