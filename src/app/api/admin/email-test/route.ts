import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isEmailConfigured, sendEmail, emailLayout } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    configured: isEmailConfigured(),
    provider: process.env.RESEND_API_KEY ? "resend" : process.env.SMTP_HOST ? "smtp" : "none",
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        error: "Email not configured. Add RESEND_API_KEY (or SMTP settings) in Vercel Environment Variables.",
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
      subject: "BTX Email Test — Configuration OK",
      html: emailLayout(`
        <h2 style="color:#0F2744;">Email Test Successful</h2>
        <p>If you received this message, BTX email notifications are working correctly.</p>
        <p>Welcome emails, booking confirmations, and exam reminders will now be delivered.</p>
      `),
      text: "BTX email test successful. Notifications are working.",
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
