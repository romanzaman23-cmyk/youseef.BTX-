import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <section className="section-padding bg-muted min-h-[70vh] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <Suspense>
          <LoginForm variant="admin" />
        </Suspense>
      </div>
    </section>
  );
}
