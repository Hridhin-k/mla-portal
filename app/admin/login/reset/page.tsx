"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/admin/password-input";
import { Loader2, Shield, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("This reset link is invalid or has expired. Please request a new one.");
          setInitializing(false);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("This reset link is invalid or has expired. Please request a new one.");
        setInitializing(false);
        return;
      }

      setReady(true);
      setInitializing(false);
    };

    void init();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message || "Could not update password. Please try again.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/admin/login?reason=password_reset");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-[var(--admin-bg)]">
      <div className="w-full max-w-md">
        <div className="admin-tricolor rounded-full mb-6" />
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-navy)] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="admin-card p-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--admin-navy-soft)] flex items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-[var(--admin-navy)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--admin-navy)]">Set a new password</h1>
          <p className="text-sm text-[var(--admin-muted)] mt-1 mb-8">
            Choose a strong password for your admin account.
          </p>

          {initializing ? (
            <div className="flex items-center justify-center py-12 text-[var(--admin-muted)]">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-saffron)]" />
            </div>
          ) : ready ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">
                  New password
                </label>
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={setPassword}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--admin-navy)] mb-1.5">
                  Confirm password
                </label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
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
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              <Link
                href="/admin/login"
                className="block w-full h-11 flex items-center justify-center rounded-lg border border-[var(--admin-border)] text-sm font-medium text-[var(--admin-navy)] hover:bg-[var(--admin-navy-soft)] transition-colors"
              >
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-saffron)]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
