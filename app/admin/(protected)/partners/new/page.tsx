import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createPartnerAction } from "../actions";

export default async function NewPartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">New Partner</h1>
        <p className="text-muted-foreground text-sm">
          Register a partner business. Locations, documents, and photos are
          added after the business record is created.
        </p>
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
          <form action={createPartnerAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" name="businessName" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input id="contactEmail" name="contactEmail" type="email" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="+91 98765 43210"
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
                  placeholder="22AAAAA0000A1Z5"
                  className="uppercase"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="panNumber">PAN</Label>
                <Input
                  id="panNumber"
                  name="panNumber"
                  placeholder="ABCDE1234F"
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
              <Input id="bankAccountHolderName" name="bankAccountHolderName" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bankAccountNumber">Account number</Label>
                <Input id="bankAccountNumber" name="bankAccountNumber" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bankIfscCode">IFSC code</Label>
                <Input
                  id="bankIfscCode"
                  name="bankIfscCode"
                  placeholder="HDFC0001234"
                  className="uppercase"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button asChild variant="outline" type="button">
                <Link href="/admin/partners">Cancel</Link>
              </Button>
              <Button type="submit">Create partner</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
