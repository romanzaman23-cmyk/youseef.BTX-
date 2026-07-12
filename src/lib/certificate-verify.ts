import { prisma } from "@/lib/prisma";

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseCategoryPerformance(
  value: string
): Array<{ category: string; correct: number; total: number; percentage: number }> {
  try {
    const parsed = JSON.parse(value) as Record<string, { correct: number; total: number }>;
    return Object.entries(parsed)
      .map(([category, stats]) => ({
        category,
        correct: stats.correct,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  } catch {
    return [];
  }
}

export function getAppBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return base.replace(/\/$/, "");
}

/** Public URL embedded in certificate QR codes (no login required). */
export function getCertificateVerifyUrl(verificationId: string): string {
  return `${getAppBaseUrl()}/verify/${encodeURIComponent(verificationId)}`;
}

export async function getCertificateVerification(verificationId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          mobile: true,
          companyName: true,
          jobTitle: true,
          status: true,
          createdAt: true,
        },
      },
      examResult: {
        select: {
          id: true,
          totalQuestions: true,
          correctAnswers: true,
          incorrectAnswers: true,
          percentage: true,
          competencyLevel: true,
          strengths: true,
          weaknesses: true,
          categoryPerformance: true,
          createdAt: true,
        },
      },
    },
  });

  if (!certificate) return null;

  return {
    verificationId: certificate.verificationId,
    participantName: certificate.participantName,
    finalScore: certificate.finalScore,
    competencyLevel: certificate.competencyLevel,
    examDate: certificate.examDate.toISOString(),
    issuedAt: certificate.issuedAt.toISOString(),
    email: certificate.user.email,
    mobile: certificate.user.mobile,
    companyName: certificate.user.companyName,
    jobTitle: certificate.user.jobTitle,
    accountStatus: certificate.user.status,
    memberSince: certificate.user.createdAt.toISOString(),
    totalQuestions: certificate.examResult.totalQuestions,
    correctAnswers: certificate.examResult.correctAnswers,
    incorrectAnswers: certificate.examResult.incorrectAnswers,
    examCompletedAt: certificate.examResult.createdAt.toISOString(),
    resultId: certificate.examResult.id,
    strengths: parseStringArray(certificate.examResult.strengths),
    weaknesses: parseStringArray(certificate.examResult.weaknesses),
    categoryPerformance: parseCategoryPerformance(certificate.examResult.categoryPerformance),
  };
}
