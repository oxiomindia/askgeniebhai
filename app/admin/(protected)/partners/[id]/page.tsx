import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { suspendPartnerAction } from "../../actions";

export const dynamic = "force-dynamic";

async function getPartnerDetail(partnerId: string) {
  const db = createAdminClient();

  const { data: partner } = await db
    .from("partners")
    .select("*")
    .eq("id", partnerId)
    .maybeSingle();
  if (!partner) return null;

  const { data: locations } = await db
    .from("partner_locations")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: true });

  const locationIds = (locations ?? []).map((l) => l.id);

  const { data: services } = locationIds.length
    ? await db
        .from("partner_services")
        .select("*")
        .in("partner_location_id", locationIds)
    : { data: [] };

  const { data: verifications } = locationIds.length
    ? await db
        .from("verification")
        .select("*")
        .in("partner_location_id", locationIds)
        .order("verified_at", { ascending: false })
    : { data: [] };

  return {
    partner,
    locations: locations ?? [],
    services: services ?? [],
    verifications: verifications ?? [],
  };
}

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPartnerDetail(id);
  if (!detail) notFound();

  const { partner, locations, services, verifications } = detail;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{partner.business_name}</h1>
        <p className="text-muted-foreground text-sm">
          {partner.contact_email || "No email"} ·{" "}
          {partner.contact_phone || "No phone"}
        </p>
      </div>

      <div className="grid gap-4">
        {locations.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground pt-5">
              No locations on file for this partner.
            </CardContent>
          </Card>
        )}
        {locations.map((location) => {
          const locationServices = services.filter(
            (s) => s.partner_location_id === location.id,
          );
          const locationVerifications = verifications.filter(
            (v) => v.partner_location_id === location.id,
          );
          const latestVerification = locationVerifications[0];

          return (
            <Card key={location.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>{location.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {location.address_line1}
                    {location.address_line2
                      ? `, ${location.address_line2}`
                      : ""}
                    , {location.city}
                    {location.state ? `, ${location.state}` : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    latestVerification?.status === "passed"
                      ? "success"
                      : latestVerification?.status === "failed"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {latestVerification
                    ? latestVerification.status
                    : "no verification yet"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Services</p>
                  {locationServices.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No services listed.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {locationServices.map((service) => (
                        <li
                          key={service.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {service.name}{" "}
                            <span className="text-muted-foreground">
                              ({service.category.replace("_", " ")})
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span>
                              {service.currency} {service.base_price}
                            </span>
                            <Badge
                              variant={
                                service.is_active ? "success" : "secondary"
                              }
                            >
                              {service.is_active ? "active" : "inactive"}
                            </Badge>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {locationVerifications.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Verification history
                    </p>
                    <ul className="flex flex-col gap-1 text-sm">
                      {locationVerifications.map((v) => (
                        <li
                          key={v.id}
                          className="text-muted-foreground flex justify-between gap-4"
                        >
                          <span>
                            {v.status} — {v.notes || "no notes"}
                          </span>
                          <span>
                            {new Date(v.verified_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                <form
                  action={suspendPartnerAction}
                  className="flex justify-end"
                >
                  <input
                    type="hidden"
                    name="partnerLocationId"
                    value={location.id}
                  />
                  <input type="hidden" name="partnerId" value={partner.id} />
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={latestVerification?.status !== "passed"}
                  >
                    Suspend this location
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
