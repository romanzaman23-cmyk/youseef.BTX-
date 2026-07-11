"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LogIn } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginAction, type LoginState } from "@/actions/login";

type LoginFormProps = {
  variant?: "participant" | "admin";
  registered?: boolean;
};

const initialState: LoginState = {};

export function LoginForm({ variant = "participant", registered = false }: LoginFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const isAdmin = variant === "admin";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

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

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{state.error}</div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="variant" value={variant} />

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
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "..." : t("login_btn")}
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
