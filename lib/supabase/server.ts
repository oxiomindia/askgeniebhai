import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import type { Database } from "@/types/supabase";

// Creates a Supabase client scoped to the current request, using the
// anon/publishable key. RLS still governs what it can read/write. Never
// pass the service role key through this helper.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component that can't set cookies — safe to
          // ignore because middleware refreshes the session on every request.
        }
      },
    },
  });
}
