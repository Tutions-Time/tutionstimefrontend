"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import StudentGroupBatches from "@/components/group-batches/StudentGroupBatches";

export default function GroupBatchesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Group Batches" subtitle="Find and join group online classes " />
        <main className="p-4 lg:p-6 space-y-6">
          <StudentGroupBatches />
        </main>
      </div>
    </div>
  );
}