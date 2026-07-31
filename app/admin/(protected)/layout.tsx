import { requireAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { signOutAction } from "./actions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="bg-muted/20 hidden w-56 shrink-0 border-r p-4 md:flex md:flex-col md:gap-4">
        <div className="px-1">
          <p className="text-sm font-semibold">Ask Genie Bhai</p>
          <p className="text-muted-foreground text-xs">Admin Console</p>
        </div>
        <AdminNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
          <div className="md:hidden">
            <p className="text-sm font-semibold">Ask Genie Bhai Admin</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {admin.email}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <div className="border-b px-4 py-2 md:hidden">
          <AdminNav orientation="horizontal" />
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
