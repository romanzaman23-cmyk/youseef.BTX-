"use client";

import { useLocale } from "next-intl";
import { LoginCharacterAnimation, type LoginCharacterMood } from "@/components/auth/LoginCharacterAnimation";
import { Logo } from "@/components/ui/Logo";

type Props = {
  mood: LoginCharacterMood;
  variant?: "participant" | "admin";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AnimatedAuthShell({ mood, variant = "participant", title, subtitle, children }: Props) {
  const locale = useLocale();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:block min-h-full">
        <LoginCharacterAnimation mood={mood} variant={variant} />
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8 lg:hidden rounded-2xl overflow-hidden min-h-[280px]">
            <LoginCharacterAnimation mood={mood} variant={variant} />
          </div>

          <div className="mb-8">
            <div className="mb-6">
              <Logo locale={locale} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-btx-primary">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
