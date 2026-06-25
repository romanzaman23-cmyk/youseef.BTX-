"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Play,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Hourglass,
  XCircle,
  BookOpen,
} from "lucide-react";

export interface QuizItem {
  id: string;
  examName: string;
  examLevel: string;
  examDate: string;
  examDateRaw: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  category: "upcoming" | "approved" | "pending" | "completed" | "expired";
  canStart: boolean;
  inProgress: boolean;
}

interface MyQuizzesClientProps {
  locale: string;
  quizzes: QuizItem[];
  userApproved: boolean;
}

const categoryConfig = {
  upcoming: { label: "Upcoming Exams", icon: Calendar, color: "border-btx-accent" },
  approved: { label: "Approved Exams", icon: CheckCircle, color: "border-btx-secondary" },
  pending: { label: "Pending Approval", icon: Hourglass, color: "border-btx-primary" },
  completed: { label: "Completed Exams", icon: CheckCircle, color: "border-btx-accent" },
  expired: { label: "Expired Exams", icon: XCircle, color: "border-gray-400" },
};

export function MyQuizzesClient({ locale, quizzes, userApproved }: MyQuizzesClientProps) {
  const t = useTranslations("portal");

  if (!userApproved) {
    return (
      <div className="bg-btx-secondary/20 rounded-xl p-8 text-center card-shadow">
        <AlertCircle className="w-12 h-12 text-btx-primary mx-auto mb-4" />
        <p className="font-medium text-btx-primary">{t("account_pending")}</p>
      </div>
    );
  }

  const grouped = (Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map(
    (key) => ({
      key,
      ...categoryConfig[key],
      items: quizzes.filter((q) => q.category === key),
    })
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary">{t("my_quizzes")}</h1>
          <p className="text-gray-500 mt-1">{t("my_quizzes_desc")}</p>
        </div>
        <Link href={`/${locale}/portal/booking`} className="btn-accent text-sm !py-2 !px-4">
          {t("book_now")}
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t("no_quizzes")}</p>
          <Link href={`/${locale}/portal/booking`} className="btn-primary text-sm inline-block">
            {t("book_now")}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(
            (group) =>
              group.items.length > 0 && (
                <section key={group.key}>
                  <div className="flex items-center gap-2 mb-4">
                    <group.icon className="w-5 h-5 text-btx-accent" />
                    <h2 className="text-lg font-bold text-btx-primary">{group.label}</h2>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-gray-500">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {group.items.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} locale={locale} t={t} />
                    ))}
                  </div>
                </section>
              )
          )}
        </div>
      )}
    </div>
  );
}

function QuizCard({
  quiz,
  locale,
  t,
}: {
  quiz: QuizItem;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-btx-secondary/20 text-btx-primary",
    APPROVED: "bg-btx-accent/10 text-btx-accent",
    COMPLETED: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-50 text-red-600",
    CANCELLED: "bg-gray-100 text-gray-500",
    EXPIRED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className={`bg-white rounded-xl p-5 card-shadow border-l-4 ${
      quiz.category === "expired" ? "border-gray-400" :
      quiz.category === "pending" ? "border-btx-primary" :
      quiz.category === "completed" ? "border-btx-accent" :
      "border-btx-secondary"
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-btx-primary">{quiz.examName}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[quiz.status] || "bg-gray-100"}`}>
              {quiz.status}
            </span>
          </div>
          <p className="text-sm text-btx-accent font-medium">{quiz.examLevel}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-btx-accent" />
              {format(new Date(quiz.examDateRaw), "PPP")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {quiz.startTime} – {quiz.endTime}
            </span>
            <span className="flex items-center gap-1">
              <Hourglass className="w-4 h-4" />
              {quiz.duration}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {quiz.canStart ? (
            <Link
              href={`/${locale}/portal/exam/${quiz.id}`}
              className="btn-accent inline-flex items-center gap-2 text-sm !py-2.5 !px-5"
            >
              <Play className="w-4 h-4" />
              {quiz.inProgress ? t("continue_quiz") : t("start_quiz")}
            </Link>
          ) : quiz.status === "PENDING" ? (
            <div className="text-center px-4 py-2 bg-btx-secondary/10 rounded-lg">
              <Hourglass className="w-5 h-5 text-btx-primary mx-auto mb-1" />
              <p className="text-xs font-medium text-btx-primary">{t("waiting_approval")}</p>
            </div>
          ) : quiz.category === "completed" ? (
            <Link
              href={`/${locale}/portal/results`}
              className="text-sm text-btx-accent hover:underline font-medium"
            >
              {t("view_results")}
            </Link>
          ) : quiz.category === "expired" ? (
            <span className="text-xs text-gray-400 font-medium">Expired</span>
          ) : (
            <button disabled className="btn-primary text-sm !py-2 !px-4 opacity-50 cursor-not-allowed">
              <Play className="w-4 h-4 inline mr-1" />
              {t("start_quiz")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
