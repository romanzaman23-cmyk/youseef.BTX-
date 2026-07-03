import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { MyQuizzesClient, type QuizItem } from "@/components/portal/MyQuizzesClient";
import { EXAM_CONFIG } from "@/lib/constants";

export default async function MyQuizzesPage() {
  const session = await auth();
  const locale = await getLocale();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      examSlot: true,
      examSessions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const durationLabel = `${EXAM_CONFIG.timeLimitSeconds / 60} min`;

  const quizzes: QuizItem[] = bookings.map((b) => {
    const slotDate = new Date(b.examSlot.date);
    const endOfSlot = new Date(b.examSlot.date);
    endOfSlot.setHours(23, 59, 59, 999);
    const isPast = endOfSlot < now;
    const session = b.examSessions[0];
    const isCompleted = b.status === "COMPLETED" || session?.status === "COMPLETED";
    const isExpired = !isCompleted && b.status === "APPROVED" && isPast;
    const inProgress = session?.status === "IN_PROGRESS";

    let category: QuizItem["category"];
    if (isCompleted) category = "completed";
    else if (isExpired || b.status === "CANCELLED") category = "expired";
    else if (b.status === "PENDING") category = "pending";
    else if (b.status === "APPROVED" && !isPast) category = "upcoming";
    else if (b.status === "APPROVED") category = "approved";
    else category = "expired";

    const canStart = b.status === "APPROVED" && !isCompleted && !isExpired;

    return {
      id: b.id,
      examName: "BTX Food Safety Competency Assessment",
      examLevel: "Multi-Level Assessment (L1–L4)",
      examDate: slotDate.toISOString(),
      examDateRaw: b.examSlot.date.toISOString(),
      startTime: b.examSlot.startTime,
      endTime: b.examSlot.endTime,
      duration: durationLabel,
      status: isExpired ? "EXPIRED" : b.status,
      category,
      canStart,
      inProgress: !!inProgress,
    };
  });

  return (
    <MyQuizzesClient
      locale={locale}
      quizzes={quizzes}
      userApproved={user?.status === "APPROVED"}
    />
  );
}
