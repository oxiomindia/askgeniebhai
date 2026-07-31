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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getUsers(query: string) {
  const db = createAdminClient();

  let usersQuery = db
    .from("users")
    .select("id, full_name, phone, created_at")
    .order("created_at", { ascending: false });

  if (query) {
    usersQuery = usersQuery.or(
      `full_name.ilike.%${query}%,phone.ilike.%${query}%`,
    );
  }

  const { data: users, error } = await usersQuery;
  if (error) throw new Error(error.message);
  if (!users || users.length === 0) return [];

  const userIds = users.map((u) => u.id);
  const { data: bookings } = await db
    .from("bookings")
    .select("user_id")
    .in("user_id", userIds);

  return users.map((user) => ({
    ...user,
    bookingCount: (bookings ?? []).filter((b) => b.user_id === user.id).length,
  }));
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const users = await getUsers(q);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-muted-foreground text-sm">
          Read-only. {users.length} traveler{users.length === 1 ? "" : "s"}.
        </p>
      </div>

      <form className="flex max-w-sm gap-2">
        <Input
          name="q"
          placeholder="Search by name or phone…"
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
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.phone || "—"}
                </TableCell>
                <TableCell>{user.bookingCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/users/${user.id}`}>View</Link>
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
