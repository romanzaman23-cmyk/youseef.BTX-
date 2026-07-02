import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProfileClient } from "@/components/admin/AdminProfileClient";

export default async function AdminProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, activityLogs, loginHistories] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <AdminProfileClient
      profile={{
        fullName: user!.fullName,
        email: user!.email,
        mobile: user!.mobile,
        role: user!.role,
        status: user!.status,
        lastLoginAt: user!.lastLoginAt?.toISOString() || null,
        createdAt: user!.createdAt.toISOString(),
        twoFactorEnabled: user!.twoFactorEnabled,
        notifyEmail: user!.notifyEmail,
        notifySms: user!.notifySms,
        activityLogs: activityLogs.map((l) => ({
          action: l.action,
          details: l.details,
          createdAt: l.createdAt.toISOString(),
        })),
        loginHistories: loginHistories.map((l) => ({
          ipAddress: l.ipAddress,
          userAgent: l.userAgent,
          createdAt: l.createdAt.toISOString(),
        })),
      }}
    />
  );
}
