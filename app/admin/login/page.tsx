"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--admin-navy)] flex-col relative overflow-hidden">
        <div className="admin-tricolor absolute top-0 left-0 right-0" />
        <div className="flex-1 flex flex-col justify-center px-16 pt-12">
          <div className="w-14 h-14 rounded-2xl bg-[var(--admin-saffron)] flex items-center justify-center mb-8 shadow-xl">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-semibold text-white leading-tight mb-4">
            Constituency<br />Administration Portal
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            Manage projects, news, citizen grievances, and public content — serving with transparency and accountability.
          </p>
          <div className="mt-12 flex items-center gap-3">
            <div className="h-1 w-12 bg-[var(--admin-saffron)] rounded-full" />
            <div className="h-1 w-12 bg-white rounded-full" />
            <div className="h-1 w-12 bg-[var(--admin-green)] rounded-full" />
          </div>
        </div>
        <p className="px-16 pb-8 text-white/30 text-xs">
          Secured access for authorized staff and administrators only.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--admin-bg)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="admin-tricolor rounded-full mb-6" />
            <h1 className="text-2xl font-semibold text-[var(--admin-navy)]">Admin Sign In</h1>
          </div>

          <div className="admin-card p-8">
            <div className="hidden lg:block mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-saffron)] mb-2">
                Welcome back
              </p>
              <h2 className="text-2xl font-semibold text-[var(--admin-navy)]">Sign in to continue</h2>
              <p className="text-sm text-[var(--admin-muted)] mt-1">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[var(--admin-saffron)] hover:bg-[var(--admin-saffron-hover)] text-white font-medium text-sm transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
