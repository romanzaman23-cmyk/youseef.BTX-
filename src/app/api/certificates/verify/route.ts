import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ valid: false });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { verificationId: id },
  });

  if (!certificate) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    data: {
      participantName: certificate.participantName,
      finalScore: certificate.finalScore,
      competencyLevel: certificate.competencyLevel,
      examDate: certificate.examDate.toISOString(),
      issuedAt: certificate.issuedAt.toISOString(),
    },
  });
}
