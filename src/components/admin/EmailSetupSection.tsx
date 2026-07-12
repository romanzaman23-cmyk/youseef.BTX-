"use client";

import { useEffect, useState } from "react";
import { Mail, ExternalLink, Globe, Server } from "lucide-react";

interface DnsRecord {
  record: string;
  name: string;
  type: string;
  value: string;
  priority?: number;
  status?: string;
}

interface DomainInfo {
  id: string;
  name: string;
  status: string;
  records?: DnsRecord[];
}

export function EmailSetupSection() {
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [productionReady, setProductionReady] = useState(false);
  const [usingTestSender, setUsingTestSender] = useState(true);
  const [resendKeyHint, setResendKeyHint] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [emailFrom, setEmailFrom] = useState("BTX Excellence <onboarding@resend.dev>");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaveMessage, setEmailSaveMessage] = useState("");
  const [testEmail, setTestEmail] = useState("romanzaman23@gmail.com");
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [domainName, setDomainName] = useState("btx-excellence.com");
  const [domain, setDomain] = useState<DomainInfo | null>(null);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainMessage, setDomainMessage] = useState("");
  const [adminNotify, setAdminNotify] = useState("romanzaman23@gmail.com");

  const loadEmailSettings = () => {
    fetch("/api/admin/settings/email")
      .then((r) => r.json())
      .then((data) => {
        setEmailConfigured(data.configured);
        setProductionReady(!!data.productionReady);
        setUsingTestSender(!!data.usingTestSender);
        setResendKeyHint(data.resendKeyHint || "");
        if (data.emailFrom) setEmailFrom(data.emailFrom);
        if (data.smtpHost) setSmtpHost(data.smtpHost);
        if (data.smtpPort) setSmtpPort(data.smtpPort);
        if (data.smtpUser) setSmtpUser(data.smtpUser);
        if (data.adminNotify) setAdminNotify(data.adminNotify);
      })
      .catch(() => setEmailConfigured(false));
  };

  const loadDomain = () => {
    fetch("/api/admin/settings/email/domain")
      .then((r) => r.json())
      .then((data) => {
        if (data.domain) setDomain(data.domain);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadEmailSettings();
    loadDomain();
  }, []);

  const handleSaveEmail = async () => {
    if (!resendApiKey.trim() && !resendKeyHint && !smtpHost.trim()) {
      setEmailSaveMessage("Add Resend API key OR Brevo SMTP settings below");
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
        smtpHost: smtpHost.trim() || undefined,
        smtpPort: smtpPort.trim() || undefined,
        smtpUser: smtpUser.trim() || undefined,
        smtpPass: smtpPass.trim() || undefined,
        adminNotify: adminNotify.trim() || undefined,
      }),
    });
    const data = await res.json();
    setSavingEmail(false);
    if (res.ok) {
      setEmailConfigured(data.configured);
      setProductionReady(!!data.productionReady);
      setResendApiKey("");
      setSmtpPass("");
      setEmailSaveMessage(
        data.productionReady
          ? "Saved! Emails will go to ALL users."
          : "Saved — but still in test mode. Verify domain or add Brevo SMTP below."
      );
      loadEmailSettings();
    } else {
      setEmailSaveMessage(data.error || "Failed to save");
    }
  };

  const handleAddDomain = async () => {
    setDomainLoading(true);
    setDomainMessage("");
    const res = await fetch("/api/admin/settings/email/domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domainName }),
    });
    const data = await res.json();
    setDomainLoading(false);
    if (res.ok) {
      setDomain(data.domain);
      setEmailFrom(`BTX Excellence <noreply@${data.domain.name}>`);
      setDomainMessage("Domain added! Add these DNS records at your domain provider, then click Check Verification.");
      loadEmailSettings();
    } else {
      setDomainMessage(data.error || "Failed");
    }
  };

  const handleVerifyDomain = async () => {
    if (!domain?.id) return;
    setDomainLoading(true);
    setDomainMessage("");
    const res = await fetch("/api/admin/settings/email/domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", domainId: domain.id }),
    });
    const data = await res.json();
    setDomainLoading(false);
    if (res.ok) {
      setDomain(data.domain);
      if (data.domain.status === "verified") {
        setProductionReady(true);
        setDomainMessage("Domain verified! All users will now receive emails.");
        loadEmailSettings();
      } else {
        setDomainMessage(`Status: ${data.domain.status}. DNS records may still be propagating — wait 10-30 min and try again.`);
      }
    } else {
      setDomainMessage(data.error || "Verification failed");
    }
  };

  const useBrevoPreset = () => {
    setSmtpHost("smtp-relay.brevo.com");
    setSmtpPort("587");
    setEmailSaveMessage("Brevo preset applied. Enter your Brevo login email + SMTP key, then Save.");
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
    setEmailMessage(res.ok ? "Test email sent! Check inbox and spam." : data.error || "Failed");
  };

  return (
    <div className="bg-white rounded-xl p-6 card-shadow max-w-2xl mb-6 border-2 border-amber-200">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5 text-btx-accent" />
        <h2 className="text-lg font-bold text-btx-primary">Email Setup</h2>
      </div>

      {!productionReady && emailConfigured && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mb-4">
          <strong>Test mode:</strong> New users will NOT get welcome emails until you verify a domain below OR add Brevo SMTP.
        </div>
      )}

      {productionReady && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 mb-4">
          <strong>Production ready ✓</strong> — welcome, booking, and reminder emails will go to all users.
        </div>
      )}

      <div className="space-y-4 text-sm">
        <p>
          <strong>Status:</strong>{" "}
          {emailConfigured === null ? "Checking..." : emailConfigured ? (
            productionReady ? (
              <span className="text-green-600 font-medium">Production — all users</span>
            ) : (
              <span className="text-amber-600 font-medium">Test only — your email only</span>
            )
          ) : (
            <span className="text-red-600 font-medium">Not configured</span>
          )}
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resend API Key</label>
          <input type="password" value={resendApiKey} onChange={(e) => setResendApiKey(e.target.value)}
            placeholder={resendKeyHint ? `Saved: ${resendKeyHint}` : "re_..."} className="input-field font-mono text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Alert Email (registration notices)</label>
          <input type="email" value={adminNotify} onChange={(e) => setAdminNotify(e.target.value)} className="input-field text-sm" />
          <p className="text-xs text-gray-400 mt-1">Use your real inbox — e.g. romanzaman23@gmail.com (works with Resend test mode)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
          <input type="text" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} className="input-field text-sm" />
        </div>

        <button onClick={handleSaveEmail} disabled={savingEmail} className="btn-primary">
          {savingEmail ? "Saving..." : "Save Email Settings"}
        </button>
        {emailSaveMessage && <p className="text-sm text-btx-accent">{emailSaveMessage}</p>}

        <hr />

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-btx-accent" />
            <h3 className="font-semibold text-btx-primary">Option A — Verify Domain (Resend)</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">Add DNS records at your domain registrar (GoDaddy, Namecheap, etc.)</p>
          <div className="flex gap-2 mb-3">
            <input type="text" value={domainName} onChange={(e) => setDomainName(e.target.value)} className="input-field flex-1" placeholder="yourdomain.com" />
            <button onClick={handleAddDomain} disabled={domainLoading || !resendKeyHint && !resendApiKey} className="btn-primary whitespace-nowrap">
              Add Domain
            </button>
          </div>
          {domain?.records && domain.records.length > 0 && (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs border border-border/50">
                <thead><tr className="bg-white"><th className="p-2 text-left">Type</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Value</th></tr></thead>
                <tbody>
                  {domain.records.map((r, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="p-2">{r.type}</td>
                      <td className="p-2 font-mono">{r.name}</td>
                      <td className="p-2 font-mono break-all">{r.value}{r.priority ? ` (prio ${r.priority})` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {domain && (
            <p className="text-xs mb-2">Domain: <strong>{domain.name}</strong> — Status: <strong>{domain.status}</strong></p>
          )}
          <button onClick={handleVerifyDomain} disabled={domainLoading || !domain} className="btn-primary text-sm">
            Check Verification
          </button>
          {domainMessage && <p className="text-xs mt-2 text-btx-accent">{domainMessage}</p>}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-btx-accent" />
            <h3 className="font-semibold text-btx-primary">Option B — Brevo SMTP (no domain needed)</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            <a href="https://www.brevo.com" target="_blank" rel="noreferrer" className="underline">brevo.com</a> free account → verify sender email → SMTP & API → SMTP key
          </p>
          <button type="button" onClick={useBrevoPreset} className="text-xs text-btx-accent underline mb-3">Use Brevo preset</button>
          <div className="grid sm:grid-cols-2 gap-2">
            <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="SMTP Host" className="input-field text-sm" />
            <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" className="input-field text-sm" />
            <input type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="Brevo login email" className="input-field text-sm" />
            <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="Brevo SMTP key" className="input-field text-sm" />
          </div>
          <p className="text-xs text-gray-500 mt-2">From Address: use your verified Brevo email, e.g. BTX &lt;romanzaman23@gmail.com&gt;</p>
        </div>

        <hr />

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Send Test Email</label>
            <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="input-field" />
          </div>
          <button onClick={handleTestEmail} disabled={testingEmail || !emailConfigured} className="btn-primary whitespace-nowrap">
            {testingEmail ? "Sending..." : "Send Test"}
          </button>
        </div>
        {emailMessage && <p className="text-sm text-btx-accent">{emailMessage}</p>}
      </div>
    </div>
  );
}
