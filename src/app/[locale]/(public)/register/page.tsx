import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="section-padding bg-muted min-h-[70vh] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <RegisterForm />
      </div>
    </section>
  );
}
