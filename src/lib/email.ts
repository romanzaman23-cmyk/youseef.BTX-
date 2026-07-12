import nodemailer from "nodemailer";
import { BRAND } from "@/lib/constants";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    `${BRAND.fullName} <noreply@btx-excellence.com>`
  );
}

async function sendViaResend(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error (${response.status}): ${body}`);
  }

  return true;
}

async function sendViaSmtp(options: SendEmailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return false;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return true;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ sent: boolean; dev?: boolean }> {
  try {
    if (await sendViaResend(options)) return { sent: true };
    if (await sendViaSmtp(options)) return { sent: true };

    console.log("[email] No provider configured. Would send:", {
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return { sent: false, dev: true };
  } catch (error) {
    console.error("[email] Send failed:", error);
    throw error;
  }
}

export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0F2744;padding:24px;text-align:center;">
            <div style="color:#C9A227;font-size:28px;font-weight:bold;">BTX</div>
            <div style="color:#ffffff;font-size:13px;margin-top:4px;">${BRAND.fullName}</div>
          </td>
        </tr>
        <tr><td style="padding:32px 28px;color:#333333;font-size:15px;line-height:1.6;">${content}</td></tr>
        <tr>
          <td style="background:#f8f9fa;padding:16px 28px;text-align:center;font-size:12px;color:#888888;">
            ${BRAND.tagline}<br/>
            &copy; ${new Date().getFullYear()} ${BRAND.fullName}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
