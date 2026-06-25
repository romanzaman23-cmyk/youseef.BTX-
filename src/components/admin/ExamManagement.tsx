"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X } from "lucide-react";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  booked: number;
  isActive: boolean;
}

interface PendingBooking {
  id: string;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function ExamManagement({
  slots,
  pendingBookings,
}: {
  slots: Slot[];
  pendingBookings: PendingBooking[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleBooking = async (bookingId: string, action: "approve" | "reject") => {
    setLoading(bookingId);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  };

  const handleCreateSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/admin/exam-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.get("date"),
        startTime: form.get("startTime"),
        endTime: form.get("endTime"),
        maxParticipants: parseInt(form.get("maxParticipants") as string),
      }),
    });
    setShowForm(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary">Exam Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-accent text-sm !py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Exam Slot
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateSlot} className="bg-white rounded-xl p-6 card-shadow mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input name="date" type="date" required className="input-field" />
          <input name="startTime" type="time" required className="input-field" />
          <input name="endTime" type="time" required className="input-field" />
          <input name="maxParticipants" type="number" defaultValue={20} min={1} required className="input-field" />
          <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-4">Create Slot</button>
        </form>
      )}

      {pendingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-btx-primary mb-4">Pending Booking Approvals</h2>
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl p-4 card-shadow flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-btx-primary">{b.userName}</p>
                  <p className="text-sm text-gray-500">{b.userEmail}</p>
                  <p className="text-sm text-gray-500 mt-1">{b.date} · {b.startTime} – {b.endTime}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBooking(b.id, "approve")}
                    disabled={loading === b.id}
                    className="btn-accent text-sm !py-2 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleBooking(b.id, "reject")}
                    disabled={loading === b.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-btx-primary mb-4">Exam Slots</h2>
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-btx-primary text-white">
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Time</th>
              <th className="text-left p-4">Capacity</th>
              <th className="text-left p-4">Booked</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id} className="border-b border-border/50">
                <td className="p-4">{s.date}</td>
                <td className="p-4">{s.startTime} – {s.endTime}</td>
                <td className="p-4">{s.maxParticipants}</td>
                <td className="p-4">{s.booked}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${s.isActive ? "bg-btx-accent/10 text-btx-accent" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
