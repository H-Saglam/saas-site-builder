import { Resend } from "resend";
import {
  buildAdminSaleAlertTemplate,
  buildDraftReminderEmailTemplate,
  buildEditWindowReminderEmailTemplate,
  buildPaymentSuccessEmailTemplate,
  buildSiteExpirationWarningEmailTemplate,
  buildWelcomeEmailTemplate,
} from "./templates";
import { getAdminSalesRecipients, getAppBaseUrl, getResendFromEmail } from "./config";
import { getEmailTemplateContent } from "./overrides";

let cachedClient: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing environment variable: RESEND_API_KEY");
  }

  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }

  return cachedClient;
}

async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResendClient();
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const cleanedRecipients = recipients.map((email) => email.trim()).filter((email) => email.length > 0);

  if (cleanedRecipients.length === 0) {
    throw new Error("Email alicisi bos olamaz");
  }

  const response = await resend.emails.send({
    from: getResendFromEmail(),
    to: cleanedRecipients,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (response.error) {
    throw new Error(response.error.message || "Resend email gonderimi basarisiz");
  }

  return response.data;
}

export async function sendWelcomeEmail(params: { to: string; firstName?: string | null }) {
  const content = await getEmailTemplateContent("welcome");
  const template = buildWelcomeEmailTemplate({
    firstName: params.firstName ?? null,
    dashboardUrl: `${getAppBaseUrl()}/dashboard`,
  }, content);

  return sendEmail({
    to: params.to,
    ...template,
  });
}

export async function sendPaymentSuccessEmail(params: {
  to: string;
  firstName?: string | null;
  recipientName: string;
  packageType: "standard" | "premium";
  amountTRY: number;
  liveSiteUrl: string;
}) {
  const content = await getEmailTemplateContent("payment_success");
  const template = buildPaymentSuccessEmailTemplate({
    firstName: params.firstName ?? null,
    recipientName: params.recipientName,
    packageType: params.packageType,
    amountTRY: params.amountTRY,
    liveSiteUrl: params.liveSiteUrl,
  }, content);

  return sendEmail({
    to: params.to,
    ...template,
  });
}

export async function sendAdminSaleAlertEmail(params: {
  customerEmail: string;
  amountTRY: number;
  packageType: "standard" | "premium";
  liveSiteUrl: string;
  siteId: string;
  orderId: string;
}) {
  const recipients = getAdminSalesRecipients();
  if (recipients.length === 0) {
    console.warn("Admin sales alert skipped: no admin recipient configured.");
    return null;
  }

  const content = await getEmailTemplateContent("admin_sale_alert");
  const template = buildAdminSaleAlertTemplate({
    customerEmail: params.customerEmail,
    amountTRY: params.amountTRY,
    packageType: params.packageType,
    liveSiteUrl: params.liveSiteUrl,
    siteId: params.siteId,
    orderId: params.orderId,
  }, content);

  return sendEmail({
    to: recipients,
    ...template,
  });
}

export async function sendSiteExpirationWarningEmail(params: {
  to: string;
  firstName?: string | null;
  recipientName: string;
  daysLeft: number;
  expiresAt: string;
  liveSiteUrl: string;
}) {
  const content = await getEmailTemplateContent("site_expiration_warning");
  const template = buildSiteExpirationWarningEmailTemplate({
    firstName: params.firstName ?? null,
    recipientName: params.recipientName,
    daysLeft: params.daysLeft,
    expiresAt: params.expiresAt,
    liveSiteUrl: params.liveSiteUrl,
    dashboardUrl: `${getAppBaseUrl()}/dashboard`,
  }, content);

  return sendEmail({
    to: params.to,
    ...template,
  });
}

export async function sendEditWindowReminderEmail(params: {
  to: string;
  firstName?: string | null;
  recipientName: string;
  daysLeft: number;
  editDeadline: string;
  editorUrl: string;
}) {
  const content = await getEmailTemplateContent("edit_window_reminder");
  const template = buildEditWindowReminderEmailTemplate({
    firstName: params.firstName ?? null,
    recipientName: params.recipientName,
    daysLeft: params.daysLeft,
    editDeadline: params.editDeadline,
    editorUrl: params.editorUrl,
  }, content);

  return sendEmail({
    to: params.to,
    ...template,
  });
}

export async function sendDraftReminderEmail(params: {
  to: string;
  firstName?: string | null;
  recipientName: string;
  draftAgeHours: number;
}) {
  const content = await getEmailTemplateContent("draft_reminder");
  const template = buildDraftReminderEmailTemplate({
    firstName: params.firstName ?? null,
    recipientName: params.recipientName,
    draftAgeHours: params.draftAgeHours,
    dashboardUrl: `${getAppBaseUrl()}/dashboard`,
  }, content);

  return sendEmail({
    to: params.to,
    ...template,
  });
}
