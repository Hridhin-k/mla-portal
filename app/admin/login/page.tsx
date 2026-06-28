"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/admin/password-input";
import { Loader2, Shield, ArrowLeft } from "lucide-react";

const REASON_MESSAGES: Record<string, string> = {
  inactive:
    "Your account has been deactivated. Please contact an administrator if you believe this is a mistake.",
  forbidden: "You do not have permission to access the admin portal.",
  password_reset: "Your password has been updated. You can sign in with your new password.",
};

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "password_reset") {
      setSuccess(REASON_MESSAGES.password_reset);
      return;
    }
    if (reason && REASON_MESSAGES[reason]) {
      setError(REASON_MESSAGES[reason]);
    }
  }, [searchParams]);

  const switchMode = (next: "login" | "forgot") => {
    setMode(next);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      const row = profile as { role: string; is_active: boolean } | null;

      if (!row?.is_active) {
        await supabase.auth.signOut();
        setError(REASON_MESSAGES.inactive);
        setLoading(false);
        return;
      }

      if (!row || !["admin", "staff"].includes(row.role)) {
        await supabase.auth.signOut();
        setError(REASON_MESSAGES.forbidden);
        setLoading(false);
        return;
      }
    }

    router.push("/admin");
    router.refresh();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/admin/login/reset`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message || "Could not send reset email. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess("If an account exists for that email, you will receive a password reset link shortly.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
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

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--admin-bg)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="admin-tricolor rounded-full mb-6" />
            <h1 className="text-2xl font-semibold text-[var(--admin-navy)]">
              {mode === "login" ? "Admin Sign In" : "Reset Password"}
            </h1>
          </div>

          <div className="admin-card p-8">
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-2 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-navy)] mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </button>
            )}

            <div className="hidden lg:block mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-saffron)] mb-2">
                {mode === "login" ? "Welcome back" : "Account recovery"}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--admin-navy)]">
                {mode === "login" ? "Sign in to continue" : "Forgot your password?"}
              </h2>
              <p className="text-sm text-[var(--admin-muted)] mt-1">
                {mode === "login"
                  ? "Enter your credentials to access the dashboard."
                  : "Enter your email and we will send you a reset link."}
              </p>
            </div>

            {mode === "login" ? (
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
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-[var(--admin-navy)]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs font-medium text-[var(--admin-saffron)] hover:text-[var(--admin-saffron-hover)] transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={setPassword}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="text-sm text-[var(--admin-green)] bg-[var(--admin-green-soft)] border border-green-200 rounded-lg px-4 py-3"
                  >
                    {success}
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
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="admin-input"
                    placeholder="admin@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="text-sm text-[var(--admin-green)] bg-[var(--admin-green-soft)] border border-green-200 rounded-lg px-4 py-3"
                  >
                    {success}
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
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-saffron)]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
