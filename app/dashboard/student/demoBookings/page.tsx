"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import BookingList from "@/components/student/bookings/BookingList";
import { getStudentBookings } from "@/services/bookingService";

export default function StudentBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"demo" | "regular">("demo");

  const themePrimary = "#FFD54F";

  const searchParams = useSearchParams();

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

  // Initialize tab from query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "regular" || tab === "demo") {
      setActiveTab(tab as "regular" | "demo");
    }
  }, [searchParams]);

  // Filter based on active tab
  const filtered = bookings.filter(
    (b) => b.type?.toLowerCase() === activeTab
  );

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
        <Topbar title="My Classes" subtitle="Track and manage your sessions" />

        <main className="p-4 lg:p-6">

          {/* ---------- TABS ---------- */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("demo")}
              className={`px-4 py-2 rounded-full font-semibold text-sm ${
                activeTab === "demo"
                  ? "bg-[#FFD54F] text-black"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Demo Classes
            </button>

            <button
              onClick={() => setActiveTab("regular")}
              className={`px-4 py-2 rounded-full font-semibold text-sm ${
                activeTab === "regular"
                  ? "bg-[#FFD54F] text-black"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Regular Classes
            </button>
          </div>

          {/* ---------- BOOKINGS LIST ---------- */}
          {loading ? (
            <p className="text-center text-gray-500 mt-10">
              Loading your bookings...
            </p>
          ) : (
            <BookingList bookings={filtered} />
          )}
        </main>
      </div>
    </div>
  );
}
