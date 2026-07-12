import type { PrismaClient } from "@/generated/prisma/client";
import { EXAM_CONFIG } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { generateSecureToken, seededShuffle } from "@/lib/utils";

type DbClient = Pick<PrismaClient, "examSession" | "question">;

/** Picks a balanced random question set across levels 1–4. */
export async function pickRandomQuestionIds(
  db: DbClient,
  sessionSeed: string
): Promise<string[]> {
  const perLevel = Math.ceil(EXAM_CONFIG.questionsPerExam / 4);
  const collected: string[] = [];

  for (let level = 1; level <= 4; level++) {
    const rows = await db.question.findMany({
      where: { isActive: true, level },
      select: { id: true },
    });
    const shuffled = seededShuffle(
      rows.map((row) => row.id),
      `${sessionSeed}:L${level}`
    );
    collected.push(...shuffled.slice(0, perLevel));
  }

  const targetCount = EXAM_CONFIG.questionsPerExam;
  let uniqueIds = [...new Set(collected)];

  if (uniqueIds.length < targetCount) {
    const extra = await db.question.findMany({
      where: {
        isActive: true,
        ...(uniqueIds.length > 0 ? { id: { notIn: uniqueIds } } : {}),
      },
      select: { id: true },
    });
    const extraIds = seededShuffle(
      extra.map((row) => row.id),
      `${sessionSeed}:extra`
    );
    uniqueIds = [...uniqueIds, ...extraIds.slice(0, targetCount - uniqueIds.length)];
  }

  return seededShuffle(uniqueIds, sessionSeed).slice(0, targetCount);
}

export async function getOrCreateExamSession(userId: string, bookingId: string) {
  const existing = await prisma.examSession.findFirst({
    where: { bookingId, userId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    try {
      const ids = JSON.parse(existing.questionIds || "[]") as unknown;
      if (Array.isArray(ids) && ids.length > 0) {
        return existing;
      }
    } catch {
      // fall through and recreate below
    }

    if (existing.status === "NOT_STARTED") {
      await prisma.examSession.delete({ where: { id: existing.id } });
    } else {
      return existing;
    }
  }

  const secureToken = generateSecureToken();

  return prisma.$transaction(async (tx) => {
    const inTx = await tx.examSession.findFirst({
      where: { bookingId, userId },
      orderBy: { createdAt: "asc" },
    });
    if (inTx) return inTx;

    const questionIds = await pickRandomQuestionIds(tx, secureToken);

    if (questionIds.length === 0) {
      throw new Error("No exam questions are available. Please contact support.");
    }

    return tx.examSession.create({
      data: {
        userId,
        bookingId,
        questionIds: JSON.stringify(questionIds),
        secureToken,
        timeLimit: EXAM_CONFIG.timeLimitSeconds,
      },
    });
  });
}
