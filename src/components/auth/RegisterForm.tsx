"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { UserPlus } from "lucide-react";

export function RegisterForm() {
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
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        mobile: form.get("mobile"),
        companyName: form.get("companyName"),
        jobTitle: form.get("jobTitle"),
        password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push(`/${locale}/login?registered=true`);
  };

  return (
    <div className="bg-white rounded-xl p-8 card-shadow-lg max-w-lg w-full mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-btx-accent flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-btx-primary">{t("register_title")}</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("full_name")}</label>
          <input name="fullName" type="text" required className="input-field" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
            <input name="email" type="email" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("mobile")}</label>
            <input name="mobile" type="tel" required className="input-field" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("company")}</label>
            <input name="companyName" type="text" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("job_title")}</label>
            <input name="jobTitle" type="text" required className="input-field" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <input name="password" type="password" required minLength={8} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirm_password")}</label>
            <input name="confirmPassword" type="password" required className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-accent w-full">
          {loading ? "..." : t("register_btn")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("has_account")}{" "}
        <Link href={`/${locale}/login`} className="text-btx-accent font-medium hover:underline">
          {t("login_btn")}
        </Link>
      </p>
    </div>
  );
}
