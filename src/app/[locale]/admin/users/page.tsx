import { prisma } from "@/lib/prisma";
import { UserManagement } from "@/components/admin/UserManagement";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "PARTICIPANT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { examResults: true, certificates: true } },
    },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    companyName: u.companyName,
    jobTitle: u.jobTitle,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    examCount: u._count.examResults,
    certificateCount: u._count.certificates,
  }));

  return <UserManagement users={serialized} />;
}
