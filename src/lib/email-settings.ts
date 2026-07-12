import { prisma } from "@/lib/prisma";

const EMAIL_KEYS = {
  resendApiKey: "email.resend_api_key",
  emailFrom: "email.from",
  resendDomainId: "email.resend_domain_id",
  smtpHost: "email.smtp_host",
  smtpPort: "email.smtp_port",
  smtpUser: "email.smtp_user",
  smtpPass: "email.smtp_pass",
} as const;

export interface EmailConfig {
  resendApiKey: string;
  emailFrom: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
}

async function readSetting(key: string): Promise<string> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  return row?.value?.trim() || "";
}

export async function getEmailConfig(): Promise<EmailConfig> {
  const [dbResend, dbFrom, dbHost, dbPort, dbUser, dbPass] = await Promise.all([
    readSetting(EMAIL_KEYS.resendApiKey),
    readSetting(EMAIL_KEYS.emailFrom),
    readSetting(EMAIL_KEYS.smtpHost),
    readSetting(EMAIL_KEYS.smtpPort),
    readSetting(EMAIL_KEYS.smtpUser),
    readSetting(EMAIL_KEYS.smtpPass),
  ]);

  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || dbResend,
    emailFrom: process.env.EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim() || dbFrom,
    smtpHost: process.env.SMTP_HOST?.trim() || dbHost,
    smtpPort: process.env.SMTP_PORT?.trim() || dbPort || "587",
    smtpUser: process.env.SMTP_USER?.trim() || dbUser,
    smtpPass: process.env.SMTP_PASS?.trim() || dbPass,
  };
}

export async function isEmailConfiguredAsync(): Promise<boolean> {
  const config = await getEmailConfig();
  return !!(
    config.resendApiKey ||
    (config.smtpHost && config.smtpUser && config.smtpPass)
  );
}

export async function saveEmailSettings(data: {
  resendApiKey?: string;
  emailFrom?: string;
  resendDomainId?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
}) {
  const upserts: Array<{ key: string; value: string }> = [];

  if (data.resendApiKey !== undefined && data.resendApiKey.trim()) {
    upserts.push({ key: EMAIL_KEYS.resendApiKey, value: data.resendApiKey.trim() });
  }
  if (data.emailFrom !== undefined && data.emailFrom.trim()) {
    upserts.push({ key: EMAIL_KEYS.emailFrom, value: data.emailFrom.trim() });
  }
  if (data.resendDomainId !== undefined && data.resendDomainId.trim()) {
    upserts.push({ key: EMAIL_KEYS.resendDomainId, value: data.resendDomainId.trim() });
  }
  if (data.smtpHost !== undefined && data.smtpHost.trim()) {
    upserts.push({ key: EMAIL_KEYS.smtpHost, value: data.smtpHost.trim() });
  }
  if (data.smtpPort !== undefined && data.smtpPort.trim()) {
    upserts.push({ key: EMAIL_KEYS.smtpPort, value: data.smtpPort.trim() });
  }
  if (data.smtpUser !== undefined && data.smtpUser.trim()) {
    upserts.push({ key: EMAIL_KEYS.smtpUser, value: data.smtpUser.trim() });
  }
  if (data.smtpPass !== undefined && data.smtpPass.trim()) {
    upserts.push({ key: EMAIL_KEYS.smtpPass, value: data.smtpPass.trim() });
  }

  for (const item of upserts) {
    await prisma.systemSetting.upsert({
      where: { key: item.key },
      create: { key: item.key, value: item.value },
      update: { value: item.value },
    });
  }
}

export async function getResendDomainId(): Promise<string> {
  return readSetting(EMAIL_KEYS.resendDomainId);
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `••••••••${key.slice(-6)}`;
}

/** Returns true if Resend accepts this API key. */
export async function validateResendApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith("re_")) {
    return { valid: false, error: "API key must start with re_" };
  }

  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${trimmed}` },
    });

    if (response.ok) return { valid: true };

    const body = await response.text();
    if (response.status === 401 || body.includes("invalid")) {
      return { valid: false, error: "Invalid API key — create a new key at resend.com/api-keys" };
    }
    return { valid: false, error: `Resend error (${response.status}): ${body}` };
  } catch {
    return { valid: false, error: "Could not reach Resend. Check your internet connection." };
  }
}
