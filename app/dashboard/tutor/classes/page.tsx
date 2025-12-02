"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import {
  CalendarDays,
  Clock,
  BookOpen,
} from "lucide-react";

import {
  getTutorRegularClasses,
  scheduleRegularClass,
} from "@/services/tutorService";

import { toast } from "@/hooks/use-toast";
import { Dialog } from "@headlessui/react";

export default function TutorRegularClasses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<"scheduled" | "not-scheduled">("scheduled");

  const [modalOpen, setModalOpen] = useState(false);
  const [timeValue, setTimeValue] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const openScheduleModal = (id: string) => {
    setSelectedClassId(id);
    setModalOpen(true);
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await getTutorRegularClasses();
      if (res.success) setClasses(res.data);
      else toast({ title: "Error", description: res.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!timeValue) {
      toast({
        title: "Time required",
        description: "Please select a time.",
      });
      return;
    }

    try {
      await scheduleRegularClass(selectedClassId!, {
        time: timeValue,
      });

      toast({
        title: "Success",
        description: "Class scheduled successfully!",
      });
      setModalOpen(false);
      loadClasses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const scheduledClasses = classes.filter(
    (c) => c.scheduleStatus === "scheduled"
  );
  const notScheduledClasses = classes.filter(
    (c) => c.scheduleStatus === "not-scheduled"
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV + SIDEBAR */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} userRole="tutor" />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* PAGE */}
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
                ? "bg-[#FFD54F] text-black"
                : "bg-white border"
            }`}
          >
            Scheduled Classes
          </button>

          <button
            onClick={() => setActiveTab("not-scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "not-scheduled"
                ? "bg-[#FFD54F] text-black"
                : "bg-white border"
            }`}
          >
            Not Scheduled
          </button>
        </div>

        {/* MAIN CONTENT */}
        <main className="p-4 lg:p-6">
          {/* GRID — ONLY 2 CARDS PER ROW */}
          <div
            className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-2 
              xl:grid-cols-2 
              gap-6
            "
          >
            {/* ============= SCHEDULED CARDS ============= */}
            {!loading &&
              activeTab === "scheduled" &&
              scheduledClasses.map((c) => (
                <div
                  key={c.regularClassId}
                  className="
                    bg-white rounded-2xl border border-gray-200
                    shadow-[0_8px_24px_rgba(0,0,0,0.05)]
                    p-5 space-y-4
                    hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]
                    transition
                  "
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-gray-900">
                      Regular Class with {c.studentName}
                    </h2>

                    <span className="px-3 py-1 rounded-full bg-[#FFD54F] text-black text-sm font-medium">
                      Scheduled
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-800 text-sm">
                    <BookOpen className="w-4 h-4 text-[--primary]" />
                    <span className="font-medium">{c.subject}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <CalendarDays className="w-4 h-4 text-[--primary]" />
                    {formatDate(c.startDate)}
                  </div>
                </div>
              ))}

            {/* ============= NOT SCHEDULED CARDS ============= */}
            {!loading &&
              activeTab === "not-scheduled" &&
              notScheduledClasses.map((c) => (
                <div
                  key={c.regularClassId}
                  className="
                    bg-white rounded-2xl border border-gray-200
                    shadow-[0_8px_24px_rgba(0,0,0,0.05)]
                    p-5 space-y-4
                    hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]
                    transition
                  "
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-gray-900">
                      Regular Class with {c.studentName}
                    </h2>

                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                      Not Scheduled
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-800 text-sm">
                    <BookOpen className="w-4 h-4 text-[--primary]" />
                    <span className="font-medium">{c.subject}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <CalendarDays className="w-4 h-4 text-[--primary]" />
                    {formatDate(c.startDate)}
                  </div>

                  <button
                    onClick={() => openScheduleModal(c.regularClassId)}
                    className="
                      inline-flex items-center gap-2
                      font-semibold text-sm
                      px-4 py-2 rounded-full
                      bg-[#FFD54F] hover:bg-[#f3c942] text-black
                      transition cursor-pointer
                    "
                  >
                    <Clock className="w-4 h-4" />
                    Schedule Time
                  </button>
                </div>
              ))}
          </div>

          {/* EMPTY STATES */}
          {!loading &&
            activeTab === "scheduled" &&
            scheduledClasses.length === 0 && (
              <div className="bg-white p-6 text-center text-gray-500 shadow rounded-xl mt-6">
                No scheduled classes.
              </div>
            )}

          {!loading &&
            activeTab === "not-scheduled" &&
            notScheduledClasses.length === 0 && (
              <div className="bg-white p-6 text-center text-gray-500 shadow rounded-xl mt-6">
                All classes scheduled.
              </div>
            )}
        </main>
      </div>

      {/* ============= MODAL ============= */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black bg-opacity-40"></div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              Schedule Class
            </Dialog.Title>

            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

            <button
              onClick={handleScheduleSubmit}
              className="w-full bg-[#FFD54F] text-black py-2 rounded-lg font-semibold"
            >
              Save
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
