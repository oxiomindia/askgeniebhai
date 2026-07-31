// Environment variable validation. Fails fast with a clear error instead of
// letting a missing variable surface as a confusing runtime error deep in a
// Supabase client. Names match docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md
// § Environment Variables, with the NEXT_PUBLIC_ prefix Next.js requires to
// expose a variable to the browser bundle.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  // Server-only. Never imported from client components. Required by
  // lib/supabase/admin.ts to bypass RLS for admin-console reads (partner,
  // user, and booking rows outside the current user's own rows) — checked
  // there, not here, so pages that don't need it still build without it.
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  // Server-only. Comma-separated allowlist of admin emails, checked against
  // the authenticated user in lib/admin-auth.ts. Authorization only —
  // authentication is still Supabase Auth. No admin role/flag exists in the
  // schema (see docs/adr/0001_PROJECT_FOUNDATION.md's "do not modify
  // schema" constraint), so this is the non-schema-changing alternative.
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
} as const;
