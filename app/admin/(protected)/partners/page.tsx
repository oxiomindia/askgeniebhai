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

export const dynamic = "force-dynamic";

async function getPartners(query: string) {
  const db = createAdminClient();

  let partnersQuery = db
    .from("partners")
    .select("id, business_name, contact_email, contact_phone, created_at")
    .order("business_name", { ascending: true });

  if (query) {
    partnersQuery = partnersQuery.ilike("business_name", `%${query}%`);
  }

  const { data: partners, error } = await partnersQuery;
  if (error) throw new Error(error.message);
  if (!partners || partners.length === 0) return [];

  const partnerIds = partners.map((p) => p.id);

  const { data: locations } = await db
    .from("partner_locations")
    .select("id, partner_id")
    .in("partner_id", partnerIds);

  const locationIds = (locations ?? []).map((l) => l.id);
  const { data: verifications } = locationIds.length
    ? await db
        .from("verification")
        .select("partner_location_id, status")
        .in("partner_location_id", locationIds)
    : { data: [] };

  const verifiedLocationIds = new Set(
    (verifications ?? [])
      .filter((v) => v.status === "passed")
      .map((v) => v.partner_location_id),
  );

  return partners.map((partner) => {
    const partnerLocations = (locations ?? []).filter(
      (l) => l.partner_id === partner.id,
    );
    const hasVerifiedLocation = partnerLocations.some((l) =>
      verifiedLocationIds.has(l.id),
    );

    return {
      ...partner,
      locationCount: partnerLocations.length,
      status: hasVerifiedLocation
        ? ("verified" as const)
        : ("pending" as const),
    };
  });
}

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const partners = await getPartners(q);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Partner Management</h1>
          <p className="text-muted-foreground text-sm">
            {partners.length} partner{partners.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/partners/new">New partner</Link>
        </Button>
      </div>

      <form className="flex max-w-sm gap-2">
        <Input
          name="q"
          placeholder="Search by business name…"
          defaultValue={q}
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No partners found.
                </TableCell>
              </TableRow>
            )}
            {partners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-medium">
                  {partner.business_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {partner.contact_email || partner.contact_phone || "—"}
                </TableCell>
                <TableCell>{partner.locationCount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      partner.status === "verified" ? "success" : "warning"
                    }
                  >
                    {partner.status === "verified"
                      ? "Verified"
                      : "Pending review"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/partners/${partner.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
