"use client";

import { StatCard } from "@/components/ui/StatCard";
import { Users, FileText, TrendingUp, BarChart3, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface ReportsPanelProps {
  stats: {
    totalParticipants: number;
    totalExams: number;
    averageScore: number;
    passRate: number;
    totalQuestions: number;
  };
  competencyDist: { name: string; count: number }[];
  categoryAnalysis: { name: string; missRate: number; total: number }[];
  recentResults: { name: string; company: string; score: number; level: string; date: string }[];
}

export function ReportsPanel({ stats, competencyDist, categoryAnalysis, recentResults }: ReportsPanelProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary">Reports & Analytics</h1>
        <div className="flex gap-2">
          <button onClick={() => window.open("/api/admin/reports/export?format=xlsx", "_blank")} className="btn-primary text-sm !py-2 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => window.open("/api/admin/reports/export?format=pdf", "_blank")} className="btn-accent text-sm !py-2 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Participants" value={stats.totalParticipants} icon={Users} />
        <StatCard title="Total Exams" value={stats.totalExams} icon={FileText} color="accent" />
        <StatCard title="Average Score" value={`${stats.averageScore.toFixed(1)}%`} icon={TrendingUp} color="secondary" />
        <StatCard title="Pass Rate" value={`${stats.passRate.toFixed(1)}%`} icon={BarChart3} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="font-bold text-btx-primary mb-4">Competency Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={competencyDist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0F2744" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="font-bold text-btx-primary mb-4">Category Analysis (Miss Rate)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryAnalysis.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Bar dataKey="missRate" fill="#C9A227" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-bold text-btx-primary">Recent Results</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Participant</th>
              <th className="text-left p-4 hidden md:table-cell">Company</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Level</th>
              <th className="text-left p-4 hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentResults.map((r, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="p-4 font-medium">{r.name}</td>
                <td className="p-4 text-gray-500 hidden md:table-cell">{r.company}</td>
                <td className="p-4">{r.score.toFixed(1)}%</td>
                <td className="p-4">{r.level}</td>
                <td className="p-4 text-gray-500 hidden lg:table-cell">{format(new Date(r.date), "PP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
