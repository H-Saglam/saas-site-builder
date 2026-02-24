import { EDIT_WINDOW_DAYS, getEditDeadline } from "@/lib/date-utils";
import {
  sendDraftReminderEmail,
  sendEditWindowReminderEmail,
  sendSiteExpirationWarningEmail,
} from "@/lib/email";
import { getAppBaseUrl } from "@/lib/email/config";
import { getUserPrimaryEmailById } from "@/lib/clerk-users";
import { getServiceSupabase } from "@/lib/supabase";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;
const EXPIRATION_WARNING_DAYS = [7, 3, 1] as const;
const EDIT_REMINDER_DAYS = 1;
const DRAFT_REMINDER_AFTER_HOURS = 24;
const DRAFT_REMINDER_LOOKBACK_DAYS = 30;
const RETENTION_QUERY_LIMIT = 500;
const STALE_PROCESSING_LOCK_HOURS = 2;

type RetentionNotificationType =
  | "expiration_warning_7d"
  | "expiration_warning_3d"
  | "expiration_warning_1d"
  | "edit_window_reminder_1d"
  | "draft_reminder_24h";

interface RetentionSiteRow {
  id: string;
  user_id: string;
  slug: string;
  recipient_name: string;
  expires_at: string | null;
  published_at: string | null;
  created_at: string;
}

interface NotificationStats {
  scanned: number;
  eligible: number;
  sent: number;
  duplicate: number;
  skippedNoEmail: number;
  skippedRule: number;
  failed: number;
}

export interface RetentionJobReport {
  startedAt: string;
  finishedAt: string;
  cleanupReleasedLocks: number;
  expirationWarnings: NotificationStats;
  editWindowReminders: NotificationStats;
  draftReminders: NotificationStats;
  totalSent: number;
  totalFailed: number;
  errors: string[];
}

function buildEmptyStats(): NotificationStats {
  return {
    scanned: 0,
    eligible: 0,
    sent: 0,
    duplicate: 0,
    skippedNoEmail: 0,
    skippedRule: 0,
    failed: 0,
  };
}

function isDuplicateKeyError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

function isMissingTableError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "42P01";
}

function resolveExpirationNotificationType(daysLeft: number): RetentionNotificationType | null {
  switch (daysLeft) {
    case 7:
      return "expiration_warning_7d";
    case 3:
      return "expiration_warning_3d";
    case 1:
      return "expiration_warning_1d";
    default:
      return null;
  }
}

function daysUntil(dateInput: string, now: Date): number | null {
  const target = new Date(dateInput);
  if (Number.isNaN(target.getTime())) return null;

  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / DAY_IN_MS);
}

function draftAgeInHours(createdAt: string, now: Date): number | null {
  const createdAtDate = new Date(createdAt);
  if (Number.isNaN(createdAtDate.getTime())) return null;

  const diff = now.getTime() - createdAtDate.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / HOUR_IN_MS);
}

function safeRecipientName(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : "Sevdigin";
}

async function cleanupStaleNotificationLocks(): Promise<number> {
  const supabase = getServiceSupabase();
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_LOCK_HOURS * HOUR_IN_MS).toISOString();

  const { data, error } = await supabase
    .from("site_notification_events")
    .delete()
    .eq("status", "processing")
    .lt("created_at", staleBefore)
    .select("id");

  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("site_notification_events tablosu bulunamadı. Migration çalıştırın.");
    }

    throw new Error(`Stale lock temizleme başarısız: ${error.message}`);
  }

  return Array.isArray(data) ? data.length : 0;
}

