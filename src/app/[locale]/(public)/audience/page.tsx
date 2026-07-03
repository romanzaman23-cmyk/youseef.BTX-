import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { TARGET_AUDIENCE } from "@/lib/constants";
import { Users } from "lucide-react";

export default async function AudiencePage() {
  const t = await getTranslations("audience");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="section-padding">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Users className="w-12 h-12 text-btx-accent mx-auto mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              BTX is designed for food industry professionals at every level, from frontline food handlers to senior quality managers and regulatory authorities.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TARGET_AUDIENCE.map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl p-4 card-shadow border border-border/50 hover:border-btx-accent transition-colors flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-btx-secondary shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
