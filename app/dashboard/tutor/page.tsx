"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchUserProfile } from "@/store/slices/profileSlice";

import KpiSection from "@/components/tutors/dashboard/KpiSection";
import MyClassesSection from "@/components/tutors/dashboard/MyClassesSection";
import QuickActionsSection from "@/components/tutors/dashboard/QuickActionsSection";

/* ---------------------------------------------
   Tutor Class Type
---------------------------------------------- */
export type TutorClass = {
  id: string;
  studentName: string;
  subject: string;
  date: string;     // YYYY-MM-DD
  time: string;     // e.g. "6:00 PM"
  status: "scheduled" | "completed" | "cancelled" | "confirmed";
  type: "demo" | "regular";
};

/* ---------------------------------------------
   Mock Data (until API connected)
---------------------------------------------- */
const mockClasses: TutorClass[] = [
  {
    id: "c1",
    studentName: "Aarav Sharma",
    subject: "Physics",
    date: "2025-10-14",
    time: "6:00 PM",
    status: "scheduled",
    type: "demo",
  },
  {
    id: "c2",
    studentName: "Ishita Verma",
    subject: "Mathematics",
    date: "2025-10-12",
    time: "7:30 PM",
    status: "completed",
    type: "regular",
  },
];

/* ---------------------------------------------
   Tutor Dashboard Component
---------------------------------------------- */
export default function TutorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const dispatch = useAppDispatch();
  const tutorProfile = useAppSelector((s) => s.profile.tutorProfile);

  // Fetch tutor profile on load
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

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

      {/* Sidebar */}
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Layout */}
      <div className="lg:pl-64">
        <Topbar
          title={displayName}
          subtitle="Manage your classes, earnings & verification"
          greeting
          action={
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Availability */}
              <Link href="/dashboard/tutor/availability">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-semibold"
                  size="sm"
                >
                  Availability
                </Button>
              </Link>

              {/* Create Class */}
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
            </div>
          }
        />

        {/* Main Content */}
        <main className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
          {/* KPI Metrics */}
          <KpiSection />

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* My Classes Section */}
            <MyClassesSection classes={mockClasses} />

            {/* Quick Actions */}
            <QuickActionsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
