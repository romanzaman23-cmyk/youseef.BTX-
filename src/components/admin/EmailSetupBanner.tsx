import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { isEmailConfiguredAsync } from "@/lib/email-settings";
import { canSendToAnyRecipient } from "@/lib/resend-domains";

export async function EmailSetupBanner({ locale }: { locale: string }) {
  const configured = await isEmailConfiguredAsync();
  const productionReady = configured && (await canSendToAnyRecipient());

  if (productionReady) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-red-800">
          {configured
            ? "Email test mode — new users will NOT get welcome emails"
            : "Emails are NOT configured"}
        </p>
        <p className="text-red-700 mt-1">
          <Link href={`/${locale}/admin/settings`} className="underline font-medium">
            Settings → Email Setup
          </Link>
          {" "}→ Verify domain (Option A) OR add Brevo SMTP (Option B) so ALL users receive emails.
        </p>
      </div>
    </div>
  );
}
