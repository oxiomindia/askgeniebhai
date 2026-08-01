import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

// Phase 1 of the middleware rebuild (Build 009B): session refresh only.
// No redirects, no admin route protection, no ADMIN_EMAILS. Added back
// incrementally in later phases, each behind its own verification gate.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
