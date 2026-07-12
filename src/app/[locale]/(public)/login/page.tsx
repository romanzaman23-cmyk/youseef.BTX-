import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="section-padding bg-muted min-h-[70vh] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <Suspense>
          <LoginForm registered={query.registered === "true"} />
        </Suspense>
      </div>
    </section>
  );
}
