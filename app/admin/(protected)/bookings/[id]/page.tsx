import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getBookingDetail(bookingId: string) {
  const db = createAdminClient();

  const { data: booking } = await db
    .from("bookings")
    .select("*, users(full_name, phone), partner_services(name, category)")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return null;

  const { data: statusHistory } = await db
    .from("booking_status")
    .select("*")
    .eq("booking_id", bookingId)
    .order("changed_at", { ascending: true });

  return { booking, statusHistory: statusHistory ?? [] };
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getBookingDetail(id);
  if (!detail) notFound();

  const { booking, statusHistory } = detail;
  const user = booking.users as unknown as {
    full_name: string | null;
    phone: string | null;
  } | null;
  const service = booking.partner_services as unknown as {
    name: string;
    category: string;
  } | null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          {service?.name ?? "Booking"} — {user?.full_name || "Unknown traveler"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {booking.currency} {booking.total_price} ·{" "}
          {new Date(booking.created_at).toLocaleString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-xs">Traveler phone</p>
            <p>{user?.phone || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Category</p>
            <p>{service?.category.replace("_", " ") ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Notes</p>
            <p>{booking.notes || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent>
          {statusHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No status changes recorded yet.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {statusHistory.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">
                    {entry.status.replace("_", " ")}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(entry.changed_at).toLocaleString()}
                  </span>
                  {entry.note && <span>— {entry.note}</span>}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
