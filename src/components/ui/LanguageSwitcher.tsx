"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      <Globe className="w-4 h-4 text-current opacity-70 hidden sm:block" />
      <button
        onClick={() => switchLocale("en")}
        className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
          locale === "en" ? "bg-btx-secondary text-btx-primary" : "hover:bg-white/10"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("ar")}
        className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
          locale === "ar" ? "bg-btx-secondary text-btx-primary" : "hover:bg-white/10"
        }`}
      >
        عربي
      </button>
    </div>
  );
}
