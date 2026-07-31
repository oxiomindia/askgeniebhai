import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../../config/env";
import type { Database } from "../../types/supabase";

// TEMPORARY: verbose, per-step diagnostic logging + a distinct log tag and
// re-thrown (not swallowed) errors on every block, added specifically to
// capture the exact throwing statement/stack for a live "ReferenceError:
// __dirname is not defined" in production that static/local investigation
// could not reproduce or locate. Remove once the exact line is identified
// and a real fix (or confirmation this file isn't the source) lands.
function logStep(step: string, request: NextRequest, extra?: object) {
  console.log(
    `[DIAG updateSession] step=${step} runtime=${process.env.NEXT_RUNTIME} url=${request.nextUrl.pathname}`,
    extra ?? {},
  );
}

function logThrow(step: string, request: NextRequest, error: unknown) {
  console.error(`[DIAG updateSession] THROW step=${step}`, {
    runtime: process.env.NEXT_RUNTIME,
    url: request.nextUrl.pathname,
    module: "lib/supabase/middleware.ts",
    function: "updateSession",
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
  });
}

// Refreshes the Supabase auth session on every matched request so server
// components always see a valid session, and returns the user so the
// caller (middleware.ts) can enforce route-level authorization — e.g. the
// admin console — with a true HTTP redirect before any rendering starts.
// A redirect issued later, inside a layout, can't always set the top-level
// status code once Next.js has begun streaming the shell; middleware runs
// before any of that, so it's the reliable place for this check.
export async function updateSession(request: NextRequest) {
  logStep("start", request);

  let supabaseResponse = NextResponse.next({ request });
  logStep("initial-response-created", request);

  logStep("env-check", request, {
    hasUrl: !!env.supabaseUrl,
    hasAnonKey: !!env.supabaseAnonKey,
  });

  let supabase;
  try {
    logStep("createServerClient:start", request);
    supabase = createServerClient<Database>(
      env.supabaseUrl,
      env.supabaseAnonKey,
      {
        cookies: {
          getAll() {
            try {
              logStep("cookies.getAll:start", request);
              const all = request.cookies.getAll();
              logStep("cookies.getAll:ok", request, { count: all.length });
              return all;
            } catch (error) {
              logThrow("cookies.getAll", request, error);
              throw error;
            }
          },
          setAll(cookiesToSet) {
            try {
              logStep("cookies.setAll:start", request, {
                count: cookiesToSet.length,
              });
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options),
              );
              logStep("cookies.setAll:ok", request);
            } catch (error) {
              logThrow("cookies.setAll", request, error);
              throw error;
            }
          },
        },
      },
    );
    logStep("createServerClient:ok", request);
  } catch (error) {
    logThrow("createServerClient", request, error);
    throw error;
  }

  let user;
  try {
    // Do not add logic between createServerClient and getUser — it
    // revalidates the session token and must run on every request this
    // middleware handles.
    logStep("getUser:start", request);
    const result = await supabase.auth.getUser();
    user = result.data.user;
    logStep("getUser:ok", request, { hasUser: !!user });
  } catch (error) {
    logThrow("getUser", request, error);
    throw error;
  }

  logStep("exit", request);
  return { response: supabaseResponse, user };
}
