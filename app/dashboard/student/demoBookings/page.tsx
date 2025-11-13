"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import BookingList from "@/components/student/bookings/BookingList";
import { getStudentBookings } from "@/services/bookingService";

export default function StudentBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const themePrimary = "#FFD54F";

  useEffect(() => {
    async function load() {
      try {
        const list = await getStudentBookings();
        setBookings(list);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ ["--primary" as any]: themePrimary }}
    >
      {/* ---------- NAVBAR ---------- */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="student"
      />

      {/* ---------- SIDEBAR ---------- */}
      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ---------- MAIN AREA ---------- */}
      <div className="lg:pl-64">
        {/* ---------- TOPBAR ---------- */}
        <Topbar title="My Bookings" subtitle="Track and manage your sessions" />

        {/* ---------- CONTENT ---------- */}
        <main className="p-4 lg:p-6">
          {loading ? (
            <p className="text-center text-gray-500 mt-10">Loading your bookings...</p>
          ) : (
            <BookingList bookings={bookings} />
          )}
        </main>
      </div>
    </div>
  );
}
