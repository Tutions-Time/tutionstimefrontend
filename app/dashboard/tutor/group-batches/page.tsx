"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCreateOptions } from "@/services/groupBatchService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, IndianRupee, Link as LinkIcon } from "lucide-react";
import TutorGroupBatches from "@/components/group-batches/TutorGroupBatches";

export default function TutorGroupBatchesPage() {
  const enabled =
    String(
      process.env.NEXT_PUBLIC_FEATURE_GROUP_BATCHES || "false"
    ).toLowerCase() === "true";
  const [form, setForm] = useState<any>({
    subject: "",
    level: "",
    batchType: "revision",
    startDate: "",
    classStartTime: "18:00",
    seatCap: 10,
    description: "",
    published: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any>({
    subjects: [],
    levels: [],
    availabilityDates: [],
    batchTypes: ["revision", "exam"],
    scheduleTypes: ["recurring"],
    monthlyRate: 0,
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!open) return;
      if (options.subjects?.length) return;
      try {
        setLoadingOptions(true);
        const data = await getCreateOptions();
        setOptions({
          subjects: data?.subjects || [],
          levels: data?.levels || [],
          availabilityDates: data?.availabilityDates || [],
          batchTypes: data?.batchTypes || ["revision", "exam"],
          scheduleTypes: data?.scheduleTypes || ["recurring"],
          monthlyRate: data?.monthlyRate || 0,
        });
      } catch (e: any) {
        toast.error(e.message || "Unable to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [open]);

  const create = async () => {
    try {
      const res = await api.post("/group-batches/create", form);
      if (res.data?.success) {
        toast.success("Batch created");
        setForm({
          subject: "",
          level: "",
          batchType: "revision",
          startDate: "",
          classStartTime: "18:00",
          seatCap: 10,
          description: "",
          published: true,
        });
        setOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        const errs = res.data?.errors;
        if (Array.isArray(errs) && errs.length) toast.error(errs.join(", "));
        else toast.error("Failed");
      }
    } catch (e: any) {
      const errs = e?.response?.data?.errors;
      if (Array.isArray(errs) && errs.length) toast.error(errs.join(", "));
      else toast.error(e.message || "Failed");
    }
  };

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
          title="Group Batches"
          subtitle="Create and manage your batches"
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Create Batch</Button>
              </DialogTrigger>

              {/* ⭐ FIXED RESPONSIVE + SCROLLABLE + FULL HEIGHT DIALOG */}
              <DialogContent
                className="
                  max-w-2xl w-full md:max-w-3xl 
                  bg-white rounded-xl shadow-xl 
                  max-h-[90vh] overflow-y-auto 
                  p-6 space-y-6
                "
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Create Batch
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                  <select
                    className="border p-2 rounded w-full"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                  >
                    <option value="">Select Subject</option>
                    {(options.subjects || []).map((s: string) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    className="border p-2 rounded w-full"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                  >
                    <option value="">Select Level</option>
                    {(options.levels || []).map((l: string) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>

                  <select
                    className="border p-2 rounded w-full"
                    value={form.batchType}
                    onChange={(e) =>
                      setForm({ ...form, batchType: e.target.value })
                    }
                  >
                    {(options.batchTypes || ["revision", "exam"]).map(
                      (t: string) => (
                        <option key={t} value={t}>
                          {t[0].toUpperCase() + t.slice(1)}
                        </option>
                      )
                    )}
                  </select>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <select
                      className="border p-2 rounded w-full"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    >
                      <option value="">Select Start Date</option>
                      {(options.availabilityDates || [])
                        .map((d: string) => new Date(d))
                        .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                        .map((d: Date) => {
                          const val = d.toISOString().split("T")[0]; // YYYY-MM-DD
                          return (
                            <option key={val} value={val}>
                              {d.toDateString()}
                            </option>
                          );
                        })}
                    </select>
                    <p className="text-xs text-gray-500">Select a start date from your availability. Recurring days will be auto-calculated.</p>
                    {(!options.availabilityDates || options.availabilityDates.length === 0) && (
                      <p className="text-xs text-red-500 mt-1">
                        No available dates found. Please update your <a href="/dashboard/tutor/profile" className="underline">availability in your profile</a>.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Class Start Time
                    </label>
                    <input
                      type="time"
                      className="border p-2 rounded w-full"
                      value={form.classStartTime}
                      onChange={(e) =>
                        setForm({ ...form, classStartTime: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Seat Capacity
                    </label>
                    <input
                      type="number"
                      className="border p-2 rounded w-full"
                      placeholder="Enter total seats "
                      value={form.seatCap}
                      onChange={(e) =>
                        setForm({ ...form, seatCap: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Price Per Month (₹)
                    </label>
                    <input
                      type="number"
                      className="border p-2 rounded w-full bg-gray-100"
                      value={options.monthlyRate}
                      readOnly
                    />
                    <p className="text-xs text-gray-500">Based on your profile monthly rate.</p>
                  </div>

                  <textarea
                    className="border p-2 rounded w-full"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm({ ...form, published: e.target.checked })
                      }
                    />
                    <span>Published</span>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={create} disabled={loadingOptions}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <main className="p-4 lg:p-6">
          <TutorGroupBatches key={refreshKey} />
        </main>
      </div>
    </div>
  );
}
