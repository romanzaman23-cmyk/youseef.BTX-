import { prisma } from "@/lib/prisma";
import { ExamManagement } from "@/components/admin/ExamManagement";
import { format } from "date-fns";

export default async function AdminExamsPage() {
  const [slots, bookings] = await Promise.all([
    prisma.examSlot.findMany({
      orderBy: { date: "desc" },
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.booking.findMany({
      where: { status: "PENDING" },
      include: { user: true, examSlot: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <ExamManagement
      slots={slots.map((s) => ({
        id: s.id,
        date: format(new Date(s.date), "yyyy-MM-dd"),
        startTime: s.startTime,
        endTime: s.endTime,
        maxParticipants: s.maxParticipants,
        booked: s._count.bookings,
        isActive: s.isActive,
      }))}
      pendingBookings={bookings.map((b) => ({
        id: b.id,
        userName: b.user.fullName,
        userEmail: b.user.email,
        date: format(new Date(b.examSlot.date), "PPP"),
        startTime: b.examSlot.startTime,
        endTime: b.examSlot.endTime,
      }))}
    />
  );
}
