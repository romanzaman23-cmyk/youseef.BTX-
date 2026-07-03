"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Award,
  CheckCircle,
  XCircle,
  Eye,
  FileSearch,
  LayoutDashboard,
  Trophy,
} from "lucide-react";
import { getCompetencyColor } from "@/lib/competency";
import { CertificateDownloadButton } from "@/components/portal/CertificateDownloadButton";

interface ExamResultViewProps {
  locale: string;
  result: {
    id: string;
    percentage: number;
    competencyLevel: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    strengths: string[];
    weaknesses: string[];
    categoryPerformance: Record<string, { correct: number; total: number }>;
    createdAt: string;
    passed: boolean;
  };
  certificate: {
    id: string;
    verificationId: string;
  } | null;
}

export function ExamResultView({ locale, result, certificate }: ExamResultViewProps) {
  const color = getCompetencyColor(result.competencyLevel);

  const categoryData = Object.entries(result.categoryPerformance).map(([name, data]) => ({
    name,
    score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    correct: data.correct,
    total: data.total,
  }));

  const pieData = [
    { name: "Correct", value: result.correctAnswers },
    { name: "Incorrect", value: result.incorrectAnswers },
  ];

  return (
    <div className="space-y-6">
      {/* Congratulations header */}
      <div className="gradient-primary rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-btx-secondary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-btx-secondary" />
              <span className="text-btx-secondary font-medium text-sm uppercase tracking-wide">
                Examination Complete
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              {result.passed ? "Congratulations!" : "Examination Completed"}
            </h1>
            <p className="text-white/70 mt-2 max-w-lg">
              {result.passed
                ? "You have successfully completed the BTX Food Safety Competency Assessment."
                : "Thank you for completing the assessment. Review your results below to identify areas for improvement."}
            </p>
          </div>
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                result.passed ? "bg-btx-accent text-white" : "bg-red-500/90 text-white"
              }`}
            >
              {result.passed ? (
                <><CheckCircle className="w-4 h-4" /> PASSED</>
              ) : (
                <><XCircle className="w-4 h-4" /> NOT PASSED</>
              )}
            </div>
            <p className="text-5xl lg:text-6xl font-bold mt-3 text-btx-secondary">
              {result.percentage.toFixed(1)}%
            </p>
            <p className="text-white/60 text-sm mt-1">Final Score</p>
          </div>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: result.totalQuestions, color: "text-btx-primary" },
          { label: "Correct Answers", value: result.correctAnswers, color: "text-btx-accent" },
          { label: "Incorrect Answers", value: result.incorrectAnswers, color: "text-red-500" },
          { label: "Classification", value: result.competencyLevel, color: "", style: { color } },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-5 card-shadow text-center">
            <p className={`text-2xl lg:text-3xl font-bold ${item.color}`} style={item.style}>
              {item.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="font-bold text-btx-primary mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                <Cell fill="#00897B" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="font-bold text-btx-primary mb-4">Category Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${Number(v)}%`} />
              <Bar dataKey="score" fill="#0F2744" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths, weaknesses, summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow border-t-4 border-btx-accent">
          <h3 className="font-bold text-btx-accent mb-3">Strengths</h3>
          {result.strengths.length > 0 ? (
            <ul className="space-y-2">
              {result.strengths.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-btx-accent shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Continue practicing to build strengths.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow border-t-4 border-red-400">
          <h3 className="font-bold text-red-600 mb-3">Weaknesses</h3>
          {result.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {result.weaknesses.map((w) => (
                <li key={w} className="flex items-center gap-2 text-sm text-gray-700">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No significant weaknesses identified.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow border-t-4 border-btx-secondary">
          <h3 className="font-bold text-btx-primary mb-3">Competency Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Level</span>
              <span className="font-bold" style={{ color }}>{result.competencyLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Score</span>
              <span className="font-medium text-btx-primary">{result.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${result.percentage}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Beginner &lt;50% · Practitioner 50–69% · Advanced 70–84% · Expert 85%+
            </p>
          </div>
        </div>
      </div>

      {/* Certificate status */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-btx-secondary/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-btx-primary" />
            </div>
            <div>
              <h3 className="font-bold text-btx-primary">Certificate Status</h3>
              {certificate ? (
                <p className="text-sm text-btx-accent">
                  Certificate issued · ID: {certificate.verificationId}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No certificate available for this result.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {certificate && (
          <>
            <CertificateDownloadButton certificateId={certificate.id} />
            <Link
              href={`/${locale}/portal/certificates`}
              className="btn-accent inline-flex items-center gap-2 text-sm !py-2.5"
            >
              <Eye className="w-4 h-4" /> View Certificate
            </Link>
          </>
        )}
        <Link
          href={`/${locale}/portal/results/${result.id}/review`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-btx-primary text-btx-primary font-medium text-sm hover:bg-btx-primary/5 transition-colors"
        >
          <FileSearch className="w-4 h-4" /> Review Answers
        </Link>
        <Link
          href={`/${locale}/portal/dashboard`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-muted text-btx-primary font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" /> Back To Dashboard
        </Link>
      </div>
    </div>
  );
}
