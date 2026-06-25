"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/admin/dialog";
import {
  AdminPageHeader,
  AdminButton,
  AdminBadge,
  AdminLoading,
  AdminEmpty,
} from "@/components/admin/ui";
import type { Profile, UserRole } from "@/types/database";

export function UsersAdmin() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "staff" as UserRole });
  const [editForm, setEditForm] = useState({ full_name: "", role: "staff" as UserRole, is_active: true });

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/users")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load users");
        setUsers(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Invite failed");
      setSaving(false);
      return;
    }
    setInviteOpen(false);
    setInviteForm({ email: "", full_name: "", role: "staff" });
    setSaving(false);
    load();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Update failed");
      setSaving(false);
      return;
    }
    setEditOpen(false);
    setEditing(null);
    setSaving(false);
    load();
  };

  const toggleActive = async (user: Profile) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not update user");
      return;
    }
    load();
  };

  const initials = (name: string | null, email: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader
        title="User Management"
        description="Invite staff and admins. Users receive an email to set their password."
        action={
          <AdminButton variant="secondary" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" />
            Invite User
          </AdminButton>
        }
      />

      {error && !inviteOpen && !editOpen && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <AdminEmpty message="No users found. Invite your first team member." />
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full text-sm admin-table">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left">User</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Role</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Status</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--admin-navy-soft)] flex items-center justify-center text-[var(--admin-navy)] font-semibold text-xs shrink-0">
                        {initials(user.full_name, user.email)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--admin-navy)] truncate">
                          {user.full_name || "—"}
                        </p>
                        <p className="text-xs text-[var(--admin-muted)] truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <AdminBadge variant={user.role === "admin" ? "saffron" : "navy"}>
                      {user.role}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <AdminBadge variant={user.is_active ? "green" : "muted"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-[var(--admin-muted)]">
                    {new Date(user.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Edit user"
                        onClick={() => {
                          setEditing(user);
                          setEditForm({
                            full_name: user.full_name ?? "",
                            role: user.role,
                            is_active: user.is_active,
                          });
                          setEditOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title={user.is_active ? "Deactivate" : "Activate"}
                        onClick={() => toggleActive(user)}
                        className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)]"
                      >
                        {user.is_active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-[var(--admin-green)]" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DialogRoot open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent title="Invite User" description="An invitation email will be sent to set their password.">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">Email</label>
              <input
                type="email"
                required
                className="admin-input"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">Full Name</label>
              <input
                className="admin-input"
                value={inviteForm.full_name}
                onChange={(e) => setInviteForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">Role</label>
              <select
                className="admin-input"
                value={inviteForm.role}
                onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && inviteOpen && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <AdminButton type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" disabled={saving}>
                {saving ? "Sending..." : "Send Invite"}
              </AdminButton>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent title="Edit User" description="Update role and account status.">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">Full Name</label>
              <input
                className="admin-input"
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">Role</label>
              <select
                className="admin-input"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--admin-navy)] cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded accent-[var(--admin-saffron)]"
              />
              Account active
            </label>
            {error && editOpen && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <AdminButton type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </AdminButton>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
