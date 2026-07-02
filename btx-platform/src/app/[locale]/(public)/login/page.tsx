import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="section-padding bg-muted min-h-[70vh] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <LoginForm />
      </div>
    </section>
  );
}
