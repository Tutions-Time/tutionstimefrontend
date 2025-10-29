"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { getBookingById } from "@/services/studentService";
import dayjs from "dayjs";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        const res = await getBookingById(bookingId);
        setBooking(res);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} unreadCount={0} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Demo Confirmed" subtitle="Your demo session details" />
        <main className="p-6">
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            {!booking && <p className="text-gray-500">Loading booking...</p>}
            {booking && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">🎉 Demo booked successfully!</h2>
                <p>
                  <strong>Tutor:</strong> {booking?.tutorId?.name}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {dayjs(booking.startTime).format("MMM D, YYYY h:mm A")}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="capitalize">{booking.status}</span>
                </p>
                <p className="text-sm text-muted">
                  We’ve notified your tutor. You’ll see this under “My Demo Classes”.
                </p>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
