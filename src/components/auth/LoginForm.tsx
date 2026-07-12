import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogIn } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { getAuthOrigin } from "@/lib/auth-csrf";

type LoginFormProps = {
  csrfToken: string;
  locale: string;
  variant?: "participant" | "admin";
  registered?: boolean;
  error?: string;
};

export async function LoginForm({
  csrfToken,
  locale,
  variant = "participant",
  registered = false,
  error,
}: LoginFormProps) {
  const t = await getTranslations("auth");
  const isAdmin = variant === "admin";
  const origin = await getAuthOrigin();
  const callbackUrl = `${origin}/${locale}/${isAdmin ? "admin/dashboard" : "portal/dashboard"}`;

  return (
    <div className="bg-white rounded-xl p-8 card-shadow-lg max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-btx-primary flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-btx-secondary" />
        </div>
        <h1 className="text-2xl font-bold text-btx-primary">
          {isAdmin ? t("admin_login_title") : t("login_title")}
        </h1>
      </div>

      {registered && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Account created successfully. You can log in now.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <form method="post" action="/api/auth/callback/credentials" className="space-y-4">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

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
        <button type="submit" className="btn-primary w-full">
          {t("login_btn")}
        </button>
      </form>

      {!isAdmin && (
        <p className="mt-6 text-center text-sm text-gray-500">
          {t("no_account")}{" "}
          <Link href={`/${locale}/register`} className="text-btx-accent font-medium hover:underline">
            {t("register_btn")}
          </Link>
        </p>
      )}

      {isAdmin ? (
        <p className="mt-4 text-center text-sm text-gray-500">
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
    </div>
  );
}
