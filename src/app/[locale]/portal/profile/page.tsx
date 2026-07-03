import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ParticipantProfileClient } from "@/components/portal/ParticipantProfileClient";

export default async function ParticipantProfilePage() {
  const session = await auth();
  const locale = await getLocale();
  const userId = session!.user.id;

  const [user, results, certificates] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.examResult.findMany({
      where: { userId },
      include: { certificate: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const latestResult = results[0];
  const avgScore = results.length
    ? results.reduce((s, r) => s + r.percentage, 0) / results.length
    : 0;

  return (
    <ParticipantProfileClient
      locale={locale}
      profile={{
        fullName: user!.fullName,
        email: user!.email,
        mobile: user!.mobile,
        companyName: user!.companyName,
        jobTitle: user!.jobTitle,
        createdAt: user!.createdAt.toISOString(),
        competencyLevel: latestResult?.competencyLevel || "Not Assessed",
        examsCompleted: results.length,
        averageScore: avgScore,
        certificatesEarned: certificates.length,
        notifyEmail: user!.notifyEmail,
        notifySms: user!.notifySms,
        examHistory: results.map((r) => ({
          id: r.id,
          date: r.createdAt.toISOString(),
          score: r.percentage,
          classification: r.competencyLevel,
          hasCertificate: !!r.certificate,
          certificateId: r.certificate?.id,
        })),
        certificates: certificates.map((c) => ({
          id: c.id,
          verificationId: c.verificationId,
          score: c.finalScore,
          level: c.competencyLevel,
          date: c.examDate.toISOString(),
        })),
      }}
    />
  );
}
