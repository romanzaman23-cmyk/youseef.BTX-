import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getEmailConfig,
  isEmailConfiguredAsync,
  maskApiKey,
  saveEmailSettings,
  validateResendApiKey,
} from "@/lib/email-settings";
import { sendEmail, emailLayout } from "@/lib/email";
import { canSendToAnyRecipient, isTestingResendFrom } from "@/lib/resend-domains";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getEmailConfig();
  const configured = await isEmailConfiguredAsync();
  const productionReady = await canSendToAnyRecipient();

  return NextResponse.json({
    configured,
    productionReady,
    usingTestSender: isTestingResendFrom(config.emailFrom || "onboarding@resend.dev"),
    emailFrom: config.emailFrom || "BTX Excellence <onboarding@resend.dev>",
    hasResendKey: !!config.resendApiKey,
    hasSmtp: !!(config.smtpHost && config.smtpUser && config.smtpPass),
    resendKeyHint: maskApiKey(config.resendApiKey),
    smtpHost: config.smtpHost || "",
    smtpPort: config.smtpPort || "587",
    smtpUser: config.smtpUser || "",
    provider: config.smtpHost ? "smtp" : config.resendApiKey ? "resend" : "none",
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const resendApiKey = typeof body.resendApiKey === "string" ? body.resendApiKey.trim() : undefined;

  if (resendApiKey) {
    const validation = await validateResendApiKey(resendApiKey);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || "Invalid API key" }, { status: 400 });
    }
  }

  await saveEmailSettings({
    resendApiKey,
    emailFrom: typeof body.emailFrom === "string" ? body.emailFrom : undefined,
    smtpHost: typeof body.smtpHost === "string" ? body.smtpHost : undefined,
    smtpPort: typeof body.smtpPort === "string" ? body.smtpPort : undefined,
    smtpUser: typeof body.smtpUser === "string" ? body.smtpUser : undefined,
    smtpPass: typeof body.smtpPass === "string" ? body.smtpPass : undefined,
  });

  const configured = await isEmailConfiguredAsync();
  const productionReady = await canSendToAnyRecipient();
  return NextResponse.json({ success: true, configured, productionReady });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isEmailConfiguredAsync())) {
    return NextResponse.json(
      {
        error: "Email not configured. Paste your Resend API key below and save first.",
        configured: false,
      },
      { status: 503 }
    );
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const result = await sendEmail({
      to: email.trim(),
      subject: "BTX Email Test — Working!",
      html: emailLayout(`
        <h2 style="color:#0F2744;">Email is Working ✓</h2>
        <p>Congratulations! BTX email notifications are now active.</p>
        <p>New users will receive welcome emails. Booking confirmations and exam reminders will also be sent automatically.</p>
      `),
      text: "BTX email test successful.",
    });

    return NextResponse.json({ success: true, sent: result.sent });
  } catch (error) {
    console.error("[email-test]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Email send failed" },
      { status: 500 }
    );
  }
}
