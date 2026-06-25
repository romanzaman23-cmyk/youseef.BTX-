import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const existing = await prisma.competencyThreshold.findFirst();

  const thresholds = existing
    ? await prisma.competencyThreshold.update({ where: { id: existing.id }, data })
    : await prisma.competencyThreshold.create({ data });

  return NextResponse.json({ thresholds });
}
