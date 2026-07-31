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
  // Server-only. Never imported from client components. Undefined until a
  // server action or route handler actually needs privileged Supabase
  // access (none does yet in this foundation).
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
