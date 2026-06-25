import Link from "next/link";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompetencyColor } from "@/lib/competency";
import { format } from "date-fns";
import { FileText } from "lucide-react";

export default async function ResultsPage() {
  const session = await auth();
  const locale = await getLocale();
  const userId = session!.user.id;

  const results = await prisma.examResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">Examination Results</h1>

      {results.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No examination results yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const color = getCompetencyColor(result.competencyLevel);
            const strengths = JSON.parse(result.strengths) as string[];
            const weaknesses = JSON.parse(result.weaknesses) as string[];

            return (
              <div key={result.id} className="bg-white rounded-xl p-6 card-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{format(new Date(result.createdAt), "PPP")}</p>
                    <p className="text-3xl font-bold mt-1" style={{ color }}>
                      {result.percentage.toFixed(1)}%
                    </p>
                    <span
                      className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {result.competencyLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-btx-primary">{result.totalQuestions}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-btx-accent">{result.correctAnswers}</p>
                      <p className="text-xs text-gray-500">Correct</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{result.incorrectAnswers}</p>
                      <p className="text-xs text-gray-500">Incorrect</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  {strengths.length > 0 && (
                    <div className="p-3 bg-btx-accent/5 rounded-lg">
                      <p className="text-sm font-medium text-btx-accent mb-1">Strengths</p>
                      <p className="text-sm text-gray-600">{strengths.join(", ")}</p>
                    </div>
                  )}
                  {weaknesses.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-600 mb-1">Areas for Improvement</p>
                      <p className="text-sm text-gray-600">{weaknesses.join(", ")}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/portal/results/${result.id}`}
                    className="btn-primary text-sm !py-2 !px-4"
                  >
                    View Full Result
                  </Link>
                  <Link
                    href={`/${locale}/portal/certificates`}
                    className="text-sm text-btx-accent hover:underline self-center"
                  >
                    View Certificate →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
