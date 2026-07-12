import { NextResponse } from "next/server";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const locale = String(body.locale ?? "en");
    const variant = String(body.variant ?? "participant");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const fallbackDestination =
      variant === "admin"
        ? `/${locale}/admin/dashboard`
        : `/${locale}/portal/dashboard`;

    const resultUrl = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: fallbackDestination,
    });

    if (typeof resultUrl === "string" && resultUrl.includes("error=")) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (variant === "admin" && user.role !== "ADMIN") {
      await signOut({ redirect: false });
      return NextResponse.json({ error: "This login is for administrators only." }, { status: 403 });
    }

    const redirect =
      user.role === "ADMIN"
        ? `/${locale}/admin/dashboard`
        : `/${locale}/portal/dashboard`;

    return NextResponse.json({ ok: true, redirect });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
