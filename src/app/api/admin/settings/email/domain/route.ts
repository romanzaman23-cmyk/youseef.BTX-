import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getEmailConfig,
  getResendDomainId,
  saveEmailSettings,
} from "@/lib/email-settings";
import {
  createResendDomain,
  getResendDomain,
  listResendDomains,
  verifyResendDomain,
} from "@/lib/resend-domains";
import { BRAND } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getEmailConfig();
  if (!config.resendApiKey) {
    return NextResponse.json({ error: "Save Resend API key first" }, { status: 400 });
  }

  try {
    const domainId = await getResendDomainId();
    if (domainId) {
      const domain = await getResendDomain(config.resendApiKey, domainId);
      return NextResponse.json({ domain });
    }

    const list = await listResendDomains(config.resendApiKey);
    const first = list.data?.[0];
    if (first) {
      await saveEmailSettings({ resendDomainId: first.id });
      const domain = await getResendDomain(config.resendApiKey, first.id);
      return NextResponse.json({ domain });
    }

    return NextResponse.json({ domain: null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load domain" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getEmailConfig();
  if (!config.resendApiKey) {
    return NextResponse.json({ error: "Save Resend API key first" }, { status: 400 });
  }

  const body = await request.json();

  if (body.action === "verify") {
    const domainId = (body.domainId as string) || (await getResendDomainId());
    if (!domainId) {
      return NextResponse.json({ error: "No domain configured" }, { status: 400 });
    }
    try {
      await verifyResendDomain(config.resendApiKey, domainId);
      const domain = await getResendDomain(config.resendApiKey, domainId);
      if (domain.status === "verified") {
        await saveEmailSettings({
          resendDomainId: domain.id,
          emailFrom: `${BRAND.fullName} <noreply@${domain.name}>`,
        });
      }
      return NextResponse.json({ domain });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Verification failed" },
        { status: 500 }
      );
    }
  }

  const domainName = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  if (!domainName || !domainName.includes(".")) {
    return NextResponse.json({ error: "Enter a valid domain (e.g. btx-excellence.com)" }, { status: 400 });
  }

  try {
    const created = await createResendDomain(config.resendApiKey, domainName);
    await saveEmailSettings({
      resendDomainId: created.id,
      emailFrom: `${BRAND.fullName} <noreply@${created.name}>`,
    });
    return NextResponse.json({ domain: created });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add domain" },
      { status: 500 }
    );
  }
}
