import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { EmailSetupBanner } from "@/components/admin/EmailSetupBanner";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user) {
    redirect(`/${locale}/login/admin`);
  }

  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/portal/dashboard`);
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <EmailSetupBanner locale={locale} />
          {children}
        </div>
      </main>
    </div>
  );
}
