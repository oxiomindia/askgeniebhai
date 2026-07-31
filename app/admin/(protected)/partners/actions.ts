"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ValidationError,
  requireNonEmpty,
  validateOptionalCoordinates,
  validateOptionalEmail,
  validateOptionalGstin,
  validateOptionalIfsc,
  validateOptionalPan,
  validateOptionalPhone,
} from "@/lib/validation/partner-onboarding";
import type { Database } from "@/types/supabase";

const STORAGE_BUCKET = "partner-documents";

// Documents a location's onboarding can't be submitted for review without.
// Photos are checked separately (at least one `hotel_photo`, any count).
const REQUIRED_DOCUMENT_LABELS: Database["public"]["Enums"]["media_label"][] = [
  "gst_certificate",
  "pan_card",
  "business_registration_certificate",
];

function partnerFieldsFromForm(formData: FormData) {
  return {
    business_name: requireNonEmpty(
      String(formData.get("businessName") ?? ""),
      "Business name",
    ),
    contact_email: validateOptionalEmail(
      String(formData.get("contactEmail") ?? ""),
    ),
    contact_phone: validateOptionalPhone(
      String(formData.get("contactPhone") ?? ""),
    ),
    gst_number: validateOptionalGstin(String(formData.get("gstNumber") ?? "")),
    pan_number: validateOptionalPan(String(formData.get("panNumber") ?? "")),
    bank_account_holder_name:
      String(formData.get("bankAccountHolderName") ?? "").trim() || null,
    bank_account_number:
      String(formData.get("bankAccountNumber") ?? "").trim() || null,
    bank_ifsc_code: validateOptionalIfsc(
      String(formData.get("bankIfscCode") ?? ""),
    ),
  };
}

