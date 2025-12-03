"use client";

import { useEffect, useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Dialog } from "@headlessui/react";


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
      if (u.startsWith("/uploads") || u.startsWith("uploads")) return u.startsWith("/") ? u : "/" + u;
      const url = new URL(u);
      return ["http:", "https:"].includes(url.protocol) ? u : undefined;
    } catch { return undefined; }
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
export default function TutorRegularClasses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"scheduled" | "not-scheduled">("scheduled");

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [timeValue, setTimeValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

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
  const loadClasses = async () => {
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
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const openScheduleModal = (id: string) => {
    setSelectedClassId(id);
    setModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!timeValue) {
      toast({ title: "Time required", description: "Please select a time." });
      return;
    }

    try {
      await scheduleRegularClass(selectedClassId!, { time: timeValue });
      toast({ title: "Success", description: "Class scheduled successfully!" });
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

  const scheduledClasses = classes.filter((c) => c.scheduleStatus === "scheduled");
  const notScheduledClasses = classes.filter((c) => c.scheduleStatus === "not-scheduled");



  // ======================================================
  // ⭐ RENDER
  // ======================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="Regular Classes" subtitle="Your active regular class students" />

        {/* Tabs */}
        <div className="px-4 lg:px-6 mt-4 flex gap-3">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "scheduled" ? "bg-[#FFD54F] text-white" : "bg-white border"
              }`}
          >
            Scheduled Classes
          </button>

          <button
            onClick={() => setActiveTab("not-scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "not-scheduled" ? "bg-[#FFD54F] text-white" : "bg-white border"
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
          {!loading && activeTab === "scheduled" && scheduledClasses.length === 0 && (
            <Card className="p-6 text-center text-muted">No scheduled classes.</Card>
          )}

          {!loading &&
            activeTab === "scheduled" &&
            scheduledClasses.map((c) => {
              const { canJoin, isExpired } = getSessionJoinData(c.nextSession?.startDateTime);

              return (
                <Card key={c.regularClassId} className="p-6 bg-white rounded-2xl shadow-sm">

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={getImageUrl(c.student?.photoUrl || c.photoUrl)}
                            alt={c.student?.name || c.studentName}
                          />
                          <AvatarFallback>{(c.student?.name || c.studentName)[0]}</AvatarFallback>
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
                            new Date(c.nextSession.startDateTime).toLocaleDateString("en-IN")}

                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {c.nextSession?.startDateTime &&
                            new Date(c.nextSession.startDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}

                        </span>
                      </div>
                    </div>

                    <Badge className="bg-[#FFD54F] text-black">Scheduled</Badge>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-3">

                    {!isExpired && (
                      <button
                        onClick={() => window.open(c.nextSession.meetingLink, "_blank")}
                        disabled={!canJoin}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${canJoin
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
          {!loading && activeTab === "not-scheduled" && notScheduledClasses.length === 0 && (
            <Card className="p-6 text-center text-muted">All classes are scheduled.</Card>
          )}

          {!loading &&
            activeTab === "not-scheduled" &&
            notScheduledClasses.map((c) => (
              <Card key={c.regularClassId} className="p-6 bg-white rounded-2xl shadow-sm">
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
                      {new Date(c.startDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <Badge className="bg-[#FFD54F] text-red-700">Not Scheduled</Badge>
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
        <div className="fixed inset-0 bg-black/40"></div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
            <Dialog.Title className="text-lg font-semibold">Schedule Class</Dialog.Title>

            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

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
        <div className="fixed inset-0 bg-black/40"></div>

        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">

            <Dialog.Title className="text-lg font-semibold">Sessions</Dialog.Title>

            {(() => {
              if (sessionsLoading) return <div className="text-center text-gray-500">Loading...</div>;
              if (sessions.length === 0) return <div className="text-center text-gray-500">No sessions found.</div>;
              return (
              <div className="space-y-3">

                {sessions.map((s) => {
                  const { canJoin, isExpired } = getSessionJoinData(s.startDateTime);

                  return (
                    <div key={s._id} className="border rounded-lg p-3 space-y-3">

                      {/* Top Section */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div>{new Date(s.startDateTime).toLocaleDateString("en-IN")}</div>
                          <div>
                            {new Date(s.startDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">{s.status}</div>
                        </div>

                        {/* Join Button */}
                        {!isExpired && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await joinSession(s._id);
                                if (res?.success && res?.url) window.open(res.url, "_blank");
                              } catch { }
                            }}
                            disabled={!canJoin}
                            className={`px-3 py-2 rounded-lg text-sm ${canJoin
                                ? "bg-[#FFD54F] text-black"
                                : "bg-gray-200 text-gray-600 cursor-not-allowed"
                              }`}
                          >
                            Join Now
                          </button>
                        )}
                      </div>

                      {/* Uploads Section */}
                      {s.status === "completed" && (
                        <div className="space-y-4">
                          {/* Ratings & Feedback */}
                          {s.sessionFeedback && (
                            <div className="rounded-xl border p-4 bg-white shadow-sm">
                              <div className="text-sm font-semibold mb-2">Session Feedback</div>
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
                            buttonLabel="Upload Recording"
                            uploadHandler={async (file) => {
                              await uploadSessionRecording(s._id, file);
                              const res = await getRegularClassSessions(selectedClassId!);
                              setSessions(res.success ? res.data : []);
                            }}
                          />

                          <UploadCard
                            label="Notes"
                            fileUrl={s.notesUrl}
                            buttonId={`upload-notes-${s._id}`}
                            accept="application/pdf,.doc,.docx,.txt,image/*"
                            buttonLabel="Upload Notes"
                            uploadHandler={async (file) => {
                              await uploadSessionNotes(s._id, file);
                              const res = await getRegularClassSessions(selectedClassId!);
                              setSessions(res.success ? res.data : []);
                            }}
                          />

                          <UploadCard
                            label="Assignment"
                            fileUrl={s.assignmentUrl}
                            buttonId={`upload-assignment-${s._id}`}
                            accept="application/pdf,.doc,.docx,.txt,image/*"
                            buttonLabel="Upload Assignment"
                            uploadHandler={async (file) => {
                              await uploadSessionAssignment(s._id, file);
                              const res = await getRegularClassSessions(selectedClassId!);
                              setSessions(res.success ? res.data : []);
                            }}
                          />
                          </div>
                        )}
                    </div>
                  );
                })
              </div>
              );
            })()}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}



// ======================================================
// ⭐ IMAGE URL HELPER
// ======================================================
const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000").replace("/api", "");

const getImageUrl = (photoUrl?: string | null) => {
  if (!photoUrl) return "/default-avatar.png";

  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;

  const cleaned = photoUrl
    .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");

  return `${IMAGE_BASE}/${cleaned}`;
};
