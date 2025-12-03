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

export default function TutorGroupBatchesPage() {
  const enabled =
    String(
      process.env.NEXT_PUBLIC_FEATURE_GROUP_BATCHES || "false"
    ).toLowerCase() === "true";
  const [form, setForm] = useState<any>({
    subject: "",
    level: "",
    batchType: "revision",
    fixedDates: [],
    seatCap: 10,
    pricePerStudent: 500,
    description: "",
    published: true,
  });
  const [list, setList] = useState<any[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any>({
    subjects: [],
    levels: [],
    availabilityDates: [],
    batchTypes: ["revision", "exam"],
    scheduleTypes: ["fixed"],
  });
  const [loadingOptions, setLoadingOptions] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/group-batches/list");
      setList(res.data?.data || []);
    } catch (e: any) {}
  };

  useEffect(() => {
    load();
  }, []);

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
          scheduleTypes: data?.scheduleTypes || ["fixed"],
        });
      } catch (e: any) {
        toast.error(e.message || "Unable to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [open]);

  const addDate = () => {
    if (!dateInput) return;
    if (!(options.availabilityDates || []).includes(dateInput)) {
      toast.error("Select date from availability list");
      return;
    }
    setForm({ ...form, fixedDates: [...(form.fixedDates || []), dateInput] });
    setDateInput("");
  };

  const toggleFixedDate = (d: string) => {
    const cur = Array.isArray(form.fixedDates) ? form.fixedDates : [];
    const next = cur.includes(d)
      ? cur.filter((x: string) => x !== d)
      : [...cur, d];
    setForm({ ...form, fixedDates: next });
  };

  const create = async () => {
    try {
      const res = await api.post("/group-batches/create", form);
      if (res.data?.success) {
        toast.success("Batch created");
        setForm({
          subject: "",
          level: "",
          batchType: "revision",
          fixedDates: [],
          seatCap: 10,
          pricePerStudent: 500,
          description: "",
          published: true,
        });
        setOpen(false);
        load();
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

  const cancel = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/cancel`);
      if (res.data?.success) {
        toast.success("Cancelled");
        load();
      } else {
        toast.error("Failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const reschedule = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/reschedule`, {});
      if (res.data?.success) {
        toast.success("Rescheduled");
        load();
      } else {
        toast.error("Failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed");
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Batch</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
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
                  {
                    <div className="space-y-2">
                      <div className="text-sm">
                        Select from your availability (
                        {(options.availabilityDates || []).length} options)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border p-2 rounded">
                        {(options.availabilityDates || []).map((d: string) => (
                          <label
                            key={d}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={(form.fixedDates || []).includes(d)}
                              onChange={() => toggleFixedDate(d)}
                            />
                            <span>{new Date(d).toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                      <div className="text-sm">
                        Selected: {(form.fixedDates || []).length}
                      </div>
                    </div>
                  }
                  {/* Seat Cap */}
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

                  {/* Price Per Student */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Price Per Student (₹)
                    </label>
                    <input
                      type="number"
                      className="border p-2 rounded w-full"
                      placeholder="Enter price "
                      value={form.pricePerStudent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pricePerStudent: e.target.value,
                        })
                      }
                    />
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
        <main className="p-4 lg:p-6 space-y-6">
          <h2 className="font-medium">My Batches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((b: any) => (
              <Card
                key={b._id}
                className="p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{b.subject}</span>
                      {b.level && <Badge variant="secondary">{b.level}</Badge>}
                    </div>
                    <div className="text-xs text-gray-500">
                      Batch • {b.batchType}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {b.status}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />{" "}
                    {Array.isArray(b.fixedDates)
                      ? `${b.fixedDates.length} dates`
                      : "0 dates"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Seats {b.liveSeats}/
                    {b.seatCap}
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> {b.pricePerStudent}
                  </div>
                  {b.meetingLink && (
                    <div className="flex items-center gap-2 truncate">
                      <LinkIcon className="w-4 h-4" />{" "}
                      <a
                        className="text-blue-600 truncate"
                        href={b.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {b.meetingLink}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    className="px-3 py-2 rounded bg-blue-600 text-white"
                    href={`/dashboard/tutor/group-batches/${b._id}`}
                  >
                    View
                  </a>
                  <Button variant="secondary" onClick={() => reschedule(b._id)}>
                    Reschedule
                  </Button>
                  <Button variant="destructive" onClick={() => cancel(b._id)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
