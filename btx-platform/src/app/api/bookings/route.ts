import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTakeExam } from "@/lib/competency";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examSlotId } = await request.json();
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "APPROVED") {
    return NextResponse.json({ error: "Account not approved" }, { status: 403 });
  }

  if (!canTakeExam(user.lastExamAt)) {
    return NextResponse.json({ error: "Must wait 3 months between examinations" }, { status: 400 });
  }

  const existingBooking = await prisma.booking.findFirst({
    where: { userId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existingBooking) {
    return NextResponse.json({ error: "You already have an active booking" }, { status: 400 });
  }

  const slot = await prisma.examSlot.findUnique({
    where: { id: examSlotId },
    include: { _count: { select: { bookings: true } } },
  });

  if (!slot || !slot.isActive) {
    return NextResponse.json({ error: "Slot not available" }, { status: 400 });
  }

  if (slot._count.bookings >= slot.maxParticipants) {
    return NextResponse.json({ error: "Slot is full" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: { userId, examSlotId, status: "PENDING" },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Booking Submitted",
      message: "Your examination booking is pending admin approval.",
      type: "BOOKING",
    },
  });

  return NextResponse.json({ booking });
}
