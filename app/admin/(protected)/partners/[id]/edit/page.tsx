import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updatePartnerAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPartnerPage({
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
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!partner) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Edit {partner.business_name}</h1>
      </div>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePartnerAction} className="flex flex-col gap-4">
            <input type="hidden" name="partnerId" value={partner.id} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={partner.business_name}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={partner.contact_email ?? ""}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={partner.contact_phone ?? ""}
                />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-medium">GST &amp; PAN</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="gstNumber">GST number</Label>
                <Input
                  id="gstNumber"
                  name="gstNumber"
                  defaultValue={partner.gst_number ?? ""}
                  className="uppercase"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="panNumber">PAN</Label>
                <Input
                  id="panNumber"
                  name="panNumber"
                  defaultValue={partner.pan_number ?? ""}
                  className="uppercase"
                />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-medium">
              Bank Details{" "}
              <span className="text-muted-foreground font-normal">
                (structure only — not connected to payouts)
              </span>
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bankAccountHolderName">Account holder name</Label>
              <Input
                id="bankAccountHolderName"
                name="bankAccountHolderName"
                defaultValue={partner.bank_account_holder_name ?? ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bankAccountNumber">Account number</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  defaultValue={partner.bank_account_number ?? ""}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bankIfscCode">IFSC code</Label>
                <Input
                  id="bankIfscCode"
                  name="bankIfscCode"
                  defaultValue={partner.bank_ifsc_code ?? ""}
                  className="uppercase"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button asChild variant="outline" type="button">
                <Link href={`/admin/partners/${partner.id}`}>Cancel</Link>
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
