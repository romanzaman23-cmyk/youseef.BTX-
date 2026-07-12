import { LoginForm } from "@/components/auth/LoginForm";
import { getCsrfToken, getLoginError } from "@/lib/auth-csrf";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const csrfToken = await getCsrfToken();

  return (
    <section className="section-padding bg-muted min-h-[70vh] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <LoginForm
          csrfToken={csrfToken}
          locale={locale}
          variant="admin"
          error={getLoginError(query.error)}
        />
      </div>
    </section>
  );
}
