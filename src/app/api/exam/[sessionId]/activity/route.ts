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
  const { type } = await request.json();

  const examSession = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!examSession || examSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const log = JSON.parse(examSession.activityLog);
  log.push({ type, timestamp: new Date().toISOString() });

  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      tabSwitchCount: type === "tab_switch" ? examSession.tabSwitchCount + 1 : examSession.tabSwitchCount,
      activityLog: JSON.stringify(log),
    },
  });

  return NextResponse.json({ success: true });
}
