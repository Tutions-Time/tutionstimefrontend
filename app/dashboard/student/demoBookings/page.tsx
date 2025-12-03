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
import { submitSessionFeedback } from "@/services/progressService";

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

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ teaching: 5, communication: 5, understanding: 5, comment: "" });

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

  const filtered = bookings.filter((b) => {
    const isTabMatch = b.type?.toLowerCase() === activeTab;
    if (!isTabMatch) return false;

    if (activeTab !== "demo") return true;

    const rc = regularClasses.find(
      (rc: any) => String(rc.regularClassId) === String(b.regularClassId)
    );

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

  // ============================================
  // JOIN BUTTON LOGIC — UNIVERSAL FUNCTION
  // ============================================
  const getJoinState = (startDateTime: string) => {
    const startMs = new Date(startDateTime).getTime();
    const nowMs = Date.now();

    const joinOpenAt = startMs - 5 * 60 * 1000; // 5 min before
    const joinCloseAt = startMs + 60 * 60 * 1000; // 1 hour after

    const isFuture = nowMs < joinOpenAt;
    const inJoinWindow = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
    const isExpired = nowMs > joinCloseAt;

    return { isFuture, inJoinWindow, isExpired };
  };

  return (
    <>
      <div
        className="min-h-screen bg-gray-50"
        style={{ ["--primary" as any]: themePrimary }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
        <Sidebar
          userRole="student"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-64">
          <Topbar title="My Classes" subtitle="Track and manage your sessions" />

          <main className="p-4 lg:p-6">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-yellow-400 mb-4" />

            {/* TABS */}
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

            {/* CONTENT */}
            {loading ? (
              <p className="text-center text-gray-500 mt-10">Loading your classes...</p>
            ) : activeTab === "demo" ? (
              <BookingList bookings={filtered} />
            ) : regularClasses.length === 0 ? (
              <Card className="p-6 text-center text-gray-500 bg-white/80 border border-dashed">
                No Regular Classes yet.
              </Card>
            ) : (
              <div className="grid gap-4">
                {regularClasses.map((rc: any) => {
                  const next = rc.nextSession;
                  const hasLink = !!next?.meetingLink;

                  let joinState = { isFuture: false, inJoinWindow: false, isExpired: false };
                  if (next) joinState = getJoinState(next.startDateTime);

                  return (
                    <Card
                      key={rc.regularClassId}
                      className="p-6 bg-white/80 rounded-2xl border shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
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
                            <div className="font-semibold text-lg">{rc.tutor?.name}</div>
                            <div className="text-gray-600 text-sm">{rc.subject}</div>
                            <div className="text-xs text-gray-400 mt-1">Regular Class</div>

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
                        </div>

                        <Badge className="bg-[#FFD54F] text-black shadow-sm">
                          {rc.scheduleStatus === "scheduled"
                            ? "Scheduled"
                            : "Not Scheduled"}
                        </Badge>
                      </div>

                      {hasLink && (
                        <div className="mt-4 flex flex-wrap gap-3">

                          {/* JOIN BUTTON */}
                          {!joinState.isExpired && (
                            <Button
                              onClick={() =>
                                joinState.inJoinWindow &&
                                window.open(next.meetingLink, "_blank")
                              }
                              disabled={!joinState.inJoinWindow}
                              className="bg-[#FFD54F] text-black font-semibold rounded-full px-5 shadow-md hover:shadow-lg"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              {joinState.inJoinWindow
                                ? "Join Now"
                                : "Join (available soon)"}
                            </Button>
                          )}

                          {/* VIEW SESSIONS */}
                          <Button
                            onClick={() => openSessionsModal(rc.regularClassId)}
                            className="bg-white text-gray-700 border rounded-full px-5"
                          >
                            View Sessions
                          </Button>
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

      {/* MODAL */}
      <Dialog
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="p-6 pb-3 border-b">
              <Dialog.Title className="text-lg font-semibold">Sessions</Dialog.Title>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {sessionsLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-gray-500">No sessions found.</div>
              ) : (
                sessions.map((s: any) => {
                  const startMs = new Date(s.startDateTime).getTime();
                  const nowMs = Date.now();

                  const joinOpenAt = startMs - 5 * 60 * 1000;
                  const joinCloseAt = startMs + 60 * 60 * 1000;

                  const isFuture = nowMs < joinOpenAt;
                  const inJoinWindow = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
                  const isExpired = nowMs > joinCloseAt;

                  return (
                    <div key={s._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(s.startDateTime).toLocaleDateString("en-IN")}
                          </div>
                          <div>
                            {new Date(s.startDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">{s.status}</div>
                        </div>

                        {!isExpired && (
                          <Button
                            onClick={async () => {
                              if (!inJoinWindow) return;
                              try {
                                const res = await joinSession(s._id);
                                if (res?.success && res?.url)
                                  window.open(res.url, "_blank");
                              } catch {}
                            }}
                            disabled={!inJoinWindow}
                            className="bg-[#FFD54F] text-black px-3 py-2 rounded-full text-sm"
                          >
                            {inJoinWindow ? "Join Now" : "Join (available soon)"}
                          </Button>
                        )}
                      </div>

                      {/* FILE DOWNLOADS */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {s.notesUrl && (
                          <Button
                            className="bg-[#FFD54F] text-black text-xs rounded-full px-4 py-2 shadow-sm"
                            onClick={() => window.open(s.notesUrl, "_blank")}
                          >
                            📘 Download Notes
                          </Button>
                        )}

                        {s.assignmentUrl && (
                          <Button
                            className="bg-[#FFD54F] text-black text-xs rounded-full px-4 py-2 shadow-sm"
                            onClick={() => window.open(s.assignmentUrl, "_blank")}
                          >
                            📝 Download Assignment
                          </Button>
                        )}

                        {s.recordingUrl && (
                          <Button
                            className="bg-[#FFD54F] text-black text-xs rounded-full px-4 py-2 shadow-sm"
                            onClick={() => window.open(s.recordingUrl, "_blank")}
                          >
                            🎥 Watch Recording
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
