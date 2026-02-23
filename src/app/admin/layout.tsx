import type { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function getAllowedAdminEmails(): string[] {
  const rawEmails = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return rawEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

function getPrimaryEmail(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): string | null {
  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ?? user.emailAddresses[0];
  return primaryEmail?.emailAddress?.toLowerCase() ?? null;
}

function hasAdminMetadataFlag(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): boolean {
  // Only privateMetadata is trusted for admin authorization.
  const privateMetadata = user.privateMetadata as { isAdmin?: boolean } | null;

  return privateMetadata?.isAdmin === true;
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const allowedAdminEmails = getAllowedAdminEmails();
  const primaryEmail = getPrimaryEmail(user);
  const isAdminByEmail = primaryEmail ? allowedAdminEmails.includes(primaryEmail) : false;
  const isAdminByMetadata = hasAdminMetadataFlag(user);

  if (!isAdminByEmail && !isAdminByMetadata) {
    redirect("/");
  }

  return <>{children}</>;
}
