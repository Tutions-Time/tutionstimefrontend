"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import StudentBatchDetail from "@/components/group-batches/StudentBatchDetail";

export default function StudentBatchDetailPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar
          title="Batch Sessions"
          subtitle="View and join your sessions"
          actionPosition="left"
          action={
            <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          }
        />
        <main className="p-4 lg:p-6 space-y-4">
          <StudentBatchDetail />
        </main>
      </div>
    </div>
  );
}
