"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { LogIn } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";

async function fetchSessionWithRetry(maxAttempts = 6) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    const sessionData = await sessionRes.json();
    if (sessionData?.user) return sessionData;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="bg-white rounded-xl p-8 card-shadow-lg max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-btx-primary flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-btx-secondary" />
        </div>
        <h1 className="text-2xl font-bold text-btx-primary">{t("login_title")}</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
          <input name="email" type="email" required autoComplete="email" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
          <PasswordInput name="password" required autoComplete="current-password" />
        </div>
        <div className="text-right">
          <Link href={`/${locale}/forgot-password`} className="text-sm text-btx-accent hover:underline">
            {t("forgot_link")}
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "..." : t("login_btn")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("no_account")}{" "}
        <Link href={`/${locale}/register`} className="text-btx-accent font-medium hover:underline">
          {t("register_btn")}
        </Link>
      </p>
    </div>
  );
}
