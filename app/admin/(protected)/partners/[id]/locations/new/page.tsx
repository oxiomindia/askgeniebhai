import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createLocationAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function NewLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const db = createAdminClient();
  const { data: partner } = await db
    .from("partners")
    .select("id, business_name")
    .eq("id", id)
    .maybeSingle();

  if (!partner) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">
          New Location — {partner.business_name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Hotel profile and address. Documents and photos are added after the
          location is created.
        </p>
      </div>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hotel Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLocationAction} className="flex flex-col gap-4">
            <input type="hidden" name="partnerId" value={partner.id} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Hotel name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="addressLine1">Address line 1</Label>
              <Input id="addressLine1" name="addressLine1" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="addressLine2">Address line 2</Label>
              <Input id="addressLine2" name="addressLine2" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" name="postalCode" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue="IN" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="latitude">
                  Latitude{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional, manual entry)
                  </span>
                </Label>
                <Input
                  id="latitude"
                  name="latitude"
                  inputMode="decimal"
                  placeholder="e.g. 28.613939"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  inputMode="decimal"
                  placeholder="e.g. 77.209023"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button asChild variant="outline" type="button">
                <Link href={`/admin/partners/${partner.id}`}>Cancel</Link>
              </Button>
              <Button type="submit">Create location</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
