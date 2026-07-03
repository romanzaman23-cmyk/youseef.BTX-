import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Target, Award, Shield, Users } from "lucide-react";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="section-padding">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-600 leading-relaxed text-center mb-12">{t("description")}</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 card-shadow border-l-4 border-btx-primary">
              <Target className="w-10 h-10 text-btx-primary mb-4" />
              <h3 className="text-xl font-bold text-btx-primary">{t("mission_title")}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{t("mission")}</p>
            </div>
            <div className="bg-white rounded-xl p-8 card-shadow border-l-4 border-btx-accent">
              <Award className="w-10 h-10 text-btx-accent mb-4" />
              <h3 className="text-xl font-bold text-btx-primary">{t("vision_title")}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{t("vision")}</p>
            </div>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Validated Assessment", desc: "Rigorous competency measurement aligned with international food safety standards." },
              { icon: Users, title: "Global Reach", desc: "Serving food industry professionals across diverse sectors and regions." },
              { icon: Award, title: "Certified Excellence", desc: "Professional certificates with QR verification for instant authenticity checks." },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <item.icon className="w-10 h-10 text-btx-secondary mx-auto mb-3" />
                <h4 className="font-bold text-btx-primary">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
