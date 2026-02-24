import { auth, currentUser } from "@clerk/nextjs/server";

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

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  if (!user) return false;

  const allowedAdminEmails = getAllowedAdminEmails();
  const primaryEmail = getPrimaryEmail(user);
  const isAdminByEmail = primaryEmail ? allowedAdminEmails.includes(primaryEmail) : false;
  const isAdminByMetadata = hasAdminMetadataFlag(user);

  return isAdminByEmail || isAdminByMetadata;
}
