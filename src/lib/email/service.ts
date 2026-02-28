import { Resend } from "resend";
import {
  buildAdminSaleAlertTemplate,
  buildPaymentSuccessEmailTemplate,
  buildWelcomeEmailTemplate,
} from "./templates";
import { getAdminSalesRecipients, getAppBaseUrl, getResendFromEmail } from "./config";

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
  const template = buildWelcomeEmailTemplate({
    firstName: params.firstName ?? null,
    dashboardUrl: `${getAppBaseUrl()}/dashboard`,
  });

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
  const template = buildPaymentSuccessEmailTemplate({
    firstName: params.firstName ?? null,
    recipientName: params.recipientName,
    packageType: params.packageType,
    amountTRY: params.amountTRY,
    liveSiteUrl: params.liveSiteUrl,
  });

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

  const template = buildAdminSaleAlertTemplate({
    customerEmail: params.customerEmail,
    amountTRY: params.amountTRY,
    packageType: params.packageType,
    liveSiteUrl: params.liveSiteUrl,
    siteId: params.siteId,
    orderId: params.orderId,
  });

  return sendEmail({
    to: recipients,
    ...template,
  });
}
