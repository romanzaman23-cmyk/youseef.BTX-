"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <section className="section-padding bg-muted min-h-[70vh] flex items-center">
      <div className="bg-white rounded-xl p-8 card-shadow-lg max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-btx-secondary flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-btx-primary" />
          </div>
          <h1 className="text-2xl font-bold text-btx-primary">{t("forgot_title")}</h1>
        </div>

        {sent ? (
          <p className="text-center text-gray-600">
            If an account exists with that email, a password reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
              <input name="email" type="email" required className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "..." : t("reset_btn")}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href={`/${locale}/login`} className="text-btx-accent hover:underline">
            {t("back_login")}
          </Link>
        </p>
      </div>
    </section>
  );
}
