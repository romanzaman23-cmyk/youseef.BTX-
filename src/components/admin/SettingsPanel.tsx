"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ExternalLink } from "lucide-react";

interface Thresholds {
  beginnerMax: number;
  practitionerMin: number;
  practitionerMax: number;
  advancedMin: number;
  advancedMax: number;
  expertMin: number;
}

export function SettingsPanel({ thresholds }: { thresholds: Thresholds }) {
  const router = useRouter();
  const [values, setValues] = useState(thresholds);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [resendKeyHint, setResendKeyHint] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [emailFrom, setEmailFrom] = useState("BTX Excellence <onboarding@resend.dev>");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaveMessage, setEmailSaveMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const loadEmailSettings = () => {
    fetch("/api/admin/settings/email")
      .then((r) => r.json())
      .then((data) => {
        setEmailConfigured(data.configured);
        setResendKeyHint(data.resendKeyHint || "");
        if (data.emailFrom) setEmailFrom(data.emailFrom);
      })
      .catch(() => setEmailConfigured(false));
  };

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const handleSaveEmail = async () => {
    if (!resendApiKey.trim() && !resendKeyHint) {
      setEmailSaveMessage("Please paste your Resend API key (starts with re_)");
      return;
    }
    setSavingEmail(true);
    setEmailSaveMessage("");
    const res = await fetch("/api/admin/settings/email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resendApiKey: resendApiKey.trim() || undefined,
        emailFrom: emailFrom.trim(),
      }),
    });
    const data = await res.json();
    setSavingEmail(false);
    if (res.ok) {
      setEmailConfigured(data.configured);
      setResendApiKey("");
      setEmailSaveMessage("Email settings saved! Now send a test email below.");
      loadEmailSettings();
    } else {
      setEmailSaveMessage(data.error || "Failed to save");
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return;
    setTestingEmail(true);
    setEmailMessage("");
    const res = await fetch("/api/admin/settings/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail.trim() }),
    });
    const data = await res.json();
    setTestingEmail(false);
    setEmailMessage(
      res.ok
        ? "Test email sent! Check inbox and spam folder."
        : data.error || "Failed to send"
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings/thresholds", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setMessage("Settings saved successfully.");
    router.refresh();
  };

  const fields = [
    { key: "beginnerMax", label: "Beginner Max (%)", desc: "Below this = Beginner" },
    { key: "practitionerMin", label: "Practitioner Min (%)", desc: "" },
    { key: "practitionerMax", label: "Practitioner Max (%)", desc: "" },
    { key: "advancedMin", label: "Advanced Min (%)", desc: "" },
    { key: "advancedMax", label: "Advanced Max (%)", desc: "" },
    { key: "expertMin", label: "Expert Min (%)", desc: "85% and above = Expert" },
  ] as const;

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">Settings</h1>

      <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl mb-6 border-2 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-btx-accent" />
          <h2 className="text-lg font-bold text-btx-primary">Email Setup (Required for Welcome & Reminder Emails)</h2>
        </div>

        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 mb-4">
          <strong>Emails nahi aa rahi?</strong> Neeche Resend API key paste karein aur Save dabayein — phir test email bhejein.
        </div>

        <div className="space-y-4 text-sm">
          <p>
            <strong>Status:</strong>{" "}
            {emailConfigured === null ? (
              "Checking..."
            ) : emailConfigured ? (
              <span className="text-green-600 font-medium">Active ✓ Emails will be sent</span>
            ) : (
              <span className="text-red-600 font-medium">Not active — no emails being sent</span>
            )}
            {resendKeyHint && (
              <span className="block text-xs text-gray-500 mt-1">Saved key: {resendKeyHint}</span>
            )}
          </p>

          <ol className="list-decimal list-inside space-y-1 text-gray-600 bg-muted/50 p-3 rounded-lg">
            <li>
              <a href="https://resend.com/signup" target="_blank" rel="noreferrer" className="text-btx-accent underline inline-flex items-center gap-1">
                resend.com par free account banayein <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>API Keys → Create API Key → copy karein (<code>re_...</code>)</li>
            <li>Neeche paste karein aur Save Email Settings dabayein</li>
            <li>Test email bhej kar check karein</li>
          </ol>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resend API Key</label>
            <input
              type="password"
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              placeholder={resendKeyHint ? "Enter new key to replace saved key" : "re_xxxxxxxxxx"}
              className="input-field font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
            <input
              type="text"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              className="input-field text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Testing: use onboarding@resend.dev until your domain is verified</p>
          </div>

          <button onClick={handleSaveEmail} disabled={savingEmail} className="btn-primary">
            {savingEmail ? "Saving..." : "Save Email Settings"}
          </button>
          {emailSaveMessage && <p className="text-sm text-btx-accent">{emailSaveMessage}</p>}

          <hr className="border-border/50" />

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Send Test Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
              />
            </div>
            <button
              onClick={handleTestEmail}
              disabled={testingEmail || !emailConfigured}
              className="btn-primary whitespace-nowrap"
            >
              {testingEmail ? "Sending..." : "Send Test"}
            </button>
          </div>
          {emailMessage && <p className="text-sm text-btx-accent">{emailMessage}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl">
        <h2 className="text-lg font-bold text-btx-primary mb-2">Competency Classification Thresholds</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure the score thresholds for competency classification levels.
        </p>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type="number"
                step="0.01"
                value={values[f.key]}
                onChange={(e) => setValues({ ...values, [f.key]: parseFloat(e.target.value) })}
                className="input-field w-40"
              />
              {f.desc && <p className="text-xs text-gray-400 mt-1">{f.desc}</p>}
            </div>
          ))}
        </div>

        {message && <p className="mt-4 text-sm text-btx-accent">{message}</p>}

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-6">
          {saving ? "Saving..." : "Save Thresholds"}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl mt-6">
        <h2 className="text-lg font-bold text-btx-primary mb-2">Platform Configuration</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>Exam Cooldown:</strong> 3 months between attempts</p>
          <p><strong>Questions per Exam:</strong> 50 (randomized from 400-question bank)</p>
          <p><strong>Exam Duration:</strong> 60 minutes</p>
          <p><strong>Languages:</strong> English, Arabic (RTL)</p>
        </div>
      </div>
    </div>
  );
}
