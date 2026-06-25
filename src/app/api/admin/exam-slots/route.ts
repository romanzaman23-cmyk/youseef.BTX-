import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, startTime, endTime, maxParticipants } = await request.json();

  const slot = await prisma.examSlot.create({
    data: {
      date: new Date(date),
      startTime,
      endTime,
      maxParticipants: maxParticipants || 20,
    },
  });

  return NextResponse.json({ slot });
}
