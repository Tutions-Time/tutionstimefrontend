"use client";
import React, { useCallback, useEffect, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, BookOpen, Clock, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  getTutorRegularClasses,
  scheduleRegularClass,
  getRegularClassSessions,
  joinSession,
  uploadSessionRecording,
  uploadSessionNotes,
  uploadSessionAssignment,
} from "@/services/tutorService";
import { useToast } from "@/hooks/use-toast";
import { Dialog } from "@headlessui/react";
import { useNotificationRefresh } from "@/hooks/useNotificationRefresh";

// ======================================================
// ⭐ BEAUTIFUL UploadCard Component (with types)
// ======================================================
interface UploadCardProps {
  label: string;
  fileUrl?: string | null;
  buttonId: string;
  accept: string;
  buttonLabel: string;
  uploadHandler: (file: File) => Promise<void>;
}

function UploadCard({
  label,
  fileUrl,
  buttonId,
  accept,
  buttonLabel,
  uploadHandler,
}: UploadCardProps) {
  const safeUrl = (u?: string | null) => {
    if (!u) return undefined;
    try {
      if (u.startsWith("/uploads") || u.startsWith("uploads")) {
        return u.startsWith("/") ? u : "/" + u;
      }
      const url = new URL(u);
      return ["http:", "https:"].includes(url.protocol) ? u : undefined;
    } catch {
      return undefined;
    }
  };

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="text-sm font-semibold mb-2">{label}</div>

      {safeUrl(fileUrl) ? (
        <a
          href={safeUrl(fileUrl)}
          target="_blank"
          rel="noreferrer"
          className="text-[#FFD54F] underline text-sm font-medium"
        >
          {label === "Assignment" ? "Download Assignment" : `View ${label}`}
        </a>
      ) : (
        <button
          onClick={() => document.getElementById(buttonId)?.click()}
          className="w-full py-2 px-4 rounded-xl bg-[#FFD54F] text-black text-sm font-semibold shadow hover:opacity-90 transition"
        >
          {buttonLabel}
        </button>
      )}

      <input
        id={buttonId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await uploadHandler(file);
        }}
      />
    </div>
  );
}

