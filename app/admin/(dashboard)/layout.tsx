import { Inter } from "next/font/google";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar";
import "../admin.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-app ${inter.variable} min-h-screen flex`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileNav />
        <main className="flex-1 p-5 sm:p-8 overflow-auto admin-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
