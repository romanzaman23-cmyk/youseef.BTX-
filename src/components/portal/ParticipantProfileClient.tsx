"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  User,
  Award,
  FileText,
  Settings,
  Lock,
  Bell,
  Download,
  Eye,
  Save,
} from "lucide-react";
import { getCompetencyColor } from "@/lib/competency";
import { CertificateDownloadButton } from "@/components/portal/CertificateDownloadButton";
import Link from "next/link";

interface ProfileData {
  fullName: string;
  email: string;
  mobile: string;
  companyName: string;
  jobTitle: string;
  createdAt: string;
  competencyLevel: string;
  examsCompleted: number;
  averageScore: number;
  certificatesEarned: number;
  notifyEmail: boolean;
  notifySms: boolean;
  examHistory: {
    id: string;
    date: string;
    score: number;
    classification: string;
    hasCertificate: boolean;
    certificateId?: string;
  }[];
  certificates: {
    id: string;
    verificationId: string;
    score: number;
    level: string;
    date: string;
  }[];
}

export function ParticipantProfileClient({
  locale,
  profile,
}: {
  locale: string;
  profile: ProfileData;
}) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "competency" | "history" | "settings" | "certificates">("personal");
  const [form, setForm] = useState({
    fullName: profile.fullName,
    mobile: profile.mobile,
    companyName: profile.companyName,
    jobTitle: profile.jobTitle,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notify, setNotify] = useState({
    notifyEmail: profile.notifyEmail,
    notifySms: profile.notifySms,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const competencyColor = getCompetencyColor(profile.competencyLevel);

  const saveProfile = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Failed to update profile");
      return;
    }
    setMessage(t("profile_updated"));
    router.refresh();
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t("password_mismatch"));
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to change password");
      return;
    }
    setMessage(t("password_changed"));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const saveNotifications = async () => {
    setLoading(true);
    await fetch("/api/profile/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notify),
    });
    setLoading(false);
    setMessage(t("notifications_saved"));
  };

  const tabs = [
    { id: "personal" as const, label: t("personal_info"), icon: User },
    { id: "competency" as const, label: t("competency_info"), icon: Award },
    { id: "history" as const, label: t("exam_history"), icon: FileText },
    { id: "settings" as const, label: t("account_settings"), icon: Settings },
    { id: "certificates" as const, label: t("certificates"), icon: Award },
  ];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">{t("title")}</h1>

      {(message || error) && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${error ? "bg-red-50 text-red-600" : "bg-btx-accent/10 text-btx-accent"}`}>
          {error || message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => { setTab(tabItem.id); setMessage(""); setError(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tabItem.id
                ? "bg-btx-primary text-white"
                : "bg-muted text-gray-600 hover:bg-gray-200"
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "personal" && (
        <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl space-y-4">
          <h2 className="font-bold text-btx-primary">{t("personal_info")}</h2>
          {[
            { key: "fullName", label: t("full_name"), editable: true },
            { key: "email", label: t("email"), editable: false, value: profile.email },
            { key: "mobile", label: t("mobile"), editable: true },
            { key: "companyName", label: t("company"), editable: true },
            { key: "jobTitle", label: t("job_title"), editable: true },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.editable ? (
                <input
                  className="input-field"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              ) : (
                <input className="input-field bg-muted" value={field.value} disabled />
              )}
            </div>
          ))}
          <p className="text-sm text-gray-500">
            {t("registration_date")}: {format(new Date(profile.createdAt), "PPP")}
          </p>
          <button onClick={saveProfile} disabled={loading} className="btn-accent flex items-center gap-2">
            <Save className="w-4 h-4" /> {t("save_profile")}
          </button>
        </div>
      )}

      {tab === "competency" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("current_level"), value: profile.competencyLevel, color: competencyColor },
            { label: t("exams_completed"), value: profile.examsCompleted, color: "#0F2744" },
            { label: t("average_score"), value: profile.examsCompleted ? `${profile.averageScore.toFixed(1)}%` : "—", color: "#00897B" },
            { label: t("certificates_earned"), value: profile.certificatesEarned, color: "#C9A227" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-6 card-shadow text-center">
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="bg-white rounded-xl card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-btx-primary text-white">
              <tr>
                <th className="text-left p-4">{t("exam_name")}</th>
                <th className="text-left p-4">{t("date")}</th>
                <th className="text-left p-4">{t("score")}</th>
                <th className="text-left p-4">{t("classification")}</th>
                <th className="text-left p-4">{t("certificate")}</th>
              </tr>
            </thead>
            <tbody>
              {profile.examHistory.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">{t("no_exams")}</td></tr>
              ) : (
                profile.examHistory.map((exam) => (
                  <tr key={exam.id} className="border-b border-border/50">
                    <td className="p-4">BTX Competency Assessment</td>
                    <td className="p-4">{format(new Date(exam.date), "PP")}</td>
                    <td className="p-4 font-medium">{exam.score.toFixed(1)}%</td>
                    <td className="p-4">{exam.classification}</td>
                    <td className="p-4">
                      {exam.hasCertificate ? (
                        <span className="text-btx-accent text-xs font-medium">Issued</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl p-6 card-shadow space-y-4">
            <h2 className="font-bold text-btx-primary flex items-center gap-2">
              <Lock className="w-5 h-5" /> {t("change_password")}
            </h2>
            <input type="password" placeholder={t("current_password")} className="input-field"
              value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            <input type="password" placeholder={t("new_password")} className="input-field"
              value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            <input type="password" placeholder={t("confirm_password")} className="input-field"
              value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            <button onClick={changePassword} disabled={loading} className="btn-primary">{t("change_password")}</button>
          </div>
          <div className="bg-white rounded-xl p-6 card-shadow space-y-4">
            <h2 className="font-bold text-btx-primary flex items-center gap-2">
              <Bell className="w-5 h-5" /> {t("notification_prefs")}
            </h2>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={notify.notifyEmail} onChange={(e) => setNotify({ ...notify, notifyEmail: e.target.checked })} className="w-4 h-4 accent-btx-accent" />
              <span className="text-sm">{t("email_notifications")}</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={notify.notifySms} onChange={(e) => setNotify({ ...notify, notifySms: e.target.checked })} className="w-4 h-4 accent-btx-accent" />
              <span className="text-sm">{t("sms_notifications")}</span>
            </label>
            <button onClick={saveNotifications} disabled={loading} className="btn-accent">{t("save_preferences")}</button>
          </div>
        </div>
      )}

      {tab === "certificates" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {profile.certificates.length === 0 ? (
            <p className="text-gray-500 col-span-2">{t("no_certificates")}</p>
          ) : (
            profile.certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-xl p-5 card-shadow border-t-4 border-btx-secondary">
                <p className="font-bold text-btx-primary">{cert.level}</p>
                <p className="text-2xl font-bold text-btx-accent mt-1">{cert.score.toFixed(1)}%</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{cert.verificationId}</p>
                <p className="text-sm text-gray-500 mt-2">{format(new Date(cert.date), "PPP")}</p>
                <div className="flex gap-2 mt-4">
                  <CertificateDownloadButton certificateId={cert.id} />
                  <Link href={`/${locale}/portal/certificates`} className="btn-primary text-xs !py-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
