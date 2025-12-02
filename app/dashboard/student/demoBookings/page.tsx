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
import dayjs from "dayjs";
import { Dialog } from "@headlessui/react";
import { getRegularClassSessions, joinSession } from "@/services/tutorService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function StudentBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [regularClasses, setRegularClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"demo" | "regular">("demo");
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedRegularClassId, setSelectedRegularClassId] = useState<string | null>(null);

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

  // Filter based on active tab
  // Hide demo bookings that have an associated PAID regular class
  const filtered = bookings.filter((b) => {
    const isTabMatch = (b.type?.toLowerCase() === activeTab);
    if (!isTabMatch) return false;
    if (activeTab !== "demo") return true;
    const rc = regularClasses.find((rc: any) => String(rc.regularClassId) === String(b.regularClassId));
    if (!rc) return true;
    return rc.paymentStatus !== "paid";
  });

  const openSessionsModal = async (regularClassId: string) => {
    setSelectedRegularClassId(regularClassId);
    setSessionsModalOpen(true);
    try {
      setSessionsLoading(true);
      const res = await getRegularClassSessions(regularClassId);
      setSessions(res.success ? (res.data || []) : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  return (
    <>
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
                const hasLink = !!next?.meetingLink;
                const canJoin = !!next?.canJoin && hasLink;

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

                    {hasLink && (
                      <div className="mt-4">
                        <Button
                          onClick={() =>
                            window.open(next.meetingLink, "_blank")
                          }
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
                        <Button
                          onClick={() => openSessionsModal(rc.regularClassId)}
                          className="ml-3 bg-white text-gray-700 border rounded-full px-5"
                        >
                          View Sessions
                        </Button>
                        {!canJoin && (
                          <div className="text-xs text-gray-500 mt-1">
                            Available at{" "}
                            {dayjs(next.startDateTime).format("h:mm A")}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>

    <Dialog open={sessionsModalOpen} onClose={() => setSessionsModalOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">Sessions</Dialog.Title>
          {sessionsLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-500">No sessions found.</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => {
                const start = new Date(s.startDateTime);
                const startMs = start.getTime();
                const classDurationMin = 60;
                const joinBeforeMin = 5;
                const expireAfterMin = 5;
                const endMs = startMs + classDurationMin * 60 * 1000;
                const joinOpenAt = startMs - joinBeforeMin * 60 * 1000;
                const joinCloseAt = endMs + expireAfterMin * 60 * 1000;
                const nowMs = Date.now();
                const canJoin = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
                return (
                  <div key={s._id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div>{start.toLocaleDateString("en-IN")}</div>
                        <div>{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div className="text-xs text-gray-500">{s.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={async () => {
                            try {
                              const res = await joinSession(s._id);
                              if (res?.success && res?.url) window.open(res.url, "_blank");
                            } catch {}
                          }}
                          disabled={!canJoin}
                          className={`px-3 py-2 rounded-full text-sm ${canJoin ? "bg-[#FFD54F] text-black" : "bg-gray-200 text-gray-600"}`}
                        >
                          Join Now
                        </Button>
                      </div>
                    </div>

                    {s.status === "completed" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="border rounded-lg p-2">
                          <div className="font-medium">Recording</div>
                          {s.recordingUrl ? (
                            <a href={s.recordingUrl} target="_blank" rel="noreferrer" className="text-primary text-xs">View</a>
                          ) : (
                            <div className="text-xs text-gray-500">Not available</div>
                          )}
                        </div>
                        <div className="border rounded-lg p-2">
                          <div className="font-medium">Notes</div>
                          {s.notesUrl ? (
                            <a href={s.notesUrl} target="_blank" rel="noreferrer" className="text-primary text-xs">View</a>
                          ) : (
                            <div className="text-xs text-gray-500">Not available</div>
                          )}
                        </div>
                        <div className="border rounded-lg p-2">
                          <div className="font-medium">Assignment</div>
                          {s.assignmentUrl ? (
                            <a href={s.assignmentUrl} target="_blank" rel="noreferrer" className="text-primary text-xs">Download</a>
                          ) : (
                            <div className="text-xs text-gray-500">Not available</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
    </>
  );
}
