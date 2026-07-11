"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AnimatedAuthShell } from "@/components/auth/AnimatedAuthShell";
import type { LoginCharacterMood } from "@/components/auth/LoginCharacterAnimation";

async function fetchSessionWithRetry(maxAttempts = 6) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    const sessionData = await sessionRes.json();
    if (sessionData?.user) return sessionData;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

type LoginFormProps = {
  variant?: "participant" | "admin";
  registered?: boolean;
};

export function LoginForm({ variant = "participant", registered = false }: LoginFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const mood: LoginCharacterMood = useMemo(() => {
    if (loading) return "loading";
    if (error) return "error";
    if (focusedField === "password") return passwordVisible ? "peek" : "password";
    if (focusedField === "email") return "email";
    return "idle";
  }, [loading, error, focusedField, passwordVisible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error || result.ok === false) {
        setLoading(false);
        setError(
          result?.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result?.error?.includes("not active")
              ? "Your account is not active. Contact admin for approval."
              : "Login failed. Please check your email and password."
        );
        return;
      }

      const sessionData = await fetchSessionWithRetry();
      if (!sessionData?.user) {
        setLoading(false);
        setError("Login failed: session could not be created. Please try again.");
        return;
      }

      if (variant === "admin" && sessionData.user.role !== "ADMIN") {
        setLoading(false);
        setError("This login is for administrators only.");
        return;
      }

      const destination =
        sessionData.user.role === "ADMIN"
          ? `/${locale}/admin/dashboard`
          : `/${locale}/portal/dashboard`;

      window.location.href = destination;
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
    }
  };

  const isAdmin = variant === "admin";

  return (
    <AnimatedAuthShell
      mood={mood}
      variant={variant}
      title={isAdmin ? t("admin_login_title") : t("login_welcome")}
      subtitle={isAdmin ? t("admin_login_subtitle") : t("login_subtitle")}
    >
      {registered && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Account created successfully. You can log in now.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("email")}</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-field"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField((f) => (f === "email" ? null : f))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("password")}</label>
          <PasswordInput
            name="password"
            required
            autoComplete="current-password"
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField((f) => (f === "password" ? null : f))}
            onVisibilityChange={setPasswordVisible}
          />
        </div>
        <div className="text-right">
          <Link href={`/${locale}/forgot-password`} className="text-sm text-btx-accent hover:underline">
            {t("forgot_link")}
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-full">
          {loading ? "..." : t("login_btn")}
        </button>
      </form>

      {!isAdmin && (
        <p className="mt-8 text-center text-sm text-gray-500">
          {t("no_account")}{" "}
          <Link href={`/${locale}/register`} className="text-btx-accent font-medium hover:underline">
            {t("register_btn")}
          </Link>
        </p>
      )}

      {isAdmin ? (
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href={`/${locale}/login`} className="text-btx-accent hover:underline">
            {t("participant_login_link")}
          </Link>
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-gray-400">
          <Link href={`/${locale}/login/admin`} className="hover:text-btx-accent hover:underline">
            {t("admin_login_link")}
          </Link>
        </p>
      )}
    </AnimatedAuthShell>
  );
}
