"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/email-test")
      .then((r) => r.json())
      .then((data) => setEmailConfigured(data.configured))
      .catch(() => setEmailConfigured(false));
  }, []);

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return;
    setTestingEmail(true);
    setEmailMessage("");
    const res = await fetch("/api/admin/email-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail.trim() }),
    });
    const data = await res.json();
    setTestingEmail(false);
    setEmailMessage(res.ok ? "Test email sent! Check your inbox (and spam folder)." : data.error || "Failed to send");
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
        <h2 className="text-lg font-bold text-btx-primary mb-2">Email Notifications</h2>
        <div className="space-y-3 text-sm text-gray-600 mb-4">
          <p>
            <strong>Status:</strong>{" "}
            {emailConfigured === null ? (
              "Checking..."
            ) : emailConfigured ? (
              <span className="text-green-600 font-medium">Configured ✓</span>
            ) : (
              <span className="text-red-600 font-medium">Not configured — emails will NOT be sent</span>
            )}
          </p>
          {!emailConfigured && emailConfigured !== null && (
            <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs leading-relaxed">
              Add these in <strong>Vercel → Settings → Environment Variables</strong>, then redeploy:
              <br />
              <code className="block mt-2">RESEND_API_KEY=re_xxxxx</code>
              <code className="block mt-1">EMAIL_FROM=BTX &lt;onboarding@resend.dev&gt;</code>
              <code className="block mt-1">CRON_SECRET=any-random-secret</code>
              <br />
              Get free API key at{" "}
              <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline">
                resend.com
              </a>
            </div>
          )}
        </div>
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
        {emailMessage && <p className="mt-3 text-sm text-btx-accent">{emailMessage}</p>}
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
