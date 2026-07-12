import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExamSlotDateTime } from "@/lib/exam-slot";
import { sendExamReminderEmail } from "@/lib/email-notifications";

const REMINDER_MINUTES = 30;
const CRON_WINDOW_MINUTES = 5;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStartMs = (REMINDER_MINUTES - CRON_WINDOW_MINUTES / 2) * 60 * 1000;
  const windowEndMs = (REMINDER_MINUTES + CRON_WINDOW_MINUTES / 2) * 60 * 1000;

  const bookings = await prisma.booking.findMany({
    where: {
      status: "APPROVED",
      reminderSent: false,
    },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          notifyEmail: true,
        },
      },
      examSlot: true,
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const booking of bookings) {
    const examStart = getExamSlotDateTime(booking.examSlot);
    const msUntilExam = examStart.getTime() - now.getTime();

    if (msUntilExam < windowStartMs || msUntilExam > windowEndMs) {
      skipped++;
      continue;
    }

    if (!booking.user.notifyEmail) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });
      skipped++;
      continue;
    }

    try {
      await sendExamReminderEmail({
        to: booking.user.email,
        fullName: booking.user.fullName,
        slot: booking.examSlot,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });

      sent++;
    } catch (error) {
      console.error(`[cron] Reminder failed for booking ${booking.id}:`, error);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: bookings.length,
    sent,
    skipped,
    reminderMinutes: REMINDER_MINUTES,
  });
}
