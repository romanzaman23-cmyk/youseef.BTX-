import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email-notifications";
import { isEmailConfiguredAsync } from "@/lib/email-settings";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isEmailConfiguredAsync())) {
    return NextResponse.json(
      { error: "Configure email in Admin → Settings first (paste Resend API key)." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const result = await sendWelcomeEmail({ to: user.email, fullName: user.fullName });
    return NextResponse.json({ success: true, sent: result.sent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
