import Link from "next/link";
import { Mail, AlertTriangle } from "lucide-react";
import { isEmailConfiguredAsync } from "@/lib/email-settings";

export async function EmailSetupBanner({ locale }: { locale: string }) {
  const configured = await isEmailConfiguredAsync();
  if (configured) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-red-800 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Emails are NOT working — users will not receive welcome or reminder emails
        </p>
        <p className="text-red-700 mt-1">
          Admin ko abhi{" "}
          <Link href={`/${locale}/admin/settings`} className="underline font-medium">
            Settings → Email Setup
          </Link>{" "}
          mein Resend API key add karni hogi (free, 2 minute setup).
        </p>
      </div>
    </div>
  );
}
