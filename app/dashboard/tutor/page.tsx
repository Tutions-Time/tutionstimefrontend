"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchUserProfile } from "@/store/slices/profileSlice";

import KpiSection from "@/components/tutors/dashboard/KpiSection";
import RatingsFeedbackWidget from "@/components/tutors/dashboard/RatingsFeedbackWidget";
import MyClassesSection from "@/components/tutors/dashboard/MyClassesSection";
import QuickActionsSection from "@/components/tutors/dashboard/QuickActionsSection";

import { getTutorRegularClasses } from "@/services/tutorService";

/* ---------------------------------------------  
   Tutor Class Type  
---------------------------------------------- */
export type TutorClass = {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "confirmed";
  type: "demo" | "regular";
  meetingLink?: string;
  nextSession?: {
    startDateTime: string;
    meetingLink?: string;
    canJoin?: boolean;
  };
};

/* ---------------------------------------------  
   MAIN COMPONENT  
---------------------------------------------- */
export default function TutorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const dispatch = useAppDispatch();
  const tutorProfile = useAppSelector((s) => s.profile.tutorProfile);

  const [classes, setClasses] = useState<TutorClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch backend classes
  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await getTutorRegularClasses();

      if (res.success) {
        const formatted: TutorClass[] = (res.data || []).map((c: any) => {
          const next = c.nextSession;

          return {
            id: c.regularClassId,
            studentName: c.student?.name || c.studentName || "Student",
            subject: c.subject,
            date: next
              ? new Date(next.startDateTime).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            time: next
              ? new Date(next.startDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "00:00",

            status: c.scheduleStatus === "scheduled" ? "scheduled" : "confirmed",
            type: "regular",

            meetingLink: next?.meetingLink || undefined,

            nextSession: next
              ? {
                  startDateTime: next.startDateTime,
                  meetingLink: next.meetingLink,
                  canJoin: next.canJoin,
                }
              : undefined,
          };
        });

        setClasses(formatted);
      }
    } catch (e) {
      console.log("Error loading classes", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile + classes on load
  useEffect(() => {
    dispatch(fetchUserProfile());
    loadClasses();
  }, []);

  const displayName = tutorProfile?.name || "Tutor";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={4}
        userRole={(user?.role as "student" | "tutor" | "admin") || "tutor"}
        userName={displayName}
        onLogout={logout}
      />

      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Topbar
          title={displayName}
          subtitle="Manage your classes, earnings & verification"
          greeting
          action={
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard/tutor/availability">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-semibold"
                  size="sm"
                >
                  Availability
                </Button>
              </Link>

              <Link href="/dashboard/tutor/book">
                <Button
                  className="bg-primary hover:bg-primary/90 text-text font-semibold"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Create Class</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </Link>

              <Link href="/wallet">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-semibold"
                  size="sm"
                >
                  <Wallet className="w-4 h-4 mr-1.5" />
                  Withdraw
                </Button>
              </Link>
            </div>
          }
        />

        {/* Body */}
        <main className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
          <KpiSection />
          <RatingsFeedbackWidget />

          <div className="grid gap-6 lg:grid-cols-3">
           <MyClassesSection classes={classes.slice(0, 3)} />
            <QuickActionsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
