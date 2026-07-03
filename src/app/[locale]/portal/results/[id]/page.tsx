import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamResultView } from "@/components/portal/ExamResultView";

export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const { id } = await params;

  const result = await prisma.examResult.findUnique({
    where: { id },
    include: { certificate: true },
  });

  if (!result || result.userId !== session!.user.id) {
    notFound();
  }

  return (
    <ExamResultView
      locale={locale}
      result={{
        id: result.id,
        percentage: result.percentage,
        competencyLevel: result.competencyLevel,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        strengths: JSON.parse(result.strengths) as string[],
        weaknesses: JSON.parse(result.weaknesses) as string[],
        categoryPerformance: JSON.parse(result.categoryPerformance) as Record<
          string,
          { correct: number; total: number }
        >,
        createdAt: result.createdAt.toISOString(),
        passed: result.percentage >= 50,
      }}
      certificate={
        result.certificate
          ? { id: result.certificate.id, verificationId: result.certificate.verificationId }
          : null
      }
    />
  );
}
