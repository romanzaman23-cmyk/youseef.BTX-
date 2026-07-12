import { sendEmail, emailLayout } from "@/lib/email";
import { getAppBaseUrl } from "@/lib/certificate-verify";
import { formatExamSlotDateTime } from "@/lib/exam-slot";
import { BRAND } from "@/lib/constants";

function button(href: string, label: string): string {
  return `<p style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:#00897B;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;">
      ${label}
    </a>
  </p>`;
}

function infoBox(rows: Array<{ label: string; value: string }>): string {
  const items = rows
    .map(
      (row) =>
        `<tr>
          <td style="padding:8px 0;color:#666666;font-size:13px;width:140px;">${row.label}</td>
          <td style="padding:8px 0;color:#0F2744;font-weight:600;">${row.value}</td>
        </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;border-radius:8px;padding:16px 20px;margin:20px 0;">${items}</table>`;
}

export async function sendWelcomeEmail(params: {
  to: string;
  fullName: string;
}) {
  const loginUrl = `${getAppBaseUrl()}/en/login`;
  const subject = `Welcome to ${BRAND.fullName}`;

  const html = emailLayout(`
    <h2 style="color:#0F2744;margin:0 0 12px;">Welcome, ${params.fullName}!</h2>
    <p>Thank you for registering with <strong>${BRAND.fullName}</strong>.</p>
    <p>Your account has been created successfully. An administrator will review and approve your account shortly. Once approved, you will be able to log in and book your competency examination.</p>
    ${infoBox([
      { label: "Status", value: "Pending Admin Approval" },
      { label: "Next Step", value: "Wait for approval, then log in" },
    ])}
    ${button(loginUrl, "Go to Login Portal")}
    <p style="font-size:13px;color:#888888;">If you did not create this account, please ignore this email.</p>
  `);

  const text = `Welcome to ${BRAND.fullName}, ${params.fullName}!\n\nYour account is pending admin approval. Log in at: ${loginUrl}`;

  return sendEmail({ to: params.to, subject, html, text });
}

export async function sendAdminNewRegistrationNotice(params: {
  adminEmail: string;
  userName: string;
  userEmail: string;
  welcomeEmailFailed?: boolean;
}) {
  const usersUrl = `${getAppBaseUrl()}/en/admin/users`;
  const subject = `New BTX Registration — ${params.userName}`;

  const html = emailLayout(`
    <h2 style="color:#0F2744;">New Participant Registered</h2>
    <p>A new user has registered on BTX:</p>
    ${infoBox([
      { label: "Name", value: params.userName },
      { label: "Email", value: params.userEmail },
      { label: "Welcome Email", value: params.welcomeEmailFailed ? "FAILED — verify domain in Settings" : "Sent" },
    ])}
    ${button(usersUrl, "Review in Admin Panel")}
  `);

  const text = `New registration: ${params.userName} (${params.userEmail})`;

  return sendEmail({ to: params.adminEmail, subject, html, text });
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  fullName: string;
  slot: { date: Date; startTime: string; endTime: string };
}) {
  const { dateLabel, startTime, endTime } = formatExamSlotDateTime(params.slot);
  const portalUrl = `${getAppBaseUrl()}/en/portal/booking`;
  const subject = "Examination Booking Confirmation — BTX";

  const html = emailLayout(`
    <h2 style="color:#0F2744;margin:0 0 12px;">Booking Confirmed</h2>
    <p>Hello ${params.fullName},</p>
    <p>You have selected the following date and time for your food safety competency examination:</p>
    ${infoBox([
      { label: "Date", value: dateLabel },
      { label: "Start Time", value: startTime },
      { label: "End Time", value: endTime },
      { label: "Status", value: "Pending Admin Approval" },
    ])}
    <p>Your booking is submitted and awaiting admin approval. You will receive a reminder email <strong>30 minutes before</strong> your exam start time once the booking is approved.</p>
    ${button(portalUrl, "View My Bookings")}
    <p style="font-size:13px;color:#888888;">Please be ready to start your exam on time. The exam must be completed within the allotted window.</p>
  `);

  const text = `Hello ${params.fullName},\n\nYour exam booking:\nDate: ${dateLabel}\nTime: ${startTime} - ${endTime}\n\nView bookings: ${portalUrl}`;

  return sendEmail({ to: params.to, subject, html, text });
}

export async function sendExamReminderEmail(params: {
  to: string;
  fullName: string;
  slot: { date: Date; startTime: string; endTime: string };
}) {
  const { dateLabel, startTime, endTime } = formatExamSlotDateTime(params.slot);
  const examUrl = `${getAppBaseUrl()}/en/portal`;
  const subject = "Reminder: Your BTX Exam Starts in 30 Minutes";

  const html = emailLayout(`
    <h2 style="color:#0F2744;margin:0 0 12px;">Exam Reminder — 30 Minutes Left</h2>
    <p>Hello ${params.fullName},</p>
    <p>This is a friendly reminder that your <strong>Food Safety Competency Examination</strong> is scheduled to begin in approximately <strong>30 minutes</strong>.</p>
    ${infoBox([
      { label: "Date", value: dateLabel },
      { label: "Start Time", value: startTime },
      { label: "End Time", value: endTime },
    ])}
    <p>Please log in to the participant portal now and be ready to start your exam on time. Do not forget — many participants miss their exam without a reminder!</p>
    ${button(examUrl, "Open Exam Portal Now")}
    <p style="font-size:13px;color:#888888;">Make sure you have a stable internet connection and will not be interrupted during the exam.</p>
  `);

  const text = `Reminder: Your BTX exam starts in 30 minutes.\n\nDate: ${dateLabel}\nTime: ${startTime} - ${endTime}\n\nOpen portal: ${examUrl}`;

  return sendEmail({ to: params.to, subject, html, text });
}

export async function sendBookingApprovedEmail(params: {
  to: string;
  fullName: string;
  slot: { date: Date; startTime: string; endTime: string };
}) {
  const { dateLabel, startTime, endTime } = formatExamSlotDateTime(params.slot);
  const portalUrl = `${getAppBaseUrl()}/en/portal`;
  const subject = "Your Examination Booking Has Been Approved — BTX";

  const html = emailLayout(`
    <h2 style="color:#0F2744;margin:0 0 12px;">Booking Approved</h2>
    <p>Hello ${params.fullName},</p>
    <p>Great news! Your examination booking has been approved by the administrator.</p>
    ${infoBox([
      { label: "Date", value: dateLabel },
      { label: "Start Time", value: startTime },
      { label: "End Time", value: endTime },
    ])}
    <p>You will receive another reminder email <strong>30 minutes before</strong> your exam starts. When it is time, log in to the portal to begin your examination.</p>
    ${button(portalUrl, "Go to Participant Portal")}
  `);

  const text = `Your exam booking is approved.\n\nDate: ${dateLabel}\nTime: ${startTime} - ${endTime}\n\nPortal: ${portalUrl}`;

  return sendEmail({ to: params.to, subject, html, text });
}
