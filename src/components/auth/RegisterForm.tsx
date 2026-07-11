"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AnimatedAuthShell } from "@/components/auth/AnimatedAuthShell";
import type { LoginCharacterMood } from "@/components/auth/LoginCharacterAnimation";

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | "other" | null>(null);
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
    <AnimatedAuthShell
      mood={mood}
      variant="participant"
      title={t("register_title")}
      subtitle={t("register_subtitle")}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("full_name")}</label>
          <input
            name="fullName"
            type="text"
            required
            className="input-field"
            onFocus={() => setFocusedField("other")}
            onBlur={() => setFocusedField(null)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
            <input
              name="email"
              type="email"
              required
              className="input-field"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("mobile")}</label>
            <input
              name="mobile"
              type="tel"
              required
              className="input-field"
              onFocus={() => setFocusedField("other")}
              onBlur={() => setFocusedField(null)}
            />
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
            <PasswordInput
              name="password"
              required
              minLength={8}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onVisibilityChange={setPasswordVisible}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirm_password")}</label>
            <PasswordInput
              name="confirmPassword"
              required
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-accent w-full py-3 rounded-full">
          {loading ? "..." : t("register_btn")}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        {t("has_account")}{" "}
        <Link href={`/${locale}/login`} className="text-btx-accent font-medium hover:underline">
          {t("login_btn")}
        </Link>
      </p>
    </AnimatedAuthShell>
  );
}
