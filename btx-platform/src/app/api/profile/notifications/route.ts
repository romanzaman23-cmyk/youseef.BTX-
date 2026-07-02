import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notifyEmail, notifySms } = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      notifyEmail: notifyEmail ?? undefined,
      notifySms: notifySms ?? undefined,
    },
  });

  return NextResponse.json({ success: true });
}
