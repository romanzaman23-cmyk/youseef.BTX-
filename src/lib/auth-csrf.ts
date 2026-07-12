import { headers } from "next/headers";

export async function getAuthOrigin(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function getCsrfToken(): Promise<string> {
  const origin = await getAuthOrigin();
  const headerStore = await headers();

  const res = await fetch(`${origin}/api/auth/csrf`, {
    headers: {
      cookie: headerStore.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data = (await res.json()) as { csrfToken?: string };
  if (!data.csrfToken) {
    throw new Error("CSRF token missing");
  }

  return data.csrfToken;
}

export function getLoginError(error?: string): string | undefined {
  if (error === "CredentialsSignin") return "Invalid email or password";
  if (error) return "Login failed. Please try again.";
  return undefined;
}
