import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { env } from "./config/env";

// Admin authorization is an email allowlist, not a schema-backed role — see
// config/env.ts for why. This is the same check lib/admin-auth.ts makes for
// defense-in-depth (Server Actions bypass rendering but not middleware, and
// vice versa: a layout redirect can't always issue a true HTTP status code
// once streaming has started — see lib/supabase/middleware.ts).
function isAuthorizedAdmin(email: string | undefined | null) {
  return !!email && env.adminEmails.includes(email.toLowerCase());
}

// TEMPORARY diagnostic logging — see lib/supabase/middleware.ts for why.
// Remove once the exact throwing statement is identified.
export async function middleware(request: NextRequest) {
  console.log(
    `[DIAG middleware] step=start runtime=${process.env.NEXT_RUNTIME} url=${request.nextUrl.pathname}`,
  );

  let response;
  let user;
  try {
    console.log(
      `[DIAG middleware] step=updateSession:start url=${request.nextUrl.pathname}`,
    );
    const result = await updateSession(request);
    response = result.response;
    user = result.user;
    console.log(
      `[DIAG middleware] step=updateSession:ok hasUser=${!!user} url=${request.nextUrl.pathname}`,
    );
  } catch (error) {
    console.error("[DIAG middleware] THROW step=updateSession", {
      runtime: process.env.NEXT_RUNTIME,
      url: request.nextUrl.pathname,
      module: "middleware.ts",
      function: "middleware",
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";
  console.log(
    `[DIAG middleware] step=redirect-decision isAdminRoute=${isAdminRoute} isAdminLoginRoute=${isAdminLoginRoute} url=${pathname}`,
  );

  if (isAdminRoute && !isAdminLoginRoute && !isAuthorizedAdmin(user?.email)) {
    const loginUrl = new URL("/admin/login", request.url);
    if (user && !isAuthorizedAdmin(user.email)) {
      loginUrl.searchParams.set("error", "not_authorized");
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Carry over the session cookies updateSession() may have just
    // refreshed, so a rejected request doesn't discard a valid refresh.
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    console.log(
      `[DIAG middleware] step=exit action=redirect-to-login url=${pathname}`,
    );
    return redirectResponse;
  }

  console.log(
    `[DIAG middleware] step=exit action=pass-through url=${pathname}`,
  );
  return response;
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
