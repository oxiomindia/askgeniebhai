import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../../config/env";
import type { Database } from "../../types/supabase";

// Refreshes the Supabase auth session on every matched request so server
// components always see a valid session, and returns the user so the
// caller (middleware.ts) can enforce route-level authorization — e.g. the
// admin console — with a true HTTP redirect before any rendering starts.
// A redirect issued later, inside a layout, can't always set the top-level
// status code once Next.js has begun streaming the shell; middleware runs
// before any of that, so it's the reliable place for this check.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add logic between createServerClient and getUser — it revalidates
  // the session token and must run on every request this middleware handles.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
