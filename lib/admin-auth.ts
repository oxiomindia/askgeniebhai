import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/config/env";
import type { User } from "@supabase/supabase-js";

export type AdminUser = Pick<User, "id" | "email">;

// Authentication is Supabase Auth (a real signed-in session). Authorization
// is the email allowlist in ADMIN_EMAILS — see config/env.ts for why this
// isn't a schema-backed role. Every admin page/layout must call this before
// rendering or acting on any admin data.
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/admin/login");
  }

  if (!env.adminEmails.includes(user.email.toLowerCase())) {
    redirect("/admin/login?error=not_authorized");
  }

  return { id: user.id, email: user.email };
}
