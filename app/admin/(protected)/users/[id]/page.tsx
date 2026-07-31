import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getUserDetail(userId: string) {
  const db = createAdminClient();

  const { data: user } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!user) return null;

  const { data: bookings } = await db
    .from("bookings")
    .select("*, partner_services(name, category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { user, bookings: bookings ?? [] };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  const { user, bookings } = detail;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user.full_name || "Unnamed traveler"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {user.phone || "No phone on file"} · Joined{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled
          title="Suspension requires an account-status field that doesn't exist in the schema yet — placeholder only, per this build's scope"
        >
          Suspend
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {bookings.map((booking) => {
                const service = booking.partner_services as unknown as {
                  name: string;
                  category: string;
                } | null;
                return (
                  <li
                    key={booking.id}
                    className="flex items-center justify-between gap-4 border-b pb-2 last:border-0"
                  >
                    <span>
                      {service?.name ?? "Unknown service"}{" "}
                      <span className="text-muted-foreground">
                        ({service?.category.replace("_", " ")})
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span>
                        {booking.currency} {booking.total_price}
                      </span>
                      <Badge variant="outline">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </Badge>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
