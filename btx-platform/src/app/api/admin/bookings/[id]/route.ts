import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecureToken } from "@/lib/utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json();

  if (action === "approve") {
    const examLink = generateSecureToken();
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        examLink,
        examLinkSent: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: "Booking Approved",
        message: "Your examination booking has been approved. You can now access your exam from the portal.",
        type: "EXAM",
      },
    });

    return NextResponse.json({ booking });
  }

  if (action === "reject") {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: "Booking Rejected",
        message: "Your examination booking was not approved. Please contact support or book another slot.",
        type: "BOOKING",
      },
    });

    return NextResponse.json({ booking });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
