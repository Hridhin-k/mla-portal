"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  FolderKanban,
  Images,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  CircleHelp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAdminGuide } from "@/components/admin/admin-guide-provider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, tourId: "nav-dashboard" },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquare, tourId: "nav-complaints" },
  { href: "/admin/news", label: "News", icon: Newspaper, tourId: "nav-news" },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, tourId: "nav-projects" },
  { href: "/admin/gallery", label: "Gallery", icon: Images, tourId: "nav-gallery" },
  { href: "/admin/settings", label: "Settings", icon: Settings, tourId: "nav-settings", adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, tourId: "nav-users", adminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openHelp, isAdmin } = useAdminGuide();

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-[var(--admin-navy)] text-white min-h-screen">
      <div className="admin-tricolor shrink-0" />

      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--admin-saffron)] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">IN</span>
          </div>
          <div>
            <h1 className="font-semibold text-base leading-tight">Constituency Portal</h1>
            <p className="text-[11px] text-white/50 mt-0.5">Administration Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto admin-scrollbar">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
          Manage
        </p>
        {visibleNav.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tourId}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-white/12 text-white shadow-sm border border-white/10"
                  : "text-white/65 hover:text-white hover:bg-white/6"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active && "text-[var(--admin-saffron)]")} />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--admin-saffron)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        <button
          type="button"
          data-tour="nav-help"
          onClick={openHelp}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/6 transition-colors"
        >
          <CircleHelp className="h-4 w-4" />
          Help & Guide
        </button>
        <Link
          href="/en"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/6 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Public Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openHelp, isAdmin } = useAdminGuide();

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-[var(--admin-navy)] text-white">
      <div className="admin-tricolor" />
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-semibold text-sm">Admin Console</p>
          <p className="text-[10px] text-white/50">Constituency Portal</p>
        </div>
        <button onClick={openHelp} className="p-2 rounded-lg hover:bg-white/10" aria-label="Help">
          <CircleHelp className="h-4 w-4" />
        </button>
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-3 admin-scrollbar">
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                active ? "bg-[var(--admin-saffron)] text-white" : "bg-white/10 text-white/70"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
