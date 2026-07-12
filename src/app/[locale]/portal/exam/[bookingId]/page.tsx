import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ExamInterface } from "@/components/portal/ExamInterface";
import { getOrCreateExamSession } from "@/lib/exam-questions";
import { seededShuffle } from "@/lib/utils";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ bookingId: string; locale: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const { bookingId } = await params;
  const userId = session!.user.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.userId !== userId || booking.status !== "APPROVED") {
    redirect(`/${locale}/portal/dashboard`);
  }

  const examSession = await getOrCreateExamSession(userId, bookingId);

  if (examSession.status === "COMPLETED") {
    redirect(`/${locale}/portal/results`);
  }

  const questionIds: string[] = JSON.parse(examSession.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const orderedQuestions = questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean)
    .map((q) => {
      const isAr = locale === "ar";
      const options = seededShuffle(
        [
          { key: "A", text: isAr ? q!.optionAAr : q!.optionAEn },
          { key: "B", text: isAr ? q!.optionBAr : q!.optionBEn },
          { key: "C", text: isAr ? q!.optionCAr : q!.optionCEn },
          { key: "D", text: isAr ? q!.optionDAr : q!.optionDEn },
        ],
        `${examSession.secureToken}:${q!.id}:options`
      );
      return {
        id: q!.id,
        text: isAr ? q!.textAr : q!.textEn,
        options,
      };
    });

  if (orderedQuestions.length === 0) {
    redirect(`/${locale}/portal/quizzes`);
  }

  const initialAnswers = JSON.parse(examSession.answers || "{}");

  return (
    <ExamInterface
      sessionId={examSession.id}
      questions={orderedQuestions}
      timeLimit={examSession.timeLimit}
      locale={locale}
      initialAnswers={initialAnswers}
      initialIndex={examSession.currentIndex}
    />
  );
}
