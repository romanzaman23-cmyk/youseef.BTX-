import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email-notifications";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(8),
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const email = data.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await prisma.user.create({
      data: {
        fullName: data.fullName,
        email,
        mobile: data.mobile,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        password: hashedPassword,
        status: "PENDING",
      },
    });

    let emailSent = false;
    try {
      const result = await sendWelcomeEmail({ to: email, fullName: data.fullName });
      emailSent = result.sent;
      if (!emailSent) {
        console.warn("[register] Welcome email skipped — no email provider configured");
      }
    } catch (err) {
      console.error("Welcome email failed:", err);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
