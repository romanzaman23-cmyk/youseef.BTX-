import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail, sendAccountApprovedEmail } from "@/lib/email-notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const user = await prisma.user.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED") {
    await prisma.notification.create({
      data: {
        userId: id,
        title: "Account Approved",
        message: "Your BTX account has been approved. You can now book examinations.",
        type: "INFO",
      },
    });

    if (user.notifyEmail) {
      try {
        await sendAccountApprovedEmail({ to: user.email, fullName: user.fullName });
      } catch (err) {
        console.error("Account approved email failed:", err);
        try {
          await sendWelcomeEmail({ to: user.email, fullName: user.fullName });
        } catch {
          /* logged above */
        }
      }
    }
  }

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: `User ${status}`,
      details: `Participant account status changed to ${status}`,
    },
  });

  return NextResponse.json({ user });
}
