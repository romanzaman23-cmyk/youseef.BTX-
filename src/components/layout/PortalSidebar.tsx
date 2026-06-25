"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Bell,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export function PortalSidebar() {
  const t = useTranslations("portal");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}/portal/dashboard`, label: t("dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/portal/quizzes`, label: t("my_quizzes"), icon: BookOpen },
    { href: `/${locale}/portal/results`, label: t("results"), icon: FileText },
    { href: `/${locale}/portal/certificates`, label: t("certificates"), icon: Award },
    { href: `/${locale}/portal/profile`, label: t("profile"), icon: User },
    { href: `/${locale}/portal/notifications`, label: t("notifications"), icon: Bell },
  ];

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-white/10">
        <Logo locale={locale} variant="light" size="sm" />
        <p className="text-xs text-white/50 mt-2">{tNav("portal")}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-btx-secondary text-btx-primary"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {tNav("logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-btx-primary text-white rounded-lg shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-btx-primary text-white flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
