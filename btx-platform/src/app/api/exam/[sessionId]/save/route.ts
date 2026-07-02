import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const { answers, currentIndex } = await request.json();

  const examSession = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!examSession || examSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      answers: JSON.stringify(answers),
      currentIndex: currentIndex ?? examSession.currentIndex,
    },
  });

  return NextResponse.json({ success: true });
}
