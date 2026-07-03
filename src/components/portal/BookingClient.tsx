"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: number;
  maxParticipants: number;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface BookingClientProps {
  locale: string;
  eligible: boolean;
  nextEligibleDate: string | null;
  slots: Slot[];
  bookings: Booking[];
  userStatus: string;
}

export function BookingClient({
  locale,
  eligible,
  nextEligibleDate,
  slots,
  bookings,
  userStatus,
}: BookingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleBook = async (slotId: string) => {
    setLoading(slotId);
    setMessage("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examSlotId: slotId }),
    });

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setMessage(data.error || "Booking failed");
      return;
    }

    setMessage("Booking submitted! Awaiting admin approval.");
    router.refresh();
  };

  if (userStatus !== "APPROVED") {
    return (
      <div className="bg-btx-secondary/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-btx-primary mx-auto mb-3" />
        <p className="font-medium text-btx-primary">Account approval required before booking examinations.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-btx-primary mb-6">Book Examination</h1>

      {!eligible && nextEligibleDate && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          You must wait 3 months between examination attempts. Next eligible date:{" "}
          {format(new Date(nextEligibleDate), "PPP")}
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-btx-accent/10 text-btx-accent rounded-lg text-sm">{message}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-btx-primary mb-4">Available Slots</h2>
          {slots.length === 0 ? (
            <p className="text-gray-500">No examination slots available at this time.</p>
          ) : (
            <div className="space-y-4">
              {slots.map((slot) => (
                <div key={slot.id} className="bg-white rounded-xl p-5 card-shadow border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-btx-primary font-medium">
                        <Calendar className="w-4 h-4 text-btx-accent" />
                        {slot.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {slot.startTime} – {slot.endTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {slot.available} of {slot.maxParticipants} spots available
                      </div>
                    </div>
                    <button
                      onClick={() => handleBook(slot.id)}
                      disabled={!eligible || slot.available <= 0 || loading === slot.id}
                      className="btn-accent text-sm !py-2 !px-4 disabled:opacity-50"
                    >
                      {loading === slot.id ? "..." : "Book"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-btx-primary mb-4">Your Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-xl p-4 card-shadow flex items-center justify-between">
                  <div>
                    <p className="font-medium text-btx-primary">{b.date}</p>
                    <p className="text-sm text-gray-500">{b.startTime} – {b.endTime}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    b.status === "APPROVED" ? "bg-btx-accent/10 text-btx-accent" :
                    b.status === "PENDING" ? "bg-btx-secondary/20 text-btx-primary" :
                    b.status === "COMPLETED" ? "bg-gray-100 text-gray-600" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
