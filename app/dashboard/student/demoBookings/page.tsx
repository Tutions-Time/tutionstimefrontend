"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import BookingList from "@/components/student/bookings/BookingList";
import { getStudentBookings } from "@/services/bookingService";
import { getStudentRegularClasses } from "@/services/studentService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video } from "lucide-react";
import { joinSession } from "@/services/studentService";
import dayjs from "dayjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function StudentBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [regularClasses, setRegularClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"demo" | "regular">("demo");

  const themePrimary = "#FFD54F";

  const IMAGE_BASE =
    process.env.NEXT_PUBLIC_IMAGE_URL ||
    (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000").replace("/api", "");

  const getImageUrl = (photoUrl?: string | null) => {
    if (!photoUrl) return "/default-avatar.png";
    const p = String(photoUrl);
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    const cleaned = p
      .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
      .replace(/\\/g, "/")
      .replace(/^.*uploads\//, "uploads/");
    const base = (IMAGE_BASE || "").replace(/\/$/, "");
    const rel = cleaned.replace(/^\//, "");
    return `${base}/${rel}`;
  };

  useEffect(() => {
    async function load() {
      try {
        const [list, regular] = await Promise.all([
          getStudentBookings(),
          getStudentRegularClasses(),
        ]);
        setBookings(list);
        setRegularClasses(regular);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter based on active tab (UNCHANGED)
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

          {/* Small accent bar (visual only) */}
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-yellow-400 mb-4" />

          {/* ---------- TABS ---------- */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("demo")}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                activeTab === "demo"
                  ? "bg-[#FFD54F] text-black shadow-sm"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Demo Classes
            </button>

            <button
              onClick={() => setActiveTab("regular")}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                activeTab === "regular"
                  ? "bg-[#FFD54F] text-black shadow-sm"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Regular Classes
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 mt-10">
              Loading your classes...
            </p>
          ) : activeTab === "demo" ? (
            // ✅ DEMO FUNCTIONALITY 100% SAME – STILL USING BookingList
            <BookingList bookings={filtered} />
          ) : regularClasses.length === 0 ? (
            <Card className="p-6 text-center text-gray-500 bg-white/80 backdrop-blur-xl border border-dashed border-gray-300">
              No Regular Classes yet.
            </Card>
          ) : (
            <div className="grid gap-4">
              {regularClasses.map((rc: any) => {
                const next = rc.nextSession;
                const canJoin = !!next?.canJoin;

                return (
                  <Card
                    key={rc.regularClassId}
                    className="p-6 bg-white/80 rounded-2xl border border-white/60 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.18)] hover:shadow-[0_22px_60px_rgba(15,23,42,0.25)] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 shadow-md">
                            <AvatarImage
                              src={getImageUrl(rc.tutor?.photoUrl)}
                              alt={rc.tutor?.name || "Tutor"}
                            />
                            <AvatarFallback>
                              {(rc.tutor?.name || "T").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-lg">
                              {rc.tutor?.name || "Tutor"}
                            </div>
                            <div className="text-gray-600 text-sm">
                              {rc.subject}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Regular Class
                            </div>
                          </div>
                        </div>

                        {next && (
                          <div className="text-gray-500 text-sm flex items-center gap-3 mt-3">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {dayjs(next.startDateTime).format("MMM D, YYYY")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {dayjs(next.startDateTime).format("h:mm A")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <Badge className="bg-[#FFD54F] text-black border-white shadow-sm">
                          {rc.scheduleStatus === "scheduled"
                            ? "Scheduled"
                            : "Not Scheduled"}
                        </Badge>
                        {next?.status && (
                          <div className="text-xs text-gray-500 mt-1">
                            {next.status}
                          </div>
                        )}
                      </div>
                    </div>

                    {next && (
                      <div className="mt-4">
                        <Button
                          onClick={async () => {
                            try {
                              const res = await joinSession(next.sessionId);
                              if (res?.success && res?.url) window.open(res.url, "_blank");
                            } catch (e: any) {
                              console.error("Join failed", e);
                            }
                          }}
                          className="bg-[#FFD54F] text-black font-semibold rounded-full px-5 shadow-md hover:shadow-lg border border-black/5"
                          disabled={!canJoin}
                          title={
                            canJoin
                              ? "Join session"
                              : "Join opens 5 min before and closes 5 min after"
                          }
                        >
                          <Video className="w-4 h-4 mr-2" />
                          {canJoin ? "Join" : "Join (available soon)"}
                        </Button>
                        {!canJoin && (
                          <div className="text-xs text-gray-500 mt-1">
                            Available at{" "}
                            {dayjs(next.startDateTime).format("h:mm A")}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4">
                      <a
                        href={`/dashboard/student/regular-classes/${rc.regularClassId}`}
                        className="inline-block px-4 py-2 border rounded-full text-sm"
                      >
                        View Sessions
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