// ======================================================
// ⭐ MAIN COMPONENT
// ======================================================
const TutorRegularClasses = () => {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<"scheduled" | "not-scheduled">("scheduled");

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState("03");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedMeridiem, setSelectedMeridiem] = useState<"AM" | "PM">("PM");
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const formatDateRaw = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", {
      timeZone: "UTC",
    });

  const formatTimeRaw = (value: string) =>
    new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

  // ------------------------------------------------------
  // ⭐ JOIN LOGIC CALC (Unified frontend logic)
  // ------------------------------------------------------
  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr);
    const startMs = start.getTime();

    const classDurationMin = 60;
    const joinBeforeMin = 5;
    const expireAfterMin = 5;

    const endMs = startMs + classDurationMin * 60 * 1000;
    const joinOpenAt = startMs - joinBeforeMin * 60 * 1000;
    const joinCloseAt = endMs + expireAfterMin * 60 * 1000;
    const nowMs = Date.now();

    const canJoin = nowMs >= joinOpenAt && nowMs <= joinCloseAt;
    const isExpired = nowMs > joinCloseAt;

    return { canJoin, isExpired };
  };

  // ------------------------------------------------------
  // Load classes
  // ------------------------------------------------------
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTutorRegularClasses();
      if (res.success) setClasses(res.data || []);
      else toast({ title: "Error", description: res.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const isClassNotification = (detail: any) => {
    const title = String(detail?.data?.title || detail?.data?.message || "").toLowerCase();
    const meta = detail?.data?.meta || {};
    return (
      title.includes("payment") ||
      title.includes("class") ||
      title.includes("feedback") ||
      Boolean(meta.regularClassId) ||
      Boolean(meta.paymentId) ||
      Boolean(meta.sessionId)
    );
  };

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useNotificationRefresh(() => {
    loadClasses();
  }, isClassNotification);

  const openScheduleModal = (id: string) => {
    setSelectedClassId(id);
    setSelectedHour("03");
    setSelectedMinute("00");
    setSelectedMeridiem("PM");
    setModalOpen(true);
  };

  const getTimeValue24h = () => {
    let h = Number(selectedHour) % 12;
    if (selectedMeridiem === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${selectedMinute}`;
  };

  const handleScheduleSubmit = async () => {
    if (!selectedClassId) {
      toast({ title: "Time required", description: "Please select a time." });
      return;
    }

    try {
      await scheduleRegularClass(selectedClassId, { time: getTimeValue24h() });
      toast({
        title: "Success",
        description: "Class scheduled successfully!",
      });
      setModalOpen(false);
      loadClasses();
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    }
  };

  const openSessionsModal = async (id: string) => {
    setSelectedClassId(id);
    setSessionsModalOpen(true);

    try {
      setSessionsLoading(true);
      const res = await getRegularClassSessions(id);
      setSessions(res.success ? res.data : []);
    } finally {
      setSessionsLoading(false);
    }
  };

  const scheduledClasses = classes.filter(
    (c) => c.scheduleStatus === "scheduled"
  );
  const notScheduledClasses = classes.filter(
    (c) => c.scheduleStatus === "not-scheduled"
  );

  // Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="tutor"
      />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Regular Classes"
          subtitle="Your active regular class students"
        />

        {/* Tabs */}
        <div className="px-4 lg:px-6 mt-4 flex gap-3">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "scheduled"
                ? "bg-[#FFD54F] text-white"
                : "bg-white border"
            }`}
          >
            Scheduled Classes
          </button>

          <button
            onClick={() => setActiveTab("not-scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "not-scheduled"
                ? "bg-[#FFD54F] text-white"
                : "bg-white border"
            }`}
          >
            Not Scheduled
          </button>
        </div>

        {/* Content */}
        <main className="p-4 lg:p-6 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading regular classes...
            </div>
          )}

          {/* Scheduled */}
          {!loading &&
            activeTab === "scheduled" &&
            scheduledClasses.length === 0 && (
              <Card className="p-6 text-center text-muted">
                No scheduled classes.
              </Card>
            )}

          {!loading &&
            activeTab === "scheduled" &&
            scheduledClasses.map((c) => {
              const { canJoin, isExpired } = getSessionJoinData(
                c.nextSession?.startDateTime
              );

              return (
                <Card
                  key={c.regularClassId}
                  className="p-6 bg-white rounded-2xl shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={getImageUrl(
                              c.student?.photoUrl || c.photoUrl
                            )}
                            alt={c.student?.name || c.studentName}
                          />
                          <AvatarFallback>
                            {(c.student?.name || c.studentName)[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-lg">
                          {c.student?.name || c.studentName}
                        </div>
                      </div>

                      <div className="text-gray-600 text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> {c.subject}
                      </div>

                      <div className="text-gray-500 text-sm flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {c.nextSession?.startDateTime &&
                            formatDateRaw(c.nextSession.startDateTime)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {c.nextSession?.startDateTime &&
                            formatTimeRaw(c.nextSession.startDateTime)}
                        </span>
                      </div>
                    </div>

                    <Badge className="bg-[#FFD54F] text-black">
                      Scheduled
                    </Badge>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-3">
                    {!isExpired && (
                      <button
                        onClick={() =>
                          window.open(c.nextSession.meetingLink, "_blank")
                        }
                        disabled={!canJoin}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                          canJoin
                            ? "bg-[#FFD54F] text-black"
                            : "bg-gray-200 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        <Video className="w-4 h-4 inline-block mr-2" />
                        Join
                      </button>
                    )}

                    <button
                      onClick={() => openSessionsModal(c.regularClassId)}
                      className="px-4 py-2 border rounded-lg text-sm"
                    >
                      View Sessions
                    </button>
                  </div>
                </Card>
              );
            })}

          {/* Not Scheduled */}
          {!loading &&
            activeTab === "not-scheduled" &&
            notScheduledClasses.length === 0 && (
              <Card className="p-6 text-center text-muted">
                All classes are scheduled.
              </Card>
            )}

          {!loading &&
            activeTab === "not-scheduled" &&
            notScheduledClasses.map((c) => (
              <Card
                key={c.regularClassId}
                className="p-6 bg-white rounded-2xl shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <User className="w-4 h-4" /> {c.studentName}
                    </div>

                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> {c.subject}
                    </div>

                    <div className="text-gray-500 text-sm flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4" />
                      {formatDateRaw(c.startDate)}
                    </div>
                  </div>

                  <Badge className="bg-[#FFD54F] text-red-700">
                    Not Scheduled
                  </Badge>
                </div>

                <button
                  onClick={() => openScheduleModal(c.regularClassId)}
                  className="mt-4 px-4 py-2 bg-[#FFD54F] font-bold rounded-lg text-sm"
                >
                  Schedule Time
                </button>
              </Card>
            ))}
        </main>
      </div>

      {/* ======================================================
          ⭐ Schedule Time Modal
      ====================================================== */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              Schedule Class
            </Dialog.Title>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">Select class time</div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="w-full border p-2 rounded-lg bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  className="w-full border p-2 rounded-lg bg-white"
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={selectedMeridiem}
                  onChange={(e) => setSelectedMeridiem(e.target.value as "AM" | "PM")}
                  className="w-full border p-2 rounded-lg bg-white"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <div className="text-xs text-gray-500">
                Selected: {Number(selectedHour)}:{selectedMinute} {selectedMeridiem}
              </div>
            </div>

            <button
              onClick={handleScheduleSubmit}
              className="w-full bg-[#FFD54F] text-white py-2 rounded-lg"
            >
              Save
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* ======================================================
          ⭐ Sessions Modal
      ====================================================== */}
      <Dialog
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold">
              Sessions
            </Dialog.Title>

            {/* Sessions content */}
            {sessionsLoading && (
              <div className="text-center text-gray-500">Loading...</div>
            )}

            {!sessionsLoading && sessions.length === 0 && (
              <div className="text-center text-gray-500">
                No sessions found.
              </div>
            )}

            {!sessionsLoading && sessions.length > 0 && (
              <div className="space-y-3">
                {sessions.map((s) => {
                  const { canJoin, isExpired } = getSessionJoinData(
                    s.startDateTime
                  );

                  return (
                    <div
                      key={s._id}
                      className="border rounded-lg p-3 space-y-3"
                    >
                      {/* Top Section */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div>
                            {formatDateRaw(s.startDateTime)}
                          </div>
                          <div>
                            {formatTimeRaw(s.startDateTime)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {s.status}
                          </div>
                        </div>

                        {/* Join Button */}
                        {!isExpired && s.status !== "completed" && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await joinSession(s._id);
                                if (res?.success && res?.url) {
                                  window.open(res.url, "_blank");
                                }
                              } catch {
                                // ignore
                              }
                            }}
                            disabled={!canJoin}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              canJoin
                                ? "bg-[#FFD54F] text-black"
                                : "bg-gray-200 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            Join Now
                          </button>
                        )}
                      </div>

                      {/* Uploads Section (only when completed) */}
                      {s.status === "completed" && (
                        <div className="space-y-4">
                          {/* Ratings & Feedback */}
                          {s.sessionFeedback && (
                            <div className="rounded-xl border p-4 bg-white shadow-sm">
                              <div className="text-sm font-semibold mb-2">
                                Session Feedback
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>Teaching: {s.sessionFeedback.teaching}/5</div>
                                <div>Communication: {s.sessionFeedback.communication}/5</div>
                                <div>Understanding: {s.sessionFeedback.understanding}/5</div>
                                <div>Overall: {s.sessionFeedback.overall}/5</div>
                              </div>
                              {s.sessionFeedback.comment && (
                                <div className="mt-2 text-sm text-gray-700">
                                  {s.sessionFeedback.comment}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Materials */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <UploadCard
                              label="Recording"
                              fileUrl={s.recordingUrl}
                              buttonId={`upload-recording-${s._id}`}
                              accept="video/*"
                              buttonLabel="Upload"
                              uploadHandler={async (file) => {
                                await uploadSessionRecording(s._id, file);
                                const res = await getRegularClassSessions(
                                  selectedClassId!
                                );
                                setSessions(res.success ? res.data : []);
                              }}
                            />

                            <UploadCard
                              label="Notes"
                              fileUrl={s.notesUrl}
                              buttonId={`upload-notes-${s._id}`}
                              accept="application/pdf,.doc,.docx,.txt,image/*"
                              buttonLabel="Upload"
                              uploadHandler={async (file) => {
                                await uploadSessionNotes(s._id, file);
                                const res = await getRegularClassSessions(
                                  selectedClassId!
                                );
                                setSessions(res.success ? res.data : []);
                              }}
                            />

                            <UploadCard
                              label="Assignment"
                              fileUrl={s.assignmentUrl}
                              buttonId={`upload-assignment-${s._id}`}
                              accept="application/pdf,.doc,.docx,.txt,image/*"
                              buttonLabel="Upload"
                              uploadHandler={async (file) => {
                                await uploadSessionAssignment(s._id, file);
                                const res = await getRegularClassSessions(
                                  selectedClassId!
                                );
                                setSessions(res.success ? res.data : []);
                              }}
                            />
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
    </div>
  );
};

export default TutorRegularClasses;

// ======================================================
// ⭐ IMAGE URL HELPER
// ======================================================
const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000").replace(
    "/api",
    ""
  );

const getImageUrl = (photoUrl?: string | null) => {
  if (!photoUrl) return "/default-avatar.png";

  if (
    photoUrl.startsWith("http://") ||
    photoUrl.startsWith("https://")
  )
    return photoUrl;

  const cleaned = photoUrl
    .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");

  return `${IMAGE_BASE}/${cleaned}`;
};
