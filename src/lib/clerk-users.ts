import { clerkClient } from "@clerk/nextjs/server";

export async function getUserPrimaryEmailById(userId: string): Promise<{ email: string | null; firstName: string | null }> {
  if (!userId || userId.trim().length === 0) {
    return { email: null, firstName: null };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primaryEmail =
    user.emailAddresses.find((emailAddress) => emailAddress.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];

  return {
    email: primaryEmail?.emailAddress ?? null,
    firstName: user.firstName ?? null,
  };
}
