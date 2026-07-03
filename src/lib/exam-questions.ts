import { Prisma } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { EXAM_CONFIG } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { generateSecureToken, seededShuffle } from "@/lib/utils";

type DbClient = Pick<PrismaClient, "$queryRaw" | "examSession">;

/**
 * Picks a unique random question set via SQLite RANDOM() (server-side).
 * Balanced across levels 1–4, then shuffled with a per-session seed.
 */
export async function pickRandomQuestionIds(
  db: DbClient,
  sessionSeed: string
): Promise<string[]> {
  const perLevel = Math.ceil(EXAM_CONFIG.questionsPerExam / 4);
  const collected: string[] = [];

  for (let level = 1; level <= 4; level++) {
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM Question
      WHERE isActive = 1 AND level = ${level}
      ORDER BY RANDOM()
      LIMIT ${perLevel}
    `;
    collected.push(...rows.map((r) => r.id));
  }

  const targetCount = EXAM_CONFIG.questionsPerExam;
  if (collected.length < targetCount) {
    const needed = targetCount - collected.length;
    const extra =
      collected.length > 0
        ? await db.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM Question
            WHERE isActive = 1
              AND id NOT IN (${Prisma.join(collected)})
            ORDER BY RANDOM()
            LIMIT ${needed}
          `
        : await db.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM Question
            WHERE isActive = 1
            ORDER BY RANDOM()
            LIMIT ${needed}
          `;
    collected.push(...extra.map((r) => r.id));
  }

  const uniqueIds = [...new Set(collected)];
  const shuffled = seededShuffle(uniqueIds, sessionSeed);
  return shuffled.slice(0, targetCount);
}

export async function getOrCreateExamSession(
  userId: string,
  bookingId: string
) {
  const existing = await prisma.examSession.findFirst({
    where: { bookingId, userId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  const secureToken = generateSecureToken();

  return prisma.$transaction(async (tx) => {
    const inTx = await tx.examSession.findFirst({
      where: { bookingId, userId },
      orderBy: { createdAt: "asc" },
    });
    if (inTx) return inTx;

    const questionIds = await pickRandomQuestionIds(tx, secureToken);

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
