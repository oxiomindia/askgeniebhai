import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const db = createAdminClient();

  const [
    { count: totalPartners },
    { count: totalLocations },
    { data: verifiedLocationRows },
    { count: activeServices },
    { count: todaysBookings },
  ] = await Promise.all([
    db.from("partners").select("*", { count: "exact", head: true }),
    db.from("partner_locations").select("*", { count: "exact", head: true }),
    db.from("verification").select("partner_location_id"),
    db
      .from("partner_services")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    db
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      ),
  ]);

  const verifiedLocationCount = new Set(
    (verifiedLocationRows ?? []).map((row) => row.partner_location_id),
  ).size;
  const pendingVerifications = Math.max(
    (totalLocations ?? 0) - verifiedLocationCount,
    0,
  );

  return {
    totalPartners: totalPartners ?? 0,
    pendingVerifications,
    activeServices: activeServices ?? 0,
    todaysBookings: todaysBookings ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Commercial Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Operational overview of the Ask Genie Bhai partner network.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Partners" value={stats.totalPartners} />
        <StatCard
          label="Pending Verifications"
          value={stats.pendingVerifications}
          hint="Locations with no verification record yet"
        />
        <StatCard label="Active Services" value={stats.activeServices} />
        <StatCard label="Today's Bookings" value={stats.todaysBookings} />
        <StatCard
          label="Revenue"
          value="—"
          hint="Not tracked yet — payments are Phase 2 (Razorpay, see ROADMAP.md)"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/verifications">Review Verification Queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/partners">View Partners</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/bookings">View Bookings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
