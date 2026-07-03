import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { getCompetencyColor } from "@/lib/competency";
import { Calendar, Award, FileText, Bell, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default async function PortalDashboard() {
  const session = await auth();
  const t = await getTranslations("portal");
  const locale = await getLocale();
  const userId = session!.user.id;

  const [user, upcomingBooking, latestResult, certificates, notifications] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.booking.findFirst({
      where: { userId, status: { in: ["PENDING", "APPROVED"] } },
      include: { examSlot: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.examResult.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificate.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId, read: false },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const competencyLevel = latestResult?.competencyLevel || "Not Assessed";
  const competencyColor = getCompetencyColor(competencyLevel);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary">
          {t("welcome")}, {user?.fullName}
        </h1>
        {user?.status === "PENDING" && (
          <div className="mt-2 p-3 bg-btx-secondary/20 text-btx-primary rounded-lg text-sm">
            Your account is pending admin approval.
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("competency_level")}
          value={competencyLevel}
          icon={Award}
          color="secondary"
        />
        <StatCard
          title={t("exam_status")}
          value={upcomingBooking?.status || "None"}
          icon={Calendar}
          color="accent"
        />
        <StatCard
          title="Latest Score"
          value={latestResult ? `${latestResult.percentage.toFixed(1)}%` : "—"}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title={t("certificates")}
          value={certificates}
          icon={Award}
          color="secondary"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-btx-primary">{t("upcoming_exam")}</h2>
            <Link href={`/${locale}/portal/quizzes`} className="text-sm text-btx-accent hover:underline flex items-center gap-1">
              {t("my_quizzes")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingBooking ? (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-btx-primary">
                {format(new Date(upcomingBooking.examSlot.date), "PPP")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {upcomingBooking.examSlot.startTime} – {upcomingBooking.examSlot.endTime}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                upcomingBooking.status === "APPROVED" ? "bg-btx-accent/10 text-btx-accent" : "bg-btx-secondary/20 text-btx-primary"
              }`}>
                {upcomingBooking.status}
              </span>
              {upcomingBooking.examLink && upcomingBooking.status === "APPROVED" && (
                <Link
                  href={`/${locale}/portal/quizzes`}
                  className="block mt-3 btn-accent text-center text-sm !py-2"
                >
                  {t("start_quiz")}
                </Link>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">{t("no_exam")}</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-btx-primary">{t("notifications")}</h2>
            <Link href={`/${locale}/portal/notifications`} className="text-sm text-btx-accent hover:underline">
              {t("view_all")}
            </Link>
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Bell className="w-4 h-4 text-btx-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-btx-primary">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No new notifications</p>
          )}
        </div>
      </div>

      {latestResult && (
        <div className="mt-6 bg-white rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-bold text-btx-primary mb-4">{t("previous_results")}</h2>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-2xl font-bold" style={{ color: competencyColor }}>
                {latestResult.percentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Classification</p>
              <p className="text-lg font-semibold text-btx-primary">{latestResult.competencyLevel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Correct</p>
              <p className="text-lg font-semibold text-btx-accent">
                {latestResult.correctAnswers}/{latestResult.totalQuestions}
              </p>
            </div>
            <Link href={`/${locale}/portal/results`} className="ml-auto btn-primary text-sm !py-2 !px-4">
              View Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
