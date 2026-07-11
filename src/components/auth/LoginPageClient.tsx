"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  return <LoginForm variant="participant" registered={registered} />;
}
