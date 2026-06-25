import { prisma } from "@/lib/prisma";
import { ReportsPanel } from "@/components/admin/ReportsPanel";

export default async function AdminReportsPage() {
  const [results, questions, categoryMissed] = await Promise.all([
    prisma.examResult.findMany({
      include: { user: { select: { fullName: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.count({ where: { isActive: true } }),
    getCategoryAnalysis(),
  ]);

  const totalParticipants = await prisma.user.count({ where: { role: "PARTICIPANT" } });
  const avgScore = results.length
    ? results.reduce((s, r) => s + r.percentage, 0) / results.length
    : 0;
  const passRate = results.length
    ? (results.filter((r) => r.percentage >= 50).length / results.length) * 100
    : 0;

  const competencyDist = await prisma.examResult.groupBy({
    by: ["competencyLevel"],
    _count: true,
  });

  return (
    <ReportsPanel
      stats={{
        totalParticipants,
        totalExams: results.length,
        averageScore: avgScore,
        passRate,
        totalQuestions: questions,
      }}
      competencyDist={competencyDist.map((c) => ({ name: c.competencyLevel, count: c._count }))}
      categoryAnalysis={categoryMissed}
      recentResults={results.slice(0, 10).map((r) => ({
        name: r.user.fullName,
        company: r.user.companyName,
        score: r.percentage,
        level: r.competencyLevel,
        date: r.createdAt.toISOString(),
      }))}
    />
  );
}

async function getCategoryAnalysis() {
  const results = await prisma.examResult.findMany({
    select: { categoryPerformance: true },
  });

  const categories: Record<string, { correct: number; total: number }> = {};

  for (const r of results) {
    const perf = JSON.parse(r.categoryPerformance) as Record<string, { correct: number; total: number }>;
    for (const [cat, data] of Object.entries(perf)) {
      if (!categories[cat]) categories[cat] = { correct: 0, total: 0 };
      categories[cat].correct += data.correct;
      categories[cat].total += data.total;
    }
  }

  return Object.entries(categories)
    .map(([name, data]) => ({
      name,
      missRate: data.total > 0 ? ((data.total - data.correct) / data.total) * 100 : 0,
      total: data.total,
    }))
    .sort((a, b) => b.missRate - a.missRate);
}
