"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, BookOpen, Clock, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTutorRegularClasses, scheduleRegularClass, joinSession } from "@/services/tutorService";
import { toast } from "@/hooks/use-toast";
import { Dialog } from "@headlessui/react";

export default function TutorRegularClasses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"scheduled" | "not-scheduled">("scheduled");

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [timeValue, setTimeValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const openScheduleModal = (regularClassId: string) => {
    setSelectedClassId(regularClassId);
    setModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!timeValue) {
      toast({ title: "Time required", description: "Please select a time." });
      return;
    }

    try {
      const response = await scheduleRegularClass(selectedClassId!, {
        time: timeValue,
      });

      toast({ title: "Success", description: "Class scheduled successfully!" });
      setModalOpen(false);
      loadClasses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

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

  const scheduledClasses = classes.filter((c) => c.scheduleStatus === "scheduled");
  const notScheduledClasses = classes.filter((c) => c.scheduleStatus === "not-scheduled");

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
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "scheduled" ? "bg-[#FFD54F] text-white" : "bg-white border"
            }`}
          >
            Scheduled Classes
          </button>

          <button
            onClick={() => setActiveTab("not-scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "not-scheduled" ? "bg-[#FFD54F] text-white" : "bg-white border"
            }`}
          >
            Not Scheduled
          </button>
        </div>

        <main className="p-4 lg:p-6 space-y-4">
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading regular classes...
            </div>
          )}

          {/* Scheduled Tab */}
          {!loading && activeTab === "scheduled" && scheduledClasses.length === 0 && (
            <Card className="p-6 text-center text-muted">No scheduled classes.</Card>
          )}

          {!loading &&
            activeTab === "scheduled" &&
            scheduledClasses.map((c) => (
              <Card key={c.regularClassId} className="p-6 bg-white rounded-2xl shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={getImageUrl(c.student?.photoUrl || c.photoUrl)} alt={c.student?.name || c.studentName || "Student"} />
                        <AvatarFallback>{(c.student?.name || c.studentName || "S").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-lg">{c.student?.name || c.studentName}</div>
                    </div>

                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {c.subject}
                    </div>

                    {c.nextSession && (
                      <div className="text-gray-500 text-sm flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(c.nextSession.startDateTime).toLocaleDateString("en-IN")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(c.nextSession.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                  </div>

                  <Badge className="bg-[#FFD54F] text-black border-white">Scheduled</Badge>
                </div>

                {c.nextSession && (
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        try {
                          const res = await joinSession(c.nextSession.sessionId);
                          if (res?.success && res?.url) window.open(res.url, "_blank");
                          else toast({ title: "Unable to join", description: res?.message || "Please try again closer to the start time." });
                        } catch (e: any) {
                          toast({ title: "Join failed", description: e.message });
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${c.nextSession.canJoin ? "bg-[#FFD54F] text-black" : "bg-gray-200 text-gray-600"}`}
                      disabled={!c.nextSession.canJoin}
                      title={c.nextSession.canJoin ? "Join session" : "Join opens 5 min before and closes 5 min after"}
                    >
                      <Video className="w-4 h-4 inline-block mr-2" />
                      {c.nextSession.canJoin ? "Join" : "Join (available soon)"}
                    </button>
                  </div>
                )}
                <div className="mt-4">
                  <a
                    href={`/dashboard/tutor/regular-classes/${c.regularClassId}`}
                    className="inline-block px-4 py-2 border rounded-lg text-sm"
                  >
                    View Sessions
                  </a>
                </div>
              </Card>
            ))}

          {/* Not Scheduled Tab */}
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
                      <User className="w-4 h-4" />
                      {c.studentName}
                    </div>

                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {c.subject}
                    </div>

                    <div className="text-gray-500 text-sm flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(c.startDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <Badge className="bg-[#FFD54F] text-red-700 border-red-200">Not Scheduled</Badge>
                </div>

                {/* Schedule button */}
                <button
                  onClick={() => openScheduleModal(c.regularClassId)}
                  className="mt-4 px-4 py-2 bg-[#FFD54F] text-text font-bold rounded-lg text-sm"
                >
                  Schedule Time
                </button>
              </Card>
            ))}
        </main>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-40"></div>

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
    </div>
  );
}
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
