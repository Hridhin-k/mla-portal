import { SettingsAdmin } from "@/components/admin/settings-admin";
import { requireAdminPage } from "@/lib/admin/auth";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  return <SettingsAdmin />;
}
