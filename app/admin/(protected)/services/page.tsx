import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";

type Category = Database["public"]["Enums"]["partner_category"];

// These five categories are the fixed, exhaustive intent set from
// docs/00_ASK_GENIE_BHAI_BLUEPRINT.md § MVP — a Postgres enum, not a table.
// Adding a sixth requires a Master Blueprint update first (see Governance),
// so this page is a read-only overview, not a category editor.
const CATEGORIES: { value: Category; label: string }[] = [
  { value: "freshen_up", label: "Freshen Up" },
  { value: "bag_storage", label: "Keep My Bags" },
  { value: "rest", label: "Rest" },
  { value: "cab", label: "Book a Cab" },
  { value: "room", label: "Book a Room" },
];

async function getCategoryCounts() {
  const db = createAdminClient();
  const { data: services } = await db
    .from("partner_services")
    .select("category, is_active");

  return CATEGORIES.map((category) => {
    const inCategory = (services ?? []).filter(
      (s) => s.category === category.value,
    );
    return {
      ...category,
      total: inCategory.length,
      active: inCategory.filter((s) => s.is_active).length,
    };
  });
}

export default async function AdminServicesPage() {
  const categories = await getCategoryCounts();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Service Categories</h1>
        <p className="text-muted-foreground text-sm">
          The five MVP intents. This set is fixed by the Master Blueprint —
          adding a category is a documentation change, not something done from
          this screen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.value}>
            <CardHeader>
              <CardTitle>{category.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{category.total}</p>
              <p className="text-muted-foreground text-xs">
                {category.active} active
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
