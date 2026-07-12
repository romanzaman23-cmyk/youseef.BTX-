import { getEmailConfig } from "@/lib/email-settings";

export function isTestingResendFrom(from: string): boolean {
  return from.includes("@resend.dev");
}

export async function canSendToAnyRecipient(): Promise<boolean> {
  const config = await getEmailConfig();
  if (config.smtpHost && config.smtpUser && config.smtpPass) return true;
  if (config.resendApiKey && config.emailFrom && !isTestingResendFrom(config.emailFrom)) return true;
  return false;
}

async function resendFetch(path: string, apiKey: string, init?: RequestInit) {
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`Resend error (${response.status}): ${text}`);
  }
  return json;
}

export async function createResendDomain(apiKey: string, domain: string) {
  return resendFetch("/domains", apiKey, {
    method: "POST",
    body: JSON.stringify({ name: domain.trim().toLowerCase() }),
  }) as Promise<{
    id: string;
    name: string;
    status: string;
    records: Array<{
      record: string;
      name: string;
      type: string;
      value: string;
      priority?: number;
      status?: string;
    }>;
  }>;
}

export async function listResendDomains(apiKey: string) {
  return resendFetch("/domains", apiKey) as Promise<{
    data: Array<{ id: string; name: string; status: string; created_at: string }>;
  }>;
}

export async function getResendDomain(apiKey: string, domainId: string) {
  return resendFetch(`/domains/${domainId}`, apiKey) as Promise<{
    id: string;
    name: string;
    status: string;
    records: Array<{
      record: string;
      name: string;
      type: string;
      value: string;
      priority?: number;
      status?: string;
    }>;
  }>;
}

export async function verifyResendDomain(apiKey: string, domainId: string) {
  return resendFetch(`/domains/${domainId}/verify`, apiKey, { method: "POST" });
}
