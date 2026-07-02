import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { Mail, Phone, MapPin } from "lucide-react";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <footer className="gradient-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <Logo locale={locale} variant="light" />
            <p className="mt-4 text-white/70 text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-btx-secondary mb-4">{t("quick_links")}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{tNav("about")}</Link></li>
              <li><Link href={`/${locale}/objectives`} className="hover:text-white transition-colors">{tNav("objectives")}</Link></li>
              <li><Link href={`/${locale}/audience`} className="hover:text-white transition-colors">{tNav("audience")}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{tNav("contact")}</Link></li>
              <li><Link href={`/${locale}/verify-certificate`} className="hover:text-white transition-colors">{t("verify")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-btx-secondary mb-4">{t("contact")}</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-btx-accent shrink-0" />
                Bin Tuwaym Excellence Center
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-btx-accent shrink-0" />
                +971 4 XXX XXXX
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-btx-accent shrink-0" />
                info@btx-excellence.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-btx-secondary mb-4">{tNav("portal")}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href={`/${locale}/login`} className="hover:text-white transition-colors">{tNav("login")}</Link></li>
              <li><Link href={`/${locale}/register`} className="hover:text-white transition-colors">{tNav("register")}</Link></li>
              <li><Link href={`/${locale}/portal/dashboard`} className="hover:text-white transition-colors">{tNav("portal")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/50">
          © {new Date().getFullYear()} BTX – Bin Tuwaym Excellence. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
