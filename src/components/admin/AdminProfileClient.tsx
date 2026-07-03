"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  User,
  Shield,
  Activity,
  Bell,
  Lock,
  Save,
  Server,
} from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";

interface AdminProfileData {
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  twoFactorEnabled: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  activityLogs: { action: string; details: string | null; createdAt: string }[];
  loginHistories: { ipAddress: string | null; userAgent: string | null; createdAt: string }[];
}

export function AdminProfileClient({ profile }: { profile: AdminProfileData }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "security" | "activity" | "notifications" | "system">("personal");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [twoFactor, setTwoFactor] = useState(profile.twoFactorEnabled);
  const [notify, setNotify] = useState({ notifyEmail: profile.notifyEmail, notifySms: profile.notifySms });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t("password_mismatch"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setMessage(t("password_changed"));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const saveSecurity = async () => {
    setLoading(true);
    await fetch("/api/profile/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twoFactorEnabled: twoFactor }),
    });
    setLoading(false);
    setMessage(t("security_saved"));
    router.refresh();
  };

  const tabs = [
    { id: "personal" as const, label: t("personal_info"), icon: User },
    { id: "security" as const, label: t("security_settings"), icon: Shield },
    { id: "activity" as const, label: t("activity_logs"), icon: Activity },
    { id: "notifications" as const, label: t("notification_settings"), icon: Bell },
    { id: "system" as const, label: t("system_access"), icon: Server },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center text-2xl font-bold text-btx-secondary">
          {profile.fullName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary">{profile.fullName}</h1>
          <p className="text-btx-accent font-medium">{profile.role}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

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
              tab === tabItem.id ? "bg-btx-primary text-white" : "bg-muted text-gray-600 hover:bg-gray-200"
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "personal" && (
        <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl grid sm:grid-cols-2 gap-4">
          {[
            { label: t("full_name"), value: profile.fullName },
            { label: t("email"), value: profile.email },
            { label: t("mobile"), value: profile.mobile },
            { label: t("role"), value: profile.role },
            { label: t("account_status"), value: profile.status },
            { label: t("last_login"), value: profile.lastLoginAt ? format(new Date(profile.lastLoginAt), "PPp") : "—" },
            { label: t("registration_date"), value: format(new Date(profile.createdAt), "PPP") },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="font-medium text-btx-primary">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl p-6 card-shadow space-y-4">
            <h2 className="font-bold text-btx-primary flex items-center gap-2"><Lock className="w-5 h-5" /> {t("change_password")}</h2>
            <PasswordInput placeholder={t("current_password")} className="input-field" value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            <PasswordInput placeholder={t("new_password")} className="input-field" value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            <PasswordInput placeholder={t("confirm_password")} className="input-field" value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            <button onClick={changePassword} disabled={loading} className="btn-primary">{t("change_password")}</button>
          </div>
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h2 className="font-bold text-btx-primary mb-4">{t("two_factor")}</h2>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="w-4 h-4 accent-btx-accent" />
              <span className="text-sm">{t("two_factor_ready")}</span>
            </label>
            <p className="text-xs text-gray-400 mt-2">{t("two_factor_desc")}</p>
            <button onClick={saveSecurity} disabled={loading} className="btn-accent mt-4 flex items-center gap-2">
              <Save className="w-4 h-4" /> {t("save_security")}
            </button>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-bold text-btx-primary">{t("recent_actions")}</h3></div>
            {profile.activityLogs.length === 0 ? (
              <p className="p-6 text-gray-500 text-sm">{t("no_activity")}</p>
            ) : (
              <div className="divide-y">
                {profile.activityLogs.map((log, i) => (
                  <div key={i} className="p-4 flex justify-between gap-4">
                    <div>
                      <p className="font-medium text-btx-primary text-sm">{log.action}</p>
                      {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{format(new Date(log.createdAt), "PPp")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-bold text-btx-primary">{t("login_history")}</h3></div>
            {profile.loginHistories.length === 0 ? (
              <p className="p-6 text-gray-500 text-sm">{t("no_logins")}</p>
            ) : (
              <div className="divide-y">
                {profile.loginHistories.map((log, i) => (
                  <div key={i} className="p-4 flex justify-between gap-4 text-sm">
                    <span className="text-gray-600">{log.ipAddress || "Unknown IP"}</span>
                    <span className="text-xs text-gray-400">{format(new Date(log.createdAt), "PPp")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={notify.notifyEmail} onChange={(e) => setNotify({ ...notify, notifyEmail: e.target.checked })} className="w-4 h-4 accent-btx-accent" />
            <span className="text-sm">{t("email_notifications")}</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={notify.notifySms} onChange={(e) => setNotify({ ...notify, notifySms: e.target.checked })} className="w-4 h-4 accent-btx-accent" />
            <span className="text-sm">{t("sms_notifications")}</span>
          </label>
          <button onClick={async () => {
            setLoading(true);
            await fetch("/api/profile/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notify) });
            setLoading(false);
            setMessage(t("notifications_saved"));
          }} className="btn-accent">{t("save_preferences")}</button>
        </div>
      )}

      {tab === "system" && (
        <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">{t("access_level")}</span><span className="font-medium text-btx-primary">Full Administrator</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">{t("portals")}</span><span className="font-medium">Admin Portal, Participant Portal</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">{t("permissions")}</span><span className="font-medium">Users, Questions, Exams, Reports, Settings</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">{t("account_status")}</span><span className="font-medium text-btx-accent">{profile.status}</span></div>
        </div>
      )}
    </div>
  );
}
