"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import TutorGroupBatches from "@/components/group-batches/TutorGroupBatches";

export default function TutorGroupBatchesPage() {
  const { toast } = useToast();
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [form, setForm] = useState<any>({
    subject: "",
    board: "",
    level: "",
    batchType: "revision",
    startDate: "",
    endDate: "",
    recurringDays: [],
    seatCap: 10,
    pricePerMonth: "",
    description: "",
    published: true,
  });
  const [classStartTime, setClassStartTime] = useState("");
  const [classEndTime, setClassEndTime] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any>({
    subjects: [],
    levels: [],
    boards: [],
    availabilityDates: [],
    batchTypes: ["revision", "normal class"],
    scheduleTypes: ["recurring"],
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
          boards: data?.boards || [],
          availabilityDates: data?.availabilityDates || [],
          batchTypes: data?.batchTypes || ["revision", "normal class"],
          scheduleTypes: data?.scheduleTypes || ["recurring"],
        });
      } catch (e: any) {
        toast({
          title: "Unable to load options",
          description: e?.message,
          variant: "destructive",
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [open, options.subjects?.length]);

  const validate = () => {
    const errors: string[] = [];
    if (!form.subject) errors.push("Subject is required");
    if (!form.level) errors.push("Level is required");
    if (!form.board) errors.push("Board is required");
    if (!form.startDate) errors.push("Start date is required");
    if (!form.endDate) errors.push("End date is required");
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errors.push("End date must be on or after start date");
    }
    if (!Array.isArray(form.recurringDays) || form.recurringDays.length === 0) {
      errors.push("Please select at least one weekday");
    }
    if (!classStartTime || !classEndTime)
      errors.push("Start and end times are required");
    if (form.seatCap === "" || Number(form.seatCap) < 2) errors.push("Seat capacity must be at least 2");
    if (form.pricePerMonth === "" || Number(form.pricePerMonth) <= 0) errors.push("Price per month must be greater than 0");
    return errors;
  };

  const create = async () => {
    const errors = validate();
    if (errors.length) {
      toast({
        title: "Please fix the errors",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...form,
      board: form.board,
      classStartTime: classStartTime || "",
      classEndTime: classEndTime || "",
      pricePerMonth: form.pricePerMonth === "" ? undefined : Number(form.pricePerMonth),
    };

    try {
      const res = await api.post("/group-batches/create", payload);
      if (res.data?.success) {
        toast({
          title: "Batch created",
        });
        setForm({
          subject: "",
          board: "",
          level: "",
          batchType: "revision",
          startDate: "",
          endDate: "",
          recurringDays: [],
          seatCap: 10,
          pricePerMonth: "",
          description: "",
          published: true,
        });
        setClassStartTime("");
        setClassEndTime("");
        setOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        const errs = res.data?.errors;
        if (Array.isArray(errs) && errs.length) {
          toast({
            title: "Failed",
            description: errs.join(", "),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed",
            variant: "destructive",
          });
        }
      }
    } catch (e: any) {
      const errs = e?.response?.data?.errors;
        if (Array.isArray(errs) && errs.length) {
          toast({
            title: "Validation error",
            description: errs.join("\n"),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed",
            description: e?.response?.data?.message || e.message || "Failed",
            variant: "destructive",
          });
        }
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
          subtitle="Create and manage your batches and these services only for online classes."
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Create Batch</Button>
              </DialogTrigger>

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
                    value={form.board}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        board: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Board</option>
                    {(options.boards || []).map((b: string) => (
                      <option key={b} value={b}>
                        {b}
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
                    {(options.batchTypes || ["revision", "normal class"]).map(
                      (t: string) => (
                        <option key={t} value={t}>
                          {t === "normal class" || t === "normal" || t === "exam"
                            ? "Normal Class"
                            : t[0].toUpperCase() + t.slice(1)}
                        </option>
                      )
                    )}
                  </select>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">End date must be on or after start date.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Weekdays</label>
                    <div className="flex flex-wrap gap-2">
                      {weekdays.map((day) => {
                        const active = (form.recurringDays || []).includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? form.recurringDays.filter((d: string) => d !== day)
                                : [...(form.recurringDays || []), day];
                              setForm({ ...form, recurringDays: next });
                            }}
                            className={`px-3 py-1 rounded-full text-xs border ${
                              active
                                ? "bg-[#FFD54F]/30 border-[#FFD54F] text-gray-900"
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Class Start Time
                    </label>
                    <input
                      type="time"
                      step={60}
                      className="border p-2 rounded w-full mt-1 mb-3"
                      value={classStartTime}
                      onChange={(e) => setClassStartTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Class End Time
                    </label>
                    <input
                      type="time"
                      step={60}
                      className="border p-2 rounded w-full mt-1 mb-3"
                      value={classEndTime}
                      onChange={(e) => setClassEndTime(e.target.value)}
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
                      Price Per Month
                    </label>
                    <input
                      type="number"
                      className="border p-2 rounded w-full"
                      placeholder="Enter monthly price for this batch"
                      value={form.pricePerMonth}
                      onChange={(e) =>
                        setForm({ ...form, pricePerMonth: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500">Set the monthly price for this batch.</p>
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
          <TutorGroupBatches refreshToken={refreshKey} />
        </main>
      </div>
    </div>
  );
}
