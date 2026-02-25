import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isCurrentUserAdmin())) {
    redirect("/");
  }

  return <>{children}</>;
}
