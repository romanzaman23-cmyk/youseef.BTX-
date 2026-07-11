"use server";

import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const variant = String(formData.get("variant") ?? "participant");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const fallbackDestination =
    variant === "admin"
      ? `/${locale}/admin/dashboard`
      : `/${locale}/portal/dashboard`;

  try {
    const resultUrl = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: fallbackDestination,
    });

    if (typeof resultUrl === "string") {
      if (
        resultUrl.includes("error=CredentialsSignin") ||
        resultUrl.includes("code=credentials")
      ) {
        return { error: "Invalid email or password" };
      }

      if (resultUrl.includes("error=")) {
        return { error: "Login failed. Please try again." };
      }
    }

    const session = await auth();

    if (!session?.user) {
      return { error: "Login failed. Please try again." };
    }

    if (variant === "admin" && session.user.role !== "ADMIN") {
      await signOut({ redirect: false });
      return { error: "This login is for administrators only." };
    }

    const destination =
      session.user.role === "ADMIN"
        ? `/${locale}/admin/dashboard`
        : `/${locale}/portal/dashboard`;

    redirect(destination);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
      return { error: "Login failed. Please try again." };
    }

    console.error("loginAction error:", error);
    return { error: "Login failed. Please try again." };
  }
}
