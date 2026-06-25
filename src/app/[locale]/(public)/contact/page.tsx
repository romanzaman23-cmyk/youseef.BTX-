"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="section-padding bg-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-btx-primary">{t("info_title")}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-btx-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-btx-primary">{t("address")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-btx-accent" />
                  <p className="text-gray-600">{t("phone")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-btx-accent" />
                  <p className="text-gray-600">{t("email_label")}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white rounded-xl p-8 card-shadow">
              {sent ? (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 text-btx-accent mx-auto mb-4" />
                  <p className="text-lg font-medium text-btx-primary">{t("success")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("name")}</label>
                    <input type="text" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
                    <input type="email" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("subject")}</label>
                    <input type="text" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("message")}</label>
                    <textarea required rows={5} className="input-field resize-none" />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> {t("send")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
