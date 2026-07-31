import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";

type StatusValue = Database["public"]["Enums"]["booking_status_value"];

const STATUS_VARIANT: Record<
  StatusValue,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  requested: "secondary",
  confirmed: "warning",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
};

async function getBookings(query: string, status: string) {
  const db = createAdminClient();

  let bookingsQuery = db
    .from("bookings")
    .select("*, users(full_name), partner_services(name)")
    .order("created_at", { ascending: false });

  if (query) {
    bookingsQuery = bookingsQuery.ilike("notes", `%${query}%`);
  }

  const { data: bookings, error } = await bookingsQuery;
  if (error) throw new Error(error.message);
  if (!bookings || bookings.length === 0) return [];

  const bookingIds = bookings.map((b) => b.id);
  const { data: statusRows } = await db
    .from("booking_status")
    .select("booking_id, status, changed_at")
    .in("booking_id", bookingIds)
    .order("changed_at", { ascending: false });

  const latestStatus = new Map<string, StatusValue>();
  for (const row of statusRows ?? []) {
    if (!latestStatus.has(row.booking_id)) {
      latestStatus.set(row.booking_id, row.status);
    }
  }

  const withStatus = bookings.map((booking) => ({
    ...booking,
    status: latestStatus.get(booking.id) ?? ("requested" as StatusValue),
  }));

  return status ? withStatus.filter((b) => b.status === status) : withStatus;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const bookings = await getBookings(q, status);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Booking Monitoring</h1>
        <p className="text-muted-foreground text-sm">
          Read-only. {bookings.length} booking{bookings.length === 1 ? "" : "s"}
          {status ? ` with status "${status}"` : ""}.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-2">
        <Input
          name="q"
          placeholder="Search notes…"
          defaultValue={q}
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={status}
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Traveler</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => {
              const user = booking.users as unknown as {
                full_name: string | null;
              } | null;
              const service = booking.partner_services as unknown as {
                name: string;
              } | null;
              return (
                <TableRow key={booking.id}>
                  <TableCell>{user?.full_name || "—"}</TableCell>
                  <TableCell>{service?.name ?? "—"}</TableCell>
                  <TableCell>
                    {booking.currency} {booking.total_price}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[booking.status]}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
