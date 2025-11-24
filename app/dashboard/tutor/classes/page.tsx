"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, BookOpen } from "lucide-react";
import { getTutorRegularClasses } from "@/services/tutorService";
import { toast } from "@/hooks/use-toast";

export default function TutorRegularClasses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar + Sidebar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="tutor" />
      <Sidebar userRole="tutor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar title="Regular Classes" subtitle="Your active regular class students" />

        <main className="p-4 lg:p-6 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="text-center text-muted py-10 animate-pulse">
              Loading regular classes...
            </div>
          )}

          {/* Empty */}
          {!loading && classes.length === 0 && (
            <Card className="p-6 text-center text-muted bg-white rounded-2xl shadow-sm">
              No regular classes found.
            </Card>
          )}

          {/* Class List */}
          {!loading &&
            classes.map((c) => (
              <Card
                key={c.regularClassId}
                className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      {c.studentName}
                    </div>

                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      {c.subject}
                    </div>

                    <div className="text-gray-500 text-sm flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(c.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <Badge
                    className={`px-3 py-1 text-sm ${
                      c.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {c.status === "active" ? "Active" : c.status}
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Plan Type:</span> {c.planType}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Payment Status:</span> {c.paymentStatus}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Payout Status:</span>{" "}
                  {c.tutorPaymentStatus || (c.paymentStatus === 'paid' ? 'locked' : '—')}
                </div>
              </Card>
            ))}
        </main>
      </div>
    </div>
  );
}
