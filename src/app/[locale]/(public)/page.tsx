import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import {
  Shield,
  BarChart3,
  Award,
  Users,
  CheckCircle,
  BookOpen,
  Target,
  Globe,
  Lock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { TARGET_AUDIENCE } from "@/lib/constants";

export default async function HomePage() {
  const t = await getTranslations("hero");
  const tAbout = await getTranslations("about");
  const tObj = await getTranslations("objectives");
  const tAssess = await getTranslations("assessment");
  const tBenefits = await getTranslations("benefits");
  const tCert = await getTranslations("certification");
  const tAudience = await getTranslations("audience");
  const tContact = await getTranslations("contact");
  const locale = await getLocale();

  const objectives = [
    tObj("items.assess"),
    tObj("items.measure"),
    tObj("items.identify"),
    tObj("items.evaluate"),
    tObj("items.recruit"),
    tObj("items.culture"),
    tObj("items.training"),
    tObj("items.reports"),
    tObj("items.certificates"),
  ];

  const benefits = [
    { icon: Shield, text: tBenefits("items.validated") },
    { icon: Globe, text: tBenefits("items.international") },
    { icon: BarChart3, text: tBenefits("items.analytics") },
    { icon: Award, text: tBenefits("items.certificates") },
    { icon: CheckCircle, text: tBenefits("items.verification") },
    { icon: BookOpen, text: tBenefits("items.multilingual") },
    { icon: Lock, text: tBenefits("items.secure") },
    { icon: FileText, text: tBenefits("items.reporting") },
  ];

  const levels = [
    { level: 1, name: tAssess("level1"), color: "border-btx-primary" },
    { level: 2, name: tAssess("level2"), color: "border-btx-accent" },
    { level: 3, name: tAssess("level3"), color: "border-btx-secondary" },
    { level: 4, name: tAssess("level4"), color: "border-btx-primary" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-btx-secondary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-btx-accent blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
              <Shield className="w-4 h-4 text-btx-secondary" />
              <span>Food Safety Competency Assessment</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {t("title")}
            </h1>
            <p className="text-xl lg:text-2xl text-btx-secondary font-medium mt-4">
              {t("subtitle")}
            </p>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
              {t("description")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/${locale}/register`} className="btn-secondary inline-flex items-center gap-2">
                {t("cta_register")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={`/${locale}/about`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors font-medium">
                {t("cta_learn")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-padding bg-muted" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-btx-primary">{tAbout("title")}</h2>
            <p className="text-btx-accent font-medium mt-2">{tAbout("subtitle")}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{tAbout("description")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 card-shadow border-l-4 border-btx-primary">
              <Target className="w-10 h-10 text-btx-primary mb-4" />
              <h3 className="text-xl font-bold text-btx-primary">{tAbout("mission_title")}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{tAbout("mission")}</p>
            </div>
            <div className="bg-white rounded-xl p-8 card-shadow border-l-4 border-btx-accent">
              <Award className="w-10 h-10 text-btx-accent mb-4" />
              <h3 className="text-xl font-bold text-btx-primary">{tAbout("vision_title")}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{tAbout("vision")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="section-padding" id="objectives">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-btx-primary">{tObj("title")}</h2>
            <p className="text-gray-500 mt-2">{tObj("subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted hover:bg-btx-primary/5 transition-colors">
                <CheckCircle className="w-5 h-5 text-btx-accent shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Overview */}
      <section className="section-padding bg-btx-primary text-white" id="assessment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{tAssess("title")}</h2>
            <p className="text-white/70 mt-2">{tAssess("subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((l) => (
              <div key={l.level} className={`bg-white/10 backdrop-blur rounded-xl p-6 border-t-4 ${l.color}`}>
                <div className="text-4xl font-bold text-btx-secondary">L{l.level}</div>
                <h3 className="font-semibold mt-2">{l.name}</h3>
                <p className="text-sm text-white/60 mt-2">{tAssess("questions")}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-btx-secondary" /> {tAssess("total")}</span>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-btx-secondary" /> {tAssess("format")}</span>
            <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-btx-secondary" /> {tAssess("duration")}</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-btx-primary">{tBenefits("title")}</h2>
            <p className="text-gray-500 mt-2">{tBenefits("subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-xl p-6 card-shadow text-center hover:card-shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-btx-accent/10 flex items-center justify-center mx-auto">
                  <b.icon className="w-6 h-6 text-btx-accent" />
                </div>
                <p className="mt-4 text-sm text-gray-700 font-medium">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="section-padding bg-muted" id="certification">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-btx-primary">{tCert("title")}</h2>
              <p className="text-btx-accent font-medium mt-2">{tCert("subtitle")}</p>
              <p className="mt-4 text-gray-600 leading-relaxed">{tCert("description")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: tCert("levels.beginner"), color: "bg-gray-100" },
                { label: tCert("levels.practitioner"), color: "bg-btx-primary/10" },
                { label: tCert("levels.advanced"), color: "bg-btx-accent/10" },
                { label: tCert("levels.expert"), color: "bg-btx-secondary/20" },
              ].map((level, i) => (
                <div key={i} className={`${level.color} rounded-xl p-4 text-center`}>
                  <Award className="w-8 h-8 text-btx-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-btx-primary">{level.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="section-padding" id="audience">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-btx-primary">{tAudience("title")}</h2>
            <p className="text-gray-500 mt-2">{tAudience("subtitle")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {TARGET_AUDIENCE.map((item) => (
              <span
                key={item}
                className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 card-shadow border border-border/50 hover:border-btx-accent transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding gradient-primary text-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-12 h-12 text-btx-secondary mx-auto mb-4" />
          <h2 className="text-3xl font-bold">{tContact("title")}</h2>
          <p className="text-white/70 mt-2 mb-8">{tContact("subtitle")}</p>
          <Link href={`/${locale}/contact`} className="btn-secondary inline-flex items-center gap-2">
            {tContact("send")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
