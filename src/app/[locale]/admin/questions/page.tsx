import { prisma } from "@/lib/prisma";
import { QuestionManagement } from "@/components/admin/QuestionManagement";

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: [{ level: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const stats = await prisma.question.groupBy({
    by: ["level"],
    _count: true,
    where: { isActive: true },
  });

  const levelCounts = Object.fromEntries(stats.map((s) => [s.level, s._count]));
  const totalActive = await prisma.question.count({ where: { isActive: true } });

  return (
    <QuestionManagement
      questions={questions.map((q) => ({
        id: q.id,
        level: q.level,
        category: q.category,
        textEn: q.textEn,
        correctAnswer: q.correctAnswer,
        isActive: q.isActive,
      }))}
      levelCounts={levelCounts}
      totalActive={totalActive}
    />
  );
}
