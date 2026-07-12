import { prisma } from "@/lib/prisma";
import { getAdminNotifyEmail } from "@/lib/email-settings";

/** Email address that receives admin alerts (works with Resend test mode). */
export async function resolveAdminNotifyEmail(): Promise<string | null> {
  const configured = await getAdminNotifyEmail();
  if (configured) return configured;

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admin?.email ?? null;
}
