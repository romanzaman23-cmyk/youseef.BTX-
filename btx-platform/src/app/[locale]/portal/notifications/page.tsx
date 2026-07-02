import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl p-5 card-shadow flex items-start gap-4 ${
                !n.read ? "border-l-4 border-btx-accent" : ""
              }`}
            >
              <Bell className="w-5 h-5 text-btx-accent mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-btx-primary">{n.title}</p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {format(new Date(n.createdAt), "PPp")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-muted rounded text-xs text-gray-500">
                  {n.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
