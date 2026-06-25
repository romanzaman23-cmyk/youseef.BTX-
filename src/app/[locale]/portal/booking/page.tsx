import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTakeExam, nextEligibleDate } from "@/lib/competency";
import { BookingClient } from "@/components/portal/BookingClient";
import { format } from "date-fns";

export default async function BookingPage() {
  const session = await auth();
  const locale = await getLocale();
  const userId = session!.user.id;

  const [user, slots, bookings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.examSlot.findMany({
      where: { isActive: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.booking.findMany({
      where: { userId },
      include: { examSlot: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const eligible = canTakeExam(user?.lastExamAt || null);
  const nextDate = nextEligibleDate(user?.lastExamAt || null);

  const availableSlots = slots.map((s) => ({
    id: s.id,
    date: format(new Date(s.date), "PPP"),
    startTime: s.startTime,
    endTime: s.endTime,
    available: s.maxParticipants - s._count.bookings,
    maxParticipants: s.maxParticipants,
  }));

  const userBookings = bookings.map((b) => ({
    id: b.id,
    date: format(new Date(b.examSlot.date), "PPP"),
    status: b.status,
    startTime: b.examSlot.startTime,
    endTime: b.examSlot.endTime,
  }));

  return (
    <BookingClient
      locale={locale}
      eligible={eligible}
      nextEligibleDate={nextDate?.toISOString() || null}
      slots={availableSlots}
      bookings={userBookings}
      userStatus={user?.status || "PENDING"}
    />
  );
}
