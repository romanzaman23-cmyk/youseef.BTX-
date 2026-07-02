import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Users, FileText, Award, TrendingUp, BarChart3 } from "lucide-react";
import { AdminCharts } from "@/components/admin/AdminCharts";

export default async function AdminDashboard() {
  const [
    totalParticipants,
    totalExams,
    avgScore,
    certificatesIssued,
    results,
    competencyCounts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PARTICIPANT" } }),
    prisma.examResult.count(),
    prisma.examResult.aggregate({ _avg: { percentage: true } }),
    prisma.certificate.count(),
    prisma.examResult.findMany({ select: { percentage: true, competencyLevel: true, createdAt: true } }),
    prisma.examResult.groupBy({ by: ["competencyLevel"], _count: true }),
  ]);

  const passRate = results.length
    ? ((results.filter((r) => r.percentage >= 50).length / results.length) * 100).toFixed(1)
    : "0";

  const competencyData = competencyCounts.map((c) => ({
    name: c.competencyLevel,
    value: c._count,
  }));

  const monthlyData = getMonthlyTrends(results);

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Participants" value={totalParticipants} icon={Users} color="primary" />
        <StatCard title="Total Exams" value={totalExams} icon={FileText} color="accent" />
        <StatCard
          title="Average Score"
          value={avgScore._avg.percentage ? `${avgScore._avg.percentage.toFixed(1)}%` : "—"}
          icon={TrendingUp}
          color="secondary"
        />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={BarChart3} color="accent" />
        <StatCard title="Certificates Issued" value={certificatesIssued} icon={Award} color="secondary" />
      </div>

      <AdminCharts competencyData={competencyData} monthlyData={monthlyData} />
    </div>
  );
}

function getMonthlyTrends(results: { percentage: number; createdAt: Date }[]) {
  const months: Record<string, { total: number; count: number }> = {};
  for (const r of results) {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!months[key]) months[key] = { total: 0, count: 0 };
    months[key].total += r.percentage;
    months[key].count++;
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month,
      average: Math.round(data.total / data.count),
    }));
}
