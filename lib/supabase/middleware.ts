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

  // The session refresh below is wrapped defensively: middleware runs on
  // nearly every route (see the matcher in middleware.ts), so any exception
  // here — a Supabase-side failure, a bad config value, anything unforeseen
  // — must not take down the entire site. Falling back to `user: null` is
  // safe either way: the caller treats a missing user as unauthenticated,
  // which correctly still gates /admin while non-admin routes keep serving.
  try {
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

    // Do not add logic between createServerClient and getUser — it
    // revalidates the session token and must run on every request this
    // middleware handles.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { response: supabaseResponse, user };
  } catch (error) {
    console.error("updateSession: session refresh failed", error);
    return { response: supabaseResponse, user: null };
  }
}
