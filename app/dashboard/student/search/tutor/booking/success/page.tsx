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
        <Topbar title="Booking Confirmed" subtitle="Your session details" />
        <main className="p-6">
          <Card className="p-6 bg-white rounded-2xl shadow-sm">
            {!booking && <p className="text-gray-500">Loading booking...</p>}
            {booking && (
              <div className="space-y-3 text-gray-700">
                <h2 className="text-xl font-semibold text-primary">
                  🎉 {booking.type === "demo" ? "Demo Booked Successfully!" : "Class Confirmed!"}
                </h2>
                <p><strong>Tutor:</strong> {booking.tutorId?.name || "N/A"}</p>
                <p><strong>Subject:</strong> {booking.subject}</p>
                <p><strong>Date:</strong> {dayjs(booking.startTime).format("MMM D, YYYY h:mm A")}</p>
                <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>

                {booking.zoomLink && (
                  <div className="mt-4">
                    <a
                      href={booking.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Join on Zoom
                    </a>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4">
                  You can always access this session under “My Sessions”.
                </p>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
