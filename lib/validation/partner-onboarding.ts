// Shared, server-only validation for Build 009 (Partner / Hotel Onboarding).
// Every admin server action re-validates here rather than trusting the
// client — this is an internal tool, but the writes still go straight to
// the database via the service-role client, which bypasses RLS entirely.

const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z]\d[A-Z\d]$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE_RE = /^(\+91[-\s]?)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ValidationError extends Error {}

export function requireNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new ValidationError(`${label} is required.`);
  return trimmed;
}

export function validateOptionalGstin(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  if (!GSTIN_RE.test(trimmed)) {
    throw new ValidationError(
      "GST number doesn't match the standard 15-character GSTIN format.",
    );
  }
  return trimmed;
}

export function validateOptionalPan(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  if (!PAN_RE.test(trimmed)) {
    throw new ValidationError(
      "PAN doesn't match the standard 10-character format (e.g. ABCDE1234F).",
    );
  }
  return trimmed;
}

export function validateOptionalIfsc(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  if (!IFSC_RE.test(trimmed)) {
    throw new ValidationError(
      "IFSC code doesn't match the standard 11-character format (e.g. HDFC0001234).",
    );
  }
  return trimmed;
}

export function validateOptionalPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!PHONE_RE.test(trimmed)) {
    throw new ValidationError(
      "Phone number must be a 10-digit Indian mobile number, optionally prefixed with +91.",
    );
  }
  return trimmed;
}

export function validateOptionalEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!EMAIL_RE.test(trimmed)) {
    throw new ValidationError("Email address is not valid.");
  }
  return trimmed;
}

// Coordinates are optional, but if either is supplied both must be, and
// both must be in-range — a lone or out-of-range value is worse than none.
export function validateOptionalCoordinates(
  latitudeRaw: string,
  longitudeRaw: string,
): { latitude: number | null; longitude: number | null } {
  const lat = latitudeRaw.trim();
  const lng = longitudeRaw.trim();

  if (!lat && !lng) return { latitude: null, longitude: null };
  if (!lat || !lng) {
    throw new ValidationError(
      "Latitude and longitude must both be provided, or both left blank.",
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new ValidationError("Latitude must be a number between -90 and 90.");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new ValidationError(
      "Longitude must be a number between -180 and 180.",
    );
  }

  return { latitude, longitude };
}
