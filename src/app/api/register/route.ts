import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail, sendAdminNewRegistrationNotice } from "@/lib/email-notifications";
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
    let emailError: string | undefined;
    try {
      const result = await sendWelcomeEmail({ to: email, fullName: data.fullName });
      emailSent = result.sent;
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Email failed";
      console.error("Welcome email failed:", err);
    }

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    if (admin?.email) {
      void sendAdminNewRegistrationNotice({
        adminEmail: admin.email,
        userName: data.fullName,
        userEmail: email,
        welcomeEmailFailed: !emailSent,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, emailSent, emailError });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
