import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

// Static, per the Master Blueprint — not a database-backed toggle system.
// See docs/00_ASK_GENIE_BHAI_BLUEPRINT.md § Canonical Technology Stack and
// § Non-Goals for why each of these is off.
const FEATURE_FLAGS = [
  {
    name: "Payments (Razorpay)",
    enabled: false,
    note: "Phase 2 — see ROADMAP.md",
  },
  { name: "Partner self-service dashboard", enabled: false, note: "Phase 2" },
  { name: "Push notifications", enabled: false, note: "Phase 2" },
  { name: "Maps / location discovery", enabled: false, note: "Phase 3" },
  { name: "AI-driven recommendations", enabled: false, note: "Phase 3" },
  {
    name: "Anonymous sign-in",
    enabled: false,
    note: "Disabled per FLUTTERFLOW_SUPABASE_FOUNDATION.md",
  },
] as const;

async function checkSupabaseHealth() {
  try {
    const db = createAdminClient();
    const { error } = await db
      .from("partners")
      .select("id", { count: "exact", head: true });
    return error
      ? { ok: false, message: error.message }
      : { ok: true, message: "" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export default async function AdminSettingsPage() {
  const health = await checkSupabaseHealth();
  const vercelEnv = process.env.VERCEL_ENV ?? "local";
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">System Configuration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">Version</p>
            <p>{packageJson.version}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Environment</p>
            <p>{vercelEnv}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Commit</p>
            <p className="font-mono">
              {commitSha ? commitSha.slice(0, 7) : "local"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Supabase health</p>
            <Badge variant={health.ok ? "success" : "destructive"}>
              {health.ok ? "OK" : "Error"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm">
            {FEATURE_FLAGS.map((flag) => (
              <li key={flag.name} className="flex items-center justify-between">
                <span>{flag.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {flag.note}
                  </span>
                  <Badge variant="secondary">off</Badge>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
