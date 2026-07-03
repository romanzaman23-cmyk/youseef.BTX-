"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  return (
    <>
      {registered && (
        <div className="mb-4 max-w-md mx-auto p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
          Account created successfully. You can log in now.
        </div>
      )}
      <LoginForm />
    </>
  );
}
