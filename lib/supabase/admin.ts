import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import type { Database } from "@/types/supabase";

// Service-role client for the admin console only. Bypasses RLS entirely —
// every table's RLS policies scope reads to the authenticated user's own
// rows (see supabase/migrations), which is correct for the traveler-facing
// app but wrong for an internal tool that must see every partner, user, and
// booking. `import "server-only"` makes any accidental client-component
// import a build error rather than a leaked secret.
//
// Every call site MUST already be behind requireAdmin() (lib/admin-auth.ts)
// — this client itself enforces no authorization, only bypasses RLS.
export function createAdminClient() {
  if (!env.supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. The admin console cannot read " +
        "partner/user/booking data without it — set it in your environment " +
        "(never commit it, never expose it to the browser).",
    );
  }

  return createSupabaseClient<Database>(
    env.supabaseUrl,
    env.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
