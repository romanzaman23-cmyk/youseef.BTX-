"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  jobTitle: string;
  status: string;
  createdAt: string;
  examCount: number;
  certificateCount: number;
}

export function UserManagement({ users }: { users: User[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (userId: string, status: string) => {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  };

  const resendWelcome = async (userId: string) => {
    setLoading(userId);
    const res = await fetch(`/api/admin/users/${userId}/resend-welcome`, { method: "POST" });
    const data = await res.json();
    setLoading(null);
    alert(res.ok ? "Welcome email sent!" : data.error || "Failed to send email");
  };

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">User Management</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-btx-primary text-white">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Company</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Exams</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-4 font-medium text-btx-primary">{user.fullName}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">{user.companyName}</td>
                  <td className="p-4 hidden lg:table-cell">{user.examCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "APPROVED" ? "bg-btx-accent/10 text-btx-accent" :
                      user.status === "PENDING" ? "bg-btx-secondary/20 text-btx-primary" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => resendWelcome(user.id)}
                        disabled={loading === user.id}
                        className="px-2 py-1 text-xs bg-btx-primary text-white rounded hover:opacity-90"
                        title="Resend welcome email"
                      >
                        Email
                      </button>
                      {user.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(user.id, "APPROVED")}
                            disabled={loading === user.id}
                            className="px-2 py-1 text-xs bg-btx-accent text-white rounded hover:opacity-90"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(user.id, "REJECTED")}
                            disabled={loading === user.id}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:opacity-90"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user.status === "APPROVED" && (
                        <button
                          onClick={() => updateStatus(user.id, "SUSPENDED")}
                          disabled={loading === user.id}
                          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:opacity-90"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status === "SUSPENDED" && (
                        <button
                          onClick={() => updateStatus(user.id, "APPROVED")}
                          disabled={loading === user.id}
                          className="px-2 py-1 text-xs bg-btx-accent text-white rounded hover:opacity-90"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
