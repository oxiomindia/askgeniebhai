import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  claimForReviewAction,
  approveOnboardingAction,
  rejectOnboardingAction,
} from "../partners/actions";

export const dynamic = "force-dynamic";

async function getQueue() {
  const db = createAdminClient();

  const { data: locations } = await db
    .from("partner_locations")
    .select("*, partners(id, business_name)")
    .in("onboarding_status", ["submitted", "under_review"])
    .order("updated_at", { ascending: true });

  return locations ?? [];
}

export default async function AdminOnboardingPage() {
  const queue = await getQueue();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Partner Onboarding Queue</h1>
        <p className="text-muted-foreground text-sm">
          {queue.length} location{queue.length === 1 ? "" : "s"} awaiting an
          onboarding decision
        </p>
      </div>

      {queue.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground pt-5">
            Nothing awaiting review right now.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {queue.map((location) => {
          const partner = location.partners as unknown as {
            id: string;
            business_name: string;
          } | null;

          return (
            <Card key={location.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>
                    {location.name} —{" "}
                    <Link
                      href={`/admin/partners/${partner?.id}`}
                      className="text-primary underline"
                    >
                      {partner?.business_name ?? "Unknown partner"}
                    </Link>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {location.address_line1}, {location.city}
                  </p>
                </div>
                <Badge variant="warning">
                  {location.onboarding_status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-2">
                {location.onboarding_status === "submitted" && (
                  <form action={claimForReviewAction}>
                    <input type="hidden" name="partnerId" value={partner?.id} />
                    <input
                      type="hidden"
                      name="locationId"
                      value={location.id}
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Move to under review
                    </Button>
                  </form>
                )}

                <form action={approveOnboardingAction}>
                  <input type="hidden" name="partnerId" value={partner?.id} />
                  <input type="hidden" name="locationId" value={location.id} />
                  <Button type="submit" size="sm">
                    Approve
                  </Button>
                </form>

                <form
                  action={rejectOnboardingAction}
                  className="flex flex-1 items-end gap-2"
                >
                  <input type="hidden" name="partnerId" value={partner?.id} />
                  <input type="hidden" name="locationId" value={location.id} />
                  <div className="flex-1">
                    <Label htmlFor={`note-${location.id}`} className="sr-only">
                      Rejection reason
                    </Label>
                    <Input
                      id={`note-${location.id}`}
                      name="note"
                      placeholder="Reason for rejection"
                    />
                  </div>
                  <Button type="submit" variant="destructive" size="sm">
                    Reject
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
