import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  mobile: z.string().min(8).optional(),
  companyName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = profileSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });
    return NextResponse.json({ user: { fullName: user.fullName, mobile: user.mobile, companyName: user.companyName, jobTitle: user.jobTitle } });
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      mobile: true,
      companyName: true,
      jobTitle: true,
      role: true,
      status: true,
      notifyEmail: true,
      notifySms: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}
