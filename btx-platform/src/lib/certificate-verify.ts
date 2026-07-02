import { prisma } from "@/lib/prisma";

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
        },
      },
      examResult: {
        select: {
          totalQuestions: true,
          correctAnswers: true,
          incorrectAnswers: true,
          percentage: true,
          competencyLevel: true,
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
    totalQuestions: certificate.examResult.totalQuestions,
    correctAnswers: certificate.examResult.correctAnswers,
    incorrectAnswers: certificate.examResult.incorrectAnswers,
    examCompletedAt: certificate.examResult.createdAt.toISOString(),
  };
}

export function getCertificateVerifyUrl(verificationId: string, locale = "en"): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/${locale}/verify/${encodeURIComponent(verificationId)}`;
}
