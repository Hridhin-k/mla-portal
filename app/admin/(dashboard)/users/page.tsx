import { UsersAdmin } from "@/components/admin/users-admin";
import { requireAdminPage } from "@/lib/admin/auth";

export default async function AdminUsersPage() {
  await requireAdminPage();
  return <UsersAdmin />;
}
