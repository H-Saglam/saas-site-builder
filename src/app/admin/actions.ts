"use server";

import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin-auth";

type SupportedStatus = "active" | "draft";

function resolveStatus(value: string): SupportedStatus | null {
  if (value === "active" || value === "draft") return value;
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

  const supabase = getServiceSupabase();
  const updatedAt = new Date().toISOString();

  const updatePayload: {
    status: SupportedStatus;
    package_type?: "standard" | "premium";
    expires_at: string | null;
    updated_at: string;
  } = {
    status: normalizedStatus,
    expires_at: null,
    updated_at: updatedAt,
  };

  if (isPremium) {
    updatePayload.status = "active";
    updatePayload.package_type = "premium";
    updatePayload.expires_at = null;
  } else if (normalizedStatus === "active") {
    updatePayload.package_type = "standard";
    updatePayload.expires_at = buildStandardExpiry();
  } else {
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
