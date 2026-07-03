import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default async function ReviewAnswersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const { id } = await params;

  const result = await prisma.examResult.findUnique({
    where: { id },
    include: {
      examSession: true,
    },
  });

  if (!result || result.userId !== session!.user.id) {
    notFound();
  }

  const questionIds: string[] = JSON.parse(result.examSession.questionIds);
  const answers: Record<string, string> = JSON.parse(result.examSession.answers);

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const isAr = locale === "ar";

  const ordered = questionIds
    .map((qid, index) => {
      const q = questionMap.get(qid);
      if (!q) return null;
      const userAnswer = answers[qid];
      const isCorrect = userAnswer === q.correctAnswer;
      const options = {
        A: isAr ? q.optionAAr : q.optionAEn,
        B: isAr ? q.optionBAr : q.optionBEn,
        C: isAr ? q.optionCAr : q.optionCEn,
        D: isAr ? q.optionDAr : q.optionDEn,
      };
      return {
        index: index + 1,
        text: isAr ? q.textAr : q.textEn,
        category: q.category,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        options,
      };
    })
    .filter(Boolean);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/${locale}/portal/results/${id}`}
          className="inline-flex items-center gap-2 text-sm text-btx-accent hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Result
        </Link>
      </div>

      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-2">Review Answers</h1>
      <p className="text-gray-500 mb-6">
        {format(new Date(result.createdAt), "PPP")} · {result.percentage.toFixed(1)}% ·{" "}
        {result.competencyLevel}
      </p>

      <div className="space-y-4">
        {ordered.map((item) => (
          <div
            key={item!.index}
            className={`bg-white rounded-xl p-5 card-shadow border-l-4 ${
              item!.isCorrect ? "border-btx-accent" : "border-red-400"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-btx-secondary bg-btx-secondary/20 px-2 py-0.5 rounded">
                  Q{item!.index}
                </span>
                <span className="text-xs text-gray-400">{item!.category}</span>
              </div>
              {item!.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-btx-accent shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
            </div>
            <p className="text-btx-primary font-medium mb-4">{item!.text}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(["A", "B", "C", "D"] as const).map((key) => {
                const isUser = item!.userAnswer === key;
                const isCorrect = item!.correctAnswer === key;
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg text-sm border ${
                      isCorrect
                        ? "border-btx-accent bg-btx-accent/5 text-btx-primary"
                        : isUser
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="font-bold mr-2">{key}.</span>
                    {item!.options[key]}
                    {isCorrect && <span className="ml-2 text-xs text-btx-accent">(Correct)</span>}
                    {isUser && !isCorrect && (
                      <span className="ml-2 text-xs text-red-500">(Your answer)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
