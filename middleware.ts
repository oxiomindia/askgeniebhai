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

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";

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
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
