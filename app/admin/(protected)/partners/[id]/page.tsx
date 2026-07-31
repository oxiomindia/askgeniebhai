import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  suspendPartnerAction,
  approveVerificationAction,
  rejectVerificationAction,
} from "../../actions";
import {
  uploadMediaAction,
  deleteMediaAction,
  submitLocationForReviewAction,
  claimForReviewAction,
  approveOnboardingAction,
  rejectOnboardingAction,
} from "../actions";
import type { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";

const REQUIRED_DOCUMENT_LABELS: {
  value: Database["public"]["Enums"]["media_label"];
  label: string;
}[] = [
  { value: "gst_certificate", label: "GST certificate" },
  { value: "pan_card", label: "PAN card" },
  {
    value: "business_registration_certificate",
    label: "Business registration certificate",
  },
  { value: "bank_proof", label: "Bank proof (cheque / passbook)" },
  { value: "other", label: "Other" },
];

const ONBOARDING_BADGE: Record<
  Database["public"]["Enums"]["partner_onboarding_status"],
  "secondary" | "warning" | "success" | "destructive"
> = {
  draft: "secondary",
  submitted: "warning",
  under_review: "warning",
  approved: "success",
  rejected: "destructive",
};

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

  const { data: allMedia } = await db
    .from("media")
    .select("*")
    .or(
      `partner_id.eq.${partnerId}${
        locationIds.length
          ? `,partner_location_id.in.(${locationIds.join(",")})`
          : ""
      }`,
    )
    .order("created_at", { ascending: false });

  const mediaWithUrls = await Promise.all(
    (allMedia ?? []).map(async (m) => {
      const { data: signed } = await db.storage
        .from("partner-documents")
        .createSignedUrl(m.storage_path, 3600);
      return { ...m, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  const businessDocuments = mediaWithUrls.filter(
    (m) => m.partner_id && !m.partner_location_id,
  );

  return {
    partner,
    locations: locations ?? [],
    services: services ?? [],
    verifications: verifications ?? [],
    businessDocuments,
    locationMedia: mediaWithUrls.filter((m) => m.partner_location_id),
  };
}

export default async function AdminPartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const detail = await getPartnerDetail(id);
  if (!detail) notFound();

  const {
    partner,
    locations,
    services,
    verifications,
    businessDocuments,
    locationMedia,
  } = detail;

  const returnPath = `/admin/partners/${partner.id}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{partner.business_name}</h1>
          <p className="text-muted-foreground text-sm">
            {partner.contact_email || "No email"} ·{" "}
            {partner.contact_phone || "No phone"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/partners/${partner.id}/edit`}>
              Edit business
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/admin/partners/${partner.id}/locations/new`}>
              Add location
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Compliance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">GST number</p>
              <p className="font-medium">{partner.gst_number || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PAN</p>
              <p className="font-medium">{partner.pan_number || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bank account</p>
              <p className="font-medium">
                {partner.bank_account_number
                  ? `${partner.bank_account_holder_name || "—"} · ${partner.bank_ifsc_code || "—"}`
                  : "—"}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Business documents</p>
            {businessDocuments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No documents uploaded yet.
              </p>
            ) : (
              <ul className="mb-3 flex flex-col gap-1 text-sm">
                {businessDocuments.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2">
                    {doc.signedUrl ? (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        {doc.label?.replace(/_/g, " ") || "document"}
                      </a>
                    ) : (
                      <span>{doc.label?.replace(/_/g, " ") || "document"}</span>
                    )}
                    <form action={deleteMediaAction}>
                      <input type="hidden" name="mediaId" value={doc.id} />
                      <input
                        type="hidden"
                        name="partnerId"
                        value={partner.id}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form
              action={uploadMediaAction}
              encType="multipart/form-data"
              className="flex flex-wrap items-end gap-2"
            >
              <input type="hidden" name="partnerId" value={partner.id} />
              <input type="hidden" name="returnPath" value={returnPath} />
              <div className="flex flex-col gap-1">
                <Label htmlFor="doc-label" className="text-xs">
                  Document type
                </Label>
                <Select
                  id="doc-label"
                  name="label"
                  defaultValue="gst_certificate"
                >
                  {REQUIRED_DOCUMENT_LABELS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="doc-file" className="text-xs">
                  File
                </Label>
                <input
                  id="doc-file"
                  name="file"
                  type="file"
                  accept="image/*,application/pdf"
                  className="text-sm"
                  required
                />
              </div>
              <Button type="submit" size="sm" variant="outline">
                Upload document
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {locations.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground pt-5">
              No locations on file for this partner.{" "}
              <Link
                href={`/admin/partners/${partner.id}/locations/new`}
                className="text-primary underline"
              >
                Add one.
              </Link>
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
          const photos = locationMedia.filter(
            (m) =>
              m.partner_location_id === location.id &&
              m.label === "hotel_photo",
          );

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
                  {location.latitude != null && location.longitude != null && (
                    <p className="text-muted-foreground text-xs">
                      {location.latitude}, {location.longitude}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={ONBOARDING_BADGE[location.onboarding_status]}>
                    {location.onboarding_status.replace("_", " ")}
                  </Badge>
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
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/admin/partners/${partner.id}/locations/${location.id}/edit`}
                    >
                      Edit location
                    </Link>
                  </Button>
                </div>

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

                <div>
                  <p className="mb-2 text-sm font-medium">
                    Hotel photos ({photos.length})
                  </p>
                  {photos.length > 0 && (
                    <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {photos.map((photo) =>
                        photo.signedUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={photo.id}
                            src={photo.signedUrl}
                            alt="Hotel"
                            className="aspect-square rounded-md border object-cover"
                          />
                        ) : null,
                      )}
                    </div>
                  )}
                  <form
                    action={uploadMediaAction}
                    encType="multipart/form-data"
                    className="flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="partnerId" value={partner.id} />
                    <input
                      type="hidden"
                      name="partnerLocationId"
                      value={location.id}
                    />
                    <input type="hidden" name="label" value="hotel_photo" />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <input
                      name="file"
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      required
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Upload photo
                    </Button>
                  </form>
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

                <div>
                  <p className="mb-2 text-sm font-medium">Approval workflow</p>
                  <div className="flex flex-wrap items-end gap-2">
                    {(location.onboarding_status === "draft" ||
                      location.onboarding_status === "rejected") && (
                      <form action={submitLocationForReviewAction}>
                        <input
                          type="hidden"
                          name="partnerId"
                          value={partner.id}
                        />
                        <input
                          type="hidden"
                          name="locationId"
                          value={location.id}
                        />
                        <Button type="submit" size="sm">
                          Submit for review
                        </Button>
                      </form>
                    )}

                    {location.onboarding_status === "submitted" && (
                      <form action={claimForReviewAction}>
                        <input
                          type="hidden"
                          name="partnerId"
                          value={partner.id}
                        />
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

                    {(location.onboarding_status === "submitted" ||
                      location.onboarding_status === "under_review") && (
                      <>
                        <form action={approveOnboardingAction}>
                          <input
                            type="hidden"
                            name="partnerId"
                            value={partner.id}
                          />
                          <input
                            type="hidden"
                            name="locationId"
                            value={location.id}
                          />
                          <Button type="submit" size="sm">
                            Approve onboarding
                          </Button>
                        </form>

                        <form
                          action={rejectOnboardingAction}
                          className="flex flex-1 items-end gap-2"
                        >
                          <input
                            type="hidden"
                            name="partnerId"
                            value={partner.id}
                          />
                          <input
                            type="hidden"
                            name="locationId"
                            value={location.id}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`reject-note-${location.id}`}
                              className="sr-only"
                            >
                              Rejection reason
                            </Label>
                            <Input
                              id={`reject-note-${location.id}`}
                              name="note"
                              placeholder="Reason for rejection"
                            />
                          </div>
                          <Button type="submit" variant="destructive" size="sm">
                            Reject onboarding
                          </Button>
                        </form>
                      </>
                    )}

                    {location.onboarding_status === "approved" && (
                      <p className="text-muted-foreground text-sm">
                        Onboarding approved.
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm font-medium">
                    Quality verification
                  </p>
                  <div className="flex flex-wrap items-end gap-2">
                    <form action={approveVerificationAction}>
                      <input
                        type="hidden"
                        name="partnerLocationId"
                        value={location.id}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Record verification pass
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
                        <Label
                          htmlFor={`verify-note-${location.id}`}
                          className="sr-only"
                        >
                          Note
                        </Label>
                        <Input
                          id={`verify-note-${location.id}`}
                          name="note"
                          placeholder="Note (optional)"
                        />
                      </div>
                      <Button type="submit" variant="outline" size="sm">
                        Record verification fail
                      </Button>
                    </form>
                  </div>
                </div>

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