async function reserveNotification(input: {
  siteId: string;
  notificationType: RetentionNotificationType;
  triggerKey: string;
  metadata: Record<string, string | number | boolean | null>;
}): Promise<string | null> {
  const supabase = getServiceSupabase();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("site_notification_events")
    .insert({
      site_id: input.siteId,
      notification_type: input.notificationType,
      trigger_key: input.triggerKey,
      status: "processing",
      metadata: input.metadata,
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (isDuplicateKeyError(error)) return null;
    if (isMissingTableError(error)) {
      throw new Error("site_notification_events tablosu bulunamadı. Migration çalıştırın.");
    }

    throw new Error(`Notification reserve başarısız: ${error.message}`);
  }

  return (data as { id: string } | null)?.id ?? null;
}

async function markNotificationSent(notificationId: string, recipientEmail: string): Promise<void> {
  const supabase = getServiceSupabase();
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("site_notification_events")
    .update({
      status: "sent",
      recipient_email: recipientEmail,
      sent_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", notificationId);

  if (error) {
    throw new Error(`Notification sent güncellemesi başarısız: ${error.message}`);
  }
}

async function releaseNotification(notificationId: string): Promise<void> {
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("site_notification_events")
    .delete()
    .eq("id", notificationId);

  if (error && !isMissingTableError(error)) {
    console.error("Notification release başarısız:", error);
  }
}

async function fetchExpirationCandidates(now: Date): Promise<RetentionSiteRow[]> {
  const supabase = getServiceSupabase();
  const maxExpiry = new Date(now.getTime() + 8 * DAY_IN_MS).toISOString();

  const { data, error } = await supabase
    .from("sites")
    .select("id, user_id, slug, recipient_name, expires_at, published_at, created_at")
    .eq("status", "active")
    .not("expires_at", "is", null)
    .gt("expires_at", now.toISOString())
    .lte("expires_at", maxExpiry)
    .order("expires_at", { ascending: true })
    .limit(RETENTION_QUERY_LIMIT);

  if (error) {
    throw new Error(`Expiration adayları çekilemedi: ${error.message}`);
  }

  return (data as RetentionSiteRow[]) ?? [];
}

async function fetchEditWindowCandidates(now: Date): Promise<RetentionSiteRow[]> {
  const supabase = getServiceSupabase();
  const minPublishedAt = new Date(now.getTime() - EDIT_WINDOW_DAYS * DAY_IN_MS).toISOString();

  const { data, error } = await supabase
    .from("sites")
    .select("id, user_id, slug, recipient_name, expires_at, published_at, created_at")
    .eq("status", "active")
    .not("published_at", "is", null)
    .gte("published_at", minPublishedAt)
    .lte("published_at", now.toISOString())
    .order("published_at", { ascending: true })
    .limit(RETENTION_QUERY_LIMIT);

  if (error) {
    throw new Error(`Edit reminder adayları çekilemedi: ${error.message}`);
  }

  return (data as RetentionSiteRow[]) ?? [];
}

async function fetchDraftCandidates(now: Date): Promise<RetentionSiteRow[]> {
  const supabase = getServiceSupabase();
  const oldestCreatedAt = new Date(now.getTime() - DRAFT_REMINDER_LOOKBACK_DAYS * DAY_IN_MS).toISOString();
  const newestCreatedAt = new Date(now.getTime() - DRAFT_REMINDER_AFTER_HOURS * HOUR_IN_MS).toISOString();

  const { data, error } = await supabase
    .from("sites")
    .select("id, user_id, slug, recipient_name, expires_at, published_at, created_at")
    .eq("status", "draft")
    .gte("created_at", oldestCreatedAt)
    .lte("created_at", newestCreatedAt)
    .order("created_at", { ascending: true })
    .limit(RETENTION_QUERY_LIMIT);

  if (error) {
    throw new Error(`Draft reminder adayları çekilemedi: ${error.message}`);
  }

  return (data as RetentionSiteRow[]) ?? [];
}

function createRecipientResolver() {
  const cache = new Map<string, { email: string | null; firstName: string | null }>();

  return async function resolveRecipient(userId: string): Promise<{ email: string | null; firstName: string | null }> {
    if (cache.has(userId)) {
      return cache.get(userId)!;
    }

    try {
      const recipient = await getUserPrimaryEmailById(userId);
      cache.set(userId, recipient);
      return recipient;
    } catch (error) {
      console.error("Kullanıcı email çözümlenemedi:", { userId, error });
      const fallback = { email: null, firstName: null };
      cache.set(userId, fallback);
      return fallback;
    }
  };
}

async function dispatchNotification(input: {
  site: RetentionSiteRow;
  notificationType: RetentionNotificationType;
  triggerKey: string;
  metadata: Record<string, string | number | boolean | null>;
  stats: NotificationStats;
  errors: string[];
  resolveRecipient: (userId: string) => Promise<{ email: string | null; firstName: string | null }>;
  onSend: (recipient: { email: string; firstName: string | null }) => Promise<void>;
}) {
  input.stats.eligible += 1;

  const recipient = await input.resolveRecipient(input.site.user_id);
  const email = recipient.email?.trim();
  if (!email) {
    input.stats.skippedNoEmail += 1;
    return;
  }

  let reservationId: string | null = null;
  let emailSent = false;

  try {
    reservationId = await reserveNotification({
      siteId: input.site.id,
      notificationType: input.notificationType,
      triggerKey: input.triggerKey,
      metadata: input.metadata,
    });

    if (!reservationId) {
      input.stats.duplicate += 1;
      return;
    }

    await input.onSend({ email, firstName: recipient.firstName ?? null });
    emailSent = true;
    await markNotificationSent(reservationId, email);
    input.stats.sent += 1;
  } catch (error) {
    if (reservationId && !emailSent) {
      await releaseNotification(reservationId);
    }

    input.stats.failed += 1;
    input.errors.push(
      `${input.notificationType} (${input.site.id}) gönderilemedi: ${(error as Error)?.message ?? "Bilinmeyen hata"}`
    );
  }
}

export async function runRetentionNotificationsJob(): Promise<RetentionJobReport> {
  const startedAt = new Date();
  const now = new Date();
  const appBaseUrl = getAppBaseUrl();
  const resolveRecipient = createRecipientResolver();

  const expirationWarnings = buildEmptyStats();
  const editWindowReminders = buildEmptyStats();
  const draftReminders = buildEmptyStats();
  const errors: string[] = [];

  const cleanupReleasedLocks = await cleanupStaleNotificationLocks();

  const expirationCandidates = await fetchExpirationCandidates(now);
  expirationWarnings.scanned = expirationCandidates.length;

  for (const site of expirationCandidates) {
    if (!site.expires_at) {
      expirationWarnings.skippedRule += 1;
      continue;
    }

    const daysLeft = daysUntil(site.expires_at, now);
    if (!daysLeft || !EXPIRATION_WARNING_DAYS.includes(daysLeft as (typeof EXPIRATION_WARNING_DAYS)[number])) {
      expirationWarnings.skippedRule += 1;
      continue;
    }

    const notificationType = resolveExpirationNotificationType(daysLeft);
    if (!notificationType) {
      expirationWarnings.skippedRule += 1;
      continue;
    }

    const liveSiteUrl = `${appBaseUrl}/${site.slug}`;

    await dispatchNotification({
      site,
      notificationType,
      triggerKey: `${site.expires_at}|${daysLeft}`,
      metadata: {
        days_left: daysLeft,
        expires_at: site.expires_at,
        slug: site.slug,
      },
      stats: expirationWarnings,
      errors,
      resolveRecipient,
      onSend: async ({ email, firstName }) => {
        await sendSiteExpirationWarningEmail({
          to: email,
          firstName,
          recipientName: safeRecipientName(site.recipient_name),
          daysLeft,
          expiresAt: site.expires_at!,
          liveSiteUrl,
        });
      },
    });
  }

  const editCandidates = await fetchEditWindowCandidates(now);
  editWindowReminders.scanned = editCandidates.length;

  for (const site of editCandidates) {
    const editDeadline = getEditDeadline(site.published_at);
    if (!editDeadline) {
      editWindowReminders.skippedRule += 1;
      continue;
    }

    const daysLeft = daysUntil(editDeadline, now);
    if (daysLeft !== EDIT_REMINDER_DAYS) {
      editWindowReminders.skippedRule += 1;
      continue;
    }

    const editorUrl = `${appBaseUrl}/dashboard/editor/${site.id}`;

    await dispatchNotification({
      site,
      notificationType: "edit_window_reminder_1d",
      triggerKey: `${editDeadline}|${EDIT_REMINDER_DAYS}`,
      metadata: {
        days_left: daysLeft,
        edit_deadline: editDeadline,
        slug: site.slug,
      },
      stats: editWindowReminders,
      errors,
      resolveRecipient,
      onSend: async ({ email, firstName }) => {
        await sendEditWindowReminderEmail({
          to: email,
          firstName,
          recipientName: safeRecipientName(site.recipient_name),
          daysLeft,
          editDeadline,
          editorUrl,
        });
      },
    });
  }

  const draftCandidates = await fetchDraftCandidates(now);
  draftReminders.scanned = draftCandidates.length;

  for (const site of draftCandidates) {
    const draftAgeHours = draftAgeInHours(site.created_at, now);
    if (draftAgeHours === null || draftAgeHours < DRAFT_REMINDER_AFTER_HOURS) {
      draftReminders.skippedRule += 1;
      continue;
    }

    await dispatchNotification({
      site,
      notificationType: "draft_reminder_24h",
      triggerKey: `${site.created_at}|24h`,
      metadata: {
        draft_age_hours: draftAgeHours,
        created_at: site.created_at,
        slug: site.slug,
      },
      stats: draftReminders,
      errors,
      resolveRecipient,
      onSend: async ({ email, firstName }) => {
        await sendDraftReminderEmail({
          to: email,
          firstName,
          recipientName: safeRecipientName(site.recipient_name),
          draftAgeHours,
        });
      },
    });
  }

  const finishedAt = new Date();

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    cleanupReleasedLocks,
    expirationWarnings,
    editWindowReminders,
    draftReminders,
    totalSent: expirationWarnings.sent + editWindowReminders.sent + draftReminders.sent,
    totalFailed: expirationWarnings.failed + editWindowReminders.failed + draftReminders.failed,
    errors,
  };
}
