import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";

type StatusValue = Database["public"]["Enums"]["booking_status_value"];
type Category = Database["public"]["Enums"]["partner_category"];

const STATUS_LABELS: Record<StatusValue, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const CATEGORY_LABELS: Record<Category, string> = {
  freshen_up: "Freshen Up",
  bag_storage: "Keep My Bags",
  rest: "Rest",
  cab: "Book a Cab",
  room: "Book a Room",
};

function Bar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

async function getAnalytics() {
  const db = createAdminClient();

  const [{ data: bookings }, { data: statusRows }, { data: services }] =
    await Promise.all([
      db.from("bookings").select("id, created_at"),
      db
        .from("booking_status")
        .select("booking_id, status, changed_at")
        .order("changed_at", { ascending: false }),
      db.from("partner_services").select("category"),
    ]);

  const latestStatus = new Map<string, StatusValue>();
  for (const row of statusRows ?? []) {
    if (!latestStatus.has(row.booking_id)) {
      latestStatus.set(row.booking_id, row.status);
    }
  }

  const statusCounts: Record<StatusValue, number> = {
    requested: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const status of latestStatus.values()) {
    statusCounts[status] += 1;
  }

  const categoryCounts: Record<Category, number> = {
    freshen_up: 0,
    bag_storage: 0,
    rest: 0,
    cab: 0,
    room: 0,
  };
  for (const service of services ?? []) {
    categoryCounts[service.category] += 1;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentBookings = (bookings ?? []).filter(
    (b) => new Date(b.created_at) >= thirtyDaysAgo,
  );

  return {
    statusCounts,
    categoryCounts,
    recentBookingCount: recentBookings.length,
  };
}

export default async function AdminAnalyticsPage() {
  const { statusCounts, categoryCounts, recentBookingCount } =
    await getAnalytics();

  const maxStatus = Math.max(...Object.values(statusCounts), 1);
  const maxCategory = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          {recentBookingCount} booking{recentBookingCount === 1 ? "" : "s"} in
          the last 30 days.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.keys(statusCounts) as StatusValue[]).map((status) => (
              <Bar
                key={status}
                label={STATUS_LABELS[status]}
                value={statusCounts[status]}
                max={maxStatus}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services by category</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.keys(categoryCounts) as Category[]).map((category) => (
              <Bar
                key={category}
                label={CATEGORY_LABELS[category]}
                value={categoryCounts[category]}
                max={maxCategory}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
