import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompetencyLevel } from "@/lib/competency";
import { generateVerificationId } from "@/lib/utils";
import { EXAM_CONFIG } from "@/lib/constants";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const { answers } = await request.json();

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { booking: true },
  });

  if (!examSession || examSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (examSession.status === "COMPLETED") {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const questionIds: string[] = JSON.parse(examSession.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });

  const categoryPerformance: Record<string, { correct: number; total: number }> = {};
  let correct = 0;

  for (const q of questions) {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;

    if (!categoryPerformance[q.category]) {
      categoryPerformance[q.category] = { correct: 0, total: 0 };
    }
    categoryPerformance[q.category].total++;
    if (isCorrect) categoryPerformance[q.category].correct++;
  }

  const total = questions.length;
  const incorrect = total - correct;
  const percentage = (correct / total) * 100;

  const thresholds = await prisma.competencyThreshold.findFirst();
  const competencyLevel = getCompetencyLevel(percentage, thresholds || undefined);

  const strengths = Object.entries(categoryPerformance)
    .filter(([, v]) => v.correct / v.total >= 0.7)
    .map(([k]) => k);
  const weaknesses = Object.entries(categoryPerformance)
    .filter(([, v]) => v.correct / v.total < 0.5)
    .map(([k]) => k);

  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      answers: JSON.stringify(answers),
    },
  });

  await prisma.booking.update({
    where: { id: examSession.bookingId },
    data: { status: "COMPLETED" },
  });

  const result = await prisma.examResult.create({
    data: {
      userId: session.user.id,
      examSessionId: sessionId,
      totalQuestions: total,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      percentage,
      competencyLevel,
      strengths: JSON.stringify(strengths),
      weaknesses: JSON.stringify(weaknesses),
      categoryPerformance: JSON.stringify(categoryPerformance),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const certificate = await prisma.certificate.create({
    data: {
      userId: session.user.id,
      examResultId: result.id,
      verificationId: generateVerificationId(),
      participantName: user!.fullName,
      examDate: new Date(),
      finalScore: percentage,
      competencyLevel,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastExamAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Exam Completed",
      message: `Your score: ${percentage.toFixed(1)}% – ${competencyLevel}. Certificate issued.`,
      type: "CERTIFICATE",
    },
  });

  return NextResponse.json({ result, certificate });
}
