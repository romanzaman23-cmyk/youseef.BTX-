"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const destination =
      sessionData?.user?.role === "ADMIN"
        ? `/${locale}/admin/dashboard`
        : `/${locale}/portal/dashboard`;

    router.push(destination);
    router.refresh();
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
          <input name="email" type="email" required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
          <input name="password" type="password" required className="input-field" />
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
