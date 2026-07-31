// Creates the development admin account via Supabase's official Admin API
// (`auth.admin.createUser`) — never by inserting into `auth.users` directly,
// which Supabase does not support or recommend.
//
// Run once, locally, by whoever holds the real service role key:
//
//   NEXT_PUBLIC_SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   ADMIN_SEED_EMAIL=owner@askgeniebhai.internal \
//   ADMIN_SEED_PASSWORD=<a real password, not "owner123"> \
//   node scripts/seed-admin.mjs
//
// Then add ADMIN_SEED_EMAIL's value to the ADMIN_EMAILS env var (see
// .env.example) so lib/admin-auth.ts authorizes it for /admin routes.
//
// No credentials are hardcoded here or anywhere else in this repository.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_SEED_EMAIL;
const password = process.env.ADMIN_SEED_PASSWORD;

function fail(message) {
  console.error(`seed-admin: ${message}`);
  process.exit(1);
}

if (!url) fail("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!serviceRoleKey) fail("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!email) fail("Missing ADMIN_SEED_EMAIL");
if (!password) fail("Missing ADMIN_SEED_PASSWORD");
if (password === "owner123") {
  fail(
    "Refusing to seed with the placeholder password from the build spec — " +
      "set ADMIN_SEED_PASSWORD to a real password.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  fail(`Failed to create admin user: ${error.message}`);
}

console.log(`Created admin user ${data.user.email} (id: ${data.user.id}).`);
console.log(
  `Add "${email}" to ADMIN_EMAILS in your Vercel/local environment to authorize it for /admin.`,
);
