"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Verification decisions and partner suspension all write to the same
// append-only `verification` history table (see
// docs/DATABASE_BLUEPRINT.md § Design Principles — "Status as history, not
// state"). There is no separate `is_suspended` column on `partners`; a
// suspension is recorded the same way a rejection is: a new verification
// row, not a schema change.
async function recordVerification(input: {
  partnerLocationId: string;
  partnerServiceId: string | null;
  status: "passed" | "failed";
  note: string;
}) {
  const admin = await requireAdmin();
  const db = createAdminClient();

  const { error } = await db.from("verification").insert({
    partner_location_id: input.partnerLocationId,
    partner_service_id: input.partnerServiceId,
    status: input.status,
    verified_by: admin.email,
    notes: input.note,
  });

  if (error) {
    throw new Error(`Failed to record verification: ${error.message}`);
  }
}

export async function approveVerificationAction(formData: FormData) {
  const partnerLocationId = String(formData.get("partnerLocationId"));
  const partnerServiceId = formData.get("partnerServiceId");

  await recordVerification({
    partnerLocationId,
    partnerServiceId: partnerServiceId ? String(partnerServiceId) : null,
    status: "passed",
    note: "Approved by admin",
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin/partners");
}

export async function rejectVerificationAction(formData: FormData) {
  const partnerLocationId = String(formData.get("partnerLocationId"));
  const partnerServiceId = formData.get("partnerServiceId");
  const note = String(formData.get("note") || "Rejected by admin");

  await recordVerification({
    partnerLocationId,
    partnerServiceId: partnerServiceId ? String(partnerServiceId) : null,
    status: "failed",
    note,
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin/partners");
}

export async function suspendPartnerAction(formData: FormData) {
  const partnerLocationId = String(formData.get("partnerLocationId"));

  await recordVerification({
    partnerLocationId,
    partnerServiceId: null,
    status: "failed",
    note: "Suspended by admin",
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${formData.get("partnerId")}`);
}