export async function createPartnerAction(formData: FormData) {
  await requireAdmin();

  let fields;
  try {
    fields = partnerFieldsFromForm(formData);
  } catch (err) {
    if (err instanceof ValidationError) {
      redirect(`/admin/partners/new?error=${encodeURIComponent(err.message)}`);
    }
    throw err;
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("partners")
    .insert(fields)
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/admin/partners/new?error=${encodeURIComponent(error?.message ?? "Failed to create partner.")}`,
    );
  }

  revalidatePath("/admin/partners");
  redirect(`/admin/partners/${data.id}`);
}

export async function updatePartnerAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId"));

  let fields;
  try {
    fields = partnerFieldsFromForm(formData);
  } catch (err) {
    if (err instanceof ValidationError) {
      redirect(
        `/admin/partners/${partnerId}/edit?error=${encodeURIComponent(err.message)}`,
      );
    }
    throw err;
  }

  const db = createAdminClient();
  const { error } = await db
    .from("partners")
    .update(fields)
    .eq("id", partnerId);

  if (error) {
    redirect(
      `/admin/partners/${partnerId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${partnerId}`);
  redirect(`/admin/partners/${partnerId}`);
}

function locationFieldsFromForm(formData: FormData) {
  const { latitude, longitude } = validateOptionalCoordinates(
    String(formData.get("latitude") ?? ""),
    String(formData.get("longitude") ?? ""),
  );

  return {
    name: requireNonEmpty(String(formData.get("name") ?? ""), "Hotel name"),
    address_line1: requireNonEmpty(
      String(formData.get("addressLine1") ?? ""),
      "Address line 1",
    ),
    address_line2: String(formData.get("addressLine2") ?? "").trim() || null,
    city: requireNonEmpty(String(formData.get("city") ?? ""), "City"),
    state: String(formData.get("state") ?? "").trim() || null,
    postal_code: String(formData.get("postalCode") ?? "").trim() || null,
    country: String(formData.get("country") ?? "IN").trim() || "IN",
    latitude,
    longitude,
  };
}

export async function createLocationAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId"));

  let fields;
  try {
    fields = locationFieldsFromForm(formData);
  } catch (err) {
    if (err instanceof ValidationError) {
      redirect(
        `/admin/partners/${partnerId}/locations/new?error=${encodeURIComponent(err.message)}`,
      );
    }
    throw err;
  }

  const db = createAdminClient();
  const { error } = await db
    .from("partner_locations")
    .insert({ ...fields, partner_id: partnerId });

  if (error) {
    redirect(
      `/admin/partners/${partnerId}/locations/new?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/admin/partners/${partnerId}`);
  redirect(`/admin/partners/${partnerId}`);
}

export async function updateLocationAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId"));
  const locationId = String(formData.get("locationId"));

  let fields;
  try {
    fields = locationFieldsFromForm(formData);
  } catch (err) {
    if (err instanceof ValidationError) {
      redirect(
        `/admin/partners/${partnerId}/locations/${locationId}/edit?error=${encodeURIComponent(err.message)}`,
      );
    }
    throw err;
  }

  const db = createAdminClient();
  const { error } = await db
    .from("partner_locations")
    .update(fields)
    .eq("id", locationId);

  if (error) {
    redirect(
      `/admin/partners/${partnerId}/locations/${locationId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/admin/partners/${partnerId}`);
  redirect(`/admin/partners/${partnerId}`);
}

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId"));
  const partnerLocationId = formData.get("partnerLocationId");
  const label = formData.get(
    "label",
  ) as Database["public"]["Enums"]["media_label"];
  const file = formData.get("file") as File | null;
  const returnPath = String(formData.get("returnPath") ?? "");

  const fail = (message: string) => {
    const sep = returnPath.includes("?") ? "&" : "?";
    redirect(`${returnPath}${sep}error=${encodeURIComponent(message)}`);
  };

  if (!file || file.size === 0) {
    fail("Choose a file to upload.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    fail("Files must be 10MB or smaller.");
    return;
  }
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  if (!isImage && !isPdf) {
    fail("Only image files or PDFs are accepted.");
    return;
  }
  if (label === "hotel_photo" && !isImage) {
    fail("Hotel photos must be an image file.");
    return;
  }

  const db = createAdminClient();
  const extMatch = /\.[a-zA-Z0-9]{1,5}$/.exec(file.name);
  const ext = extMatch ? extMatch[0] : "";
  const storagePath = `${partnerId}/${crypto.randomUUID()}${ext}`;

  const { error: uploadError } = await db.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    fail(`Upload failed: ${uploadError.message}`);
    return;
  }

  const { error: insertError } = await db.from("media").insert({
    partner_id: partnerId,
    partner_location_id: partnerLocationId ? String(partnerLocationId) : null,
    storage_path: storagePath,
    content_type: file.type,
    label,
  });

  if (insertError) {
    await db.storage.from(STORAGE_BUCKET).remove([storagePath]);
    fail(`Failed to save upload: ${insertError.message}`);
    return;
  }

  revalidatePath(`/admin/partners/${partnerId}`);
  redirect(returnPath || `/admin/partners/${partnerId}`);
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const mediaId = String(formData.get("mediaId"));
  const partnerId = String(formData.get("partnerId"));

  const db = createAdminClient();
  const { data: media } = await db
    .from("media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  if (media) {
    await db.storage.from(STORAGE_BUCKET).remove([media.storage_path]);
    await db.from("media").delete().eq("id", mediaId);
  }

  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/admin/onboarding");
}

async function getOnboardingCompleteness(
  db: ReturnType<typeof createAdminClient>,
  partnerId: string,
  locationId: string,
) {
  const { data: media } = await db
    .from("media")
    .select("label, partner_id, partner_location_id")
    .or(`partner_id.eq.${partnerId},partner_location_id.eq.${locationId}`);

  const labels = new Set((media ?? []).map((m) => m.label));
  const missingDocuments = REQUIRED_DOCUMENT_LABELS.filter(
    (label) => !labels.has(label),
  );
  const hasPhoto = (media ?? []).some(
    (m) => m.label === "hotel_photo" && m.partner_location_id === locationId,
  );

  return { missingDocuments, hasPhoto };
}

const SUBMITTABLE_FROM = new Set(["draft", "rejected"]);
const DECIDABLE_FROM = new Set(["submitted", "under_review"]);

export async function submitLocationForReviewAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId"));
  const locationId = String(formData.get("locationId"));
  const db = createAdminClient();

  const { data: location } = await db
    .from("partner_locations")
    .select("onboarding_status")
    .eq("id", locationId)
    .maybeSingle();

  if (!location || !SUBMITTABLE_FROM.has(location.onboarding_status)) {
    redirect(
      `/admin/partners/${partnerId}?error=${encodeURIComponent("This location can't be submitted from its current status.")}`,
    );
  }

  const { missingDocuments, hasPhoto } = await getOnboardingCompleteness(
    db,
    partnerId,
    locationId,
  );

  if (missingDocuments.length > 0 || !hasPhoto) {
    const parts = [
      ...missingDocuments.map((d) => d.replace(/_/g, " ")),
      ...(hasPhoto ? [] : ["at least one hotel photo"]),
    ];
    redirect(
      `/admin/partners/${partnerId}?error=${encodeURIComponent(`Cannot submit for review — missing: ${parts.join(", ")}.`)}`,
    );
  }

  const { error } = await db
    .from("partner_locations")
    .update({ onboarding_status: "submitted" })
    .eq("id", locationId);

  if (error) {
    redirect(
      `/admin/partners/${partnerId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/admin/onboarding");
  redirect(`/admin/partners/${partnerId}`);
}

export async function claimForReviewAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId"));
  const locationId = String(formData.get("locationId"));
  const db = createAdminClient();

  await db
    .from("partner_locations")
    .update({ onboarding_status: "under_review" })
    .eq("id", locationId)
    .eq("onboarding_status", "submitted");

  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/admin/onboarding");
}

// Approval/rejection decisions are also recorded as a `verification` row
// (see docs/DATABASE_BLUEPRINT.md's "status as history, not state"
// principle) so the reasoning is preserved in the same audit trail the
// Verification Queue already writes to — `onboarding_status` on
// partner_locations tracks the current state, `verification` tracks the
// history of *why*. This intentionally reuses the existing table rather
// than adding a new notes column.
export async function approveOnboardingAction(formData: FormData) {
  const admin = await requireAdmin();
  const partnerId = String(formData.get("partnerId"));
  const locationId = String(formData.get("locationId"));
  const db = createAdminClient();

  const { data: location } = await db
    .from("partner_locations")
    .select("onboarding_status")
    .eq("id", locationId)
    .maybeSingle();

  if (!location || !DECIDABLE_FROM.has(location.onboarding_status)) {
    redirect(
      `/admin/partners/${partnerId}?error=${encodeURIComponent("This location isn't awaiting a decision.")}`,
    );
  }

  await db
    .from("partner_locations")
    .update({ onboarding_status: "approved" })
    .eq("id", locationId);

  await db.from("verification").insert({
    partner_location_id: locationId,
    status: "passed",
    verified_by: admin.email,
    notes: "Onboarding approved",
  });

  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/admin/onboarding");
  revalidatePath("/admin/verifications");
  redirect(`/admin/partners/${partnerId}`);
}

export async function rejectOnboardingAction(formData: FormData) {
  const admin = await requireAdmin();
  const partnerId = String(formData.get("partnerId"));
  const locationId = String(formData.get("locationId"));
  const note = String(formData.get("note") ?? "").trim();
  const db = createAdminClient();

  if (!note) {
    redirect(
      `/admin/partners/${partnerId}?error=${encodeURIComponent("A rejection reason is required.")}`,
    );
  }

  const { data: location } = await db
    .from("partner_locations")
    .select("onboarding_status")
    .eq("id", locationId)
    .maybeSingle();

  if (!location || !DECIDABLE_FROM.has(location.onboarding_status)) {
    redirect(
      `/admin/partners/${partnerId}?error=${encodeURIComponent("This location isn't awaiting a decision.")}`,
    );
  }

  await db
    .from("partner_locations")
    .update({ onboarding_status: "rejected" })
    .eq("id", locationId);

  await db.from("verification").insert({
    partner_location_id: locationId,
    status: "failed",
    verified_by: admin.email,
    notes: note,
  });

  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/admin/onboarding");
  revalidatePath("/admin/verifications");
  redirect(`/admin/partners/${partnerId}`);
}
