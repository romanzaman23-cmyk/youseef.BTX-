"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
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
  HelpCircle,
  Users,
  Calendar,
  BarChart3,
  Settings,
  CalendarDays,
  ShieldCheck,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

type SidebarVariant = "portal" | "admin";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type AppSidebarProps = {
  variant: SidebarVariant;
};

const variantStyles = {
  portal: {
    aside: "bg-gradient-to-b from-[#0a1f38] to-btx-primary",
    accent: "border-l-4 border-l-btx-accent",
    badge: "bg-btx-accent/15 text-emerald-300 border border-btx-accent/30",
    badgeIcon: GraduationCap,
    active: "bg-btx-accent text-white shadow-md",
  },
  admin: {
    aside: "bg-gradient-to-b from-[#1a1508] to-[#0F2744]",
    accent: "border-l-4 border-l-btx-secondary",
    badge: "bg-btx-secondary/15 text-btx-secondary border border-btx-secondary/40",
    badgeIcon: ShieldCheck,
    active: "bg-btx-secondary text-btx-primary shadow-md",
  },
} as const;

export function AppSidebar({ variant }: AppSidebarProps) {
  const tPortal = useTranslations("portal");
  const tAdmin = useTranslations("admin");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const styles = variantStyles[variant];
  const BadgeIcon = styles.badgeIcon;
  const badgeLabel = variant === "admin" ? tNav("admin_badge") : tNav("participant_badge");

  const portalLinks: NavLink[] = [
    { href: `/${locale}/portal/dashboard`, label: tPortal("dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/portal/booking`, label: tPortal("booking"), icon: CalendarDays },
    { href: `/${locale}/portal/quizzes`, label: tPortal("my_quizzes"), icon: BookOpen },
    { href: `/${locale}/portal/results`, label: tPortal("results"), icon: FileText },
    { href: `/${locale}/portal/certificates`, label: tPortal("certificates"), icon: Award },
    { href: `/${locale}/portal/profile`, label: tPortal("profile"), icon: User },
    { href: `/${locale}/portal/notifications`, label: tPortal("notifications"), icon: Bell },
  ];

  const adminLinks: NavLink[] = [
    { href: `/${locale}/admin/dashboard`, label: tAdmin("dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/admin/users`, label: tAdmin("participants"), icon: Users },
    { href: `/${locale}/admin/questions`, label: tAdmin("question_bank"), icon: HelpCircle },
    { href: `/${locale}/admin/exams`, label: tAdmin("exams"), icon: Calendar },
    { href: `/${locale}/admin/reports`, label: tAdmin("reports"), icon: BarChart3 },
    { href: `/${locale}/admin/certificates`, label: tAdmin("certificates"), icon: Award },
    { href: `/${locale}/admin/profile`, label: tAdmin("profile"), icon: User },
    { href: `/${locale}/admin/settings`, label: tAdmin("settings"), icon: Settings },
  ];

  const links = variant === "admin" ? adminLinks : portalLinks;
  const portalTitle = variant === "admin" ? tNav("admin") : tNav("portal");
  const switchHref =
    variant === "admin" ? `/${locale}/portal/dashboard` : `/${locale}/admin/dashboard`;
  const switchLabel =
    variant === "admin" ? tNav("portal") : tNav("admin");
  const showSwitchLink = variant === "admin" || session?.user?.role === "ADMIN";

  const NavContent = () => (
    <>
      <div className={cn("p-4 border-b border-white/10", styles.accent)}>
        <Logo locale={locale} variant="light" size="sm" />
        <div className={cn("mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", styles.badge)}>
          <BadgeIcon className="w-3.5 h-3.5" />
          {badgeLabel}
        </div>
        <p className="text-xs text-white/60 mt-2">{portalTitle}</p>
        {session?.user?.email && (
          <p className="text-xs text-white/40 mt-1 truncate">{session.user.email}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? styles.active : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        {showSwitchLink && session?.user?.role === "ADMIN" && (
          <Link
            href={switchHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            {variant === "admin" ? (
              <GraduationCap className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            {switchLabel}
          </Link>
        )}
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
          "fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-40 w-64 text-white flex flex-col shrink-0 transition-transform lg:translate-x-0",
          styles.aside,
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
