import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveVerificationAction,
  rejectVerificationAction,
} from "../actions";

export const dynamic = "force-dynamic";

async function getPendingLocations() {
  const db = createAdminClient();

  const { data: locations } = await db
    .from("partner_locations")
    .select("*, partners(business_name)")
    .order("created_at", { ascending: true });

  if (!locations || locations.length === 0) return [];

  const locationIds = locations.map((l) => l.id);
  const { data: verifications } = await db
    .from("verification")
    .select("partner_location_id")
    .in("partner_location_id", locationIds);

  const verifiedIds = new Set(
    (verifications ?? []).map((v) => v.partner_location_id),
  );

  const pending = locations.filter((l) => !verifiedIds.has(l.id));

  const pendingIds = pending.map((l) => l.id);
  const { data: services } = pendingIds.length
    ? await db
        .from("partner_services")
        .select("*")
        .in("partner_location_id", pendingIds)
    : { data: [] };

  return pending.map((location) => ({
    ...location,
    services: (services ?? []).filter(
      (s) => s.partner_location_id === location.id,
    ),
  }));
}

export default async function AdminVerificationsPage() {
  const pending = await getPendingLocations();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Verification Queue</h1>
        <p className="text-muted-foreground text-sm">
          {pending.length} location{pending.length === 1 ? "" : "s"} awaiting
          review
        </p>
      </div>

      {pending.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground pt-5">
            Nothing pending — every partner location has been reviewed at least
            once.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {pending.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle>
                {location.name} —{" "}
                <span className="text-muted-foreground font-normal">
                  {(
                    location.partners as unknown as {
                      business_name: string;
                    } | null
                  )?.business_name ?? "Unknown partner"}
                </span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {location.address_line1}, {location.city}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="mb-1 text-sm font-medium">
                  Services ({location.services.length})
                </p>
                {location.services.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No services listed yet.
                  </p>
                ) : (
                  <ul className="text-muted-foreground text-sm">
                    {location.services.map((s) => (
                      <li key={s.id}>
                        {s.name} ({s.category.replace("_", " ")}) — {s.currency}{" "}
                        {s.base_price}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <form action={approveVerificationAction}>
                  <input
                    type="hidden"
                    name="partnerLocationId"
                    value={location.id}
                  />
                  <Button type="submit" size="sm">
                    Approve
                  </Button>
                </form>

                <form
                  action={rejectVerificationAction}
                  className="flex flex-1 items-end gap-2"
                >
                  <input
                    type="hidden"
                    name="partnerLocationId"
                    value={location.id}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`note-${location.id}`} className="sr-only">
                      Rejection reason
                    </Label>
                    <Input
                      id={`note-${location.id}`}
                      name="note"
                      placeholder="Reason for rejection (optional)"
                    />
                  </div>
                  <Button type="submit" variant="destructive" size="sm">
                    Reject
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
