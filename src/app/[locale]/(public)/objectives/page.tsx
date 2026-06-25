import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckCircle } from "lucide-react";

export default async function ObjectivesPage() {
  const t = await getTranslations("objectives");

  const items = [
    t("items.assess"),
    t("items.measure"),
    t("items.identify"),
    t("items.evaluate"),
    t("items.recruit"),
    t("items.culture"),
    t("items.training"),
    t("items.reports"),
    t("items.certificates"),
  ];

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="section-padding bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-6 card-shadow">
                <div className="w-10 h-10 rounded-full bg-btx-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-btx-accent" />
                </div>
                <p className="text-gray-700 leading-relaxed pt-2">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
