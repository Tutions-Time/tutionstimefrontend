"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCreateOptions } from "@/services/groupBatchService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, IndianRupee, Link as LinkIcon } from "lucide-react";

import GroupSessionsModal from "@/components/group-batches/GroupSessionsModal";
import TutorBatchDetailModal from "@/components/group-batches/TutorBatchDetailModal";

export default function TutorGroupBatches() {
  const [form, setForm] = useState<any>({
    subject: "",
    level: "",
    batchType: "revision",
    fixedDates: [],
    classStartTime: "18:00",
    seatCap: 10,
    pricePerStudent: 500,
    description: "",
    published: true,
  });

  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any>({
    subjects: [],
    levels: [],
    availabilityDates: [],
    batchTypes: ["revision", "exam"],
    scheduleTypes: ["fixed"],
  });

  const [loadingOptions, setLoadingOptions] = useState(false);

  // Detail Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batch, setBatch] = useState<any | null>(null);
  const [roster, setRoster] = useState<any[]>([]);

  // Sessions Modal
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // ----------------------------
  // Fetch List
  // ----------------------------
  const load = async () => {
    try {
      const res = await api.get("/group-batches/list");
      setList(res.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  // ----------------------------
  // Load Creation Options
  // ----------------------------
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
      } catch {
        toast.error("Unable to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [open]);

  // ----------------------------
  // Helpers
  // ----------------------------
  const toggleFixedDate = (d: string) => {
    const cur = form.fixedDates || [];
    const next = cur.includes(d) ? cur.filter((x: string) => x !== d) : [...cur, d];
    setForm({ ...form, fixedDates: next });
  };

  const create = async () => {
    try {
      const res = await api.post("/group-batches/create", form);
      if (res.data?.success) {
        toast.success("Batch created");
        setForm({ subject: "", level: "", batchType: "revision", fixedDates: [], classStartTime: "18:00", seatCap: 10, pricePerStudent: 500, description: "", published: true });
        setOpen(false);
        load();
      } else {
        toast.error("Failed");
      }
    } catch {
      toast.error("Failed");
    }
  };

  const cancel = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/cancel`);
      if (res.data?.success) {
        toast.success("Cancelled");
        load();
      } else toast.error("Failed");
    } catch {
      toast.error("Failed");
    }
  };

  const reschedule = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/reschedule`);
      if (res.data?.success) {
        toast.success("Rescheduled");
        load();
      } else toast.error("Failed");
    } catch {
      toast.error("Failed");
    }
  };

  // ----------------------------
  // Detail Modal
  // ----------------------------
  const openDetail = async (id: string) => {
    try {
      setSelectedId(id);
      setDetailOpen(true);

      const b = await api.get(`/group-batches/${id}`);
      const r = await api.get(`/group-batches/${id}/roster`);

      setBatch(b.data?.data || null);
      setRoster(r.data?.data || []);
    } catch {
      toast.error("Unable to load batch");
    }
  };

  // ----------------------------
  // Session Logic
  // ----------------------------
  const openSessions = async (id: string) => {
    try {
      setSelectedId(id);
      setSessionsModalOpen(true);

      const s = await api.get(`/group-batches/${id}/sessions`);
      const b = await api.get(`/group-batches/${id}`);

      setSessions(s.data?.data || []);
      setBatch(b.data?.data || null);
    } catch {
      toast.error("Unable to load sessions");
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      if (res.data?.url) window.open(res.data.url, "_blank");
    } catch {
      toast.error("Join failed");
    }
  };

  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const classDurationMin = 60;
    const joinBeforeMin = batch?.accessWindow?.joinBeforeMin ?? 5;
    const expireAfterMin = batch?.accessWindow?.expireAfterMin ?? 5;

    const end = start + classDurationMin * 60 * 1000;
    const openAt = start - joinBeforeMin * 60 * 1000;
    const closeAt = end + expireAfterMin * 60 * 1000;

    const now = Date.now();

    return {
      canJoin: now >= openAt && now <= closeAt,
      isExpired: now > closeAt,
    };
  };

  const onUpload = async (
    sessionId: string,
    kind: "recording" | "notes" | "assignment",
    file: File
  ) => {
    try {
      const formData = new FormData();
      formData.append(kind, file);

      const endpoint =
        kind === "recording"
          ? "upload-recording"
          : kind === "notes"
          ? "upload-notes"
          : "upload-assignment";

      await api.post(`/sessions/${sessionId}/${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (selectedId) {
        const s = await api.get(`/group-batches/${selectedId}/sessions`);
        setSessions(s.data?.data || []);
      }

      toast.success("Uploaded successfully");
    } catch {
      toast.error("Upload failed");
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="space-y-6">
      {/* Create Batch Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Batch</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {/* Subject */}
            <select
              className="border p-2 rounded w-full"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Select Subject</option>
              {(options.subjects || []).map((s: string) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {/* Level */}
            <select
              className="border p-2 rounded w-full"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="">Select Level</option>
              {(options.levels || []).map((l: string) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            {/* Type */}
            <select
              className="border p-2 rounded w-full"
              value={form.batchType}
              onChange={(e) => setForm({ ...form, batchType: e.target.value })}
            >
              {(options.batchTypes || []).map((t: string) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* Availability */}
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                Select from your availability:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border p-2 rounded">
                {(options.availabilityDates || []).map((d: string) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.fixedDates.includes(d)}
                      onChange={() => toggleFixedDate(d)}
                    />
                    {new Date(d).toLocaleString()}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Class Start Time</label>
              <input type="time" className="border p-2 rounded w-full" value={form.classStartTime} onChange={(e)=> setForm({ ...form, classStartTime: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Seat Capacity</label>
              <input type="number" className="border p-2 rounded w-full" placeholder="Enter total seats " value={form.seatCap} onChange={(e)=> setForm({ ...form, seatCap: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Price Per Student (₹)</label>
              <input type="number" className="border p-2 rounded w-full" placeholder="Enter price " value={form.pricePerStudent} onChange={(e)=> setForm({ ...form, pricePerStudent: e.target.value })} />
            </div>
            <textarea className="border p-2 rounded w-full" placeholder="Description" value={form.description} onChange={(e)=> setForm({ ...form, description: e.target.value })} />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
              />
              Published
            </div>

            <div className="flex justify-end">
              <Button onClick={create} disabled={loadingOptions}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================= */}
      {/*     BATCH LIST CARDS          */}
      {/* ============================= */}
      <h2 className="font-medium text-lg">My Batches</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((b: any) => (
          <Card
            key={b._id}
            className="p-4 bg-white shadow-sm hover:shadow-md transition w-full flex flex-col"
          >
            {/* Header */}
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

              <Badge className="bg-green-100 text-green-700">{b.status}</Badge>
            </div>

            {/* Info */}
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {b.fixedDates?.length ?? 0} dates
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Seats {b.liveSeats}/{b.seatCap}
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                {b.pricePerStudent}
              </div>

              {b.meetingLink && (
                <div className="flex items-center gap-2 truncate">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    className="text-blue-600 truncate"
                    href={b.meetingLink}
                    target="_blank"
                  >
                    {b.meetingLink}
                  </a>
                </div>
              )}
            </div>

            {/* Responsive Buttons */}
            <div className="mt-4 flex flex-wrap gap-2 w-full">
              <Button
                className="bg-primary text-black flex-1 sm:flex-none"
                onClick={() => openDetail(b._id)}
              >
                Details
              </Button>

              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => openSessions(b._id)}
              >
                Sessions
              </Button>

              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => reschedule(b._id)}
              >
                Reschedule
              </Button>

              <Button
                variant="destructive"
                className="flex-1 sm:flex-none"
                onClick={() => cancel(b._id)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ============================= */}
      {/*     DETAIL MODAL              */}
      {/* ============================= */}
      <TutorBatchDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        batch={batch}
        roster={roster}
      />

      {/* ============================= */}
      {/*     SESSIONS MODAL            */}
      {/* ============================= */}
      <GroupSessionsModal
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        sessions={sessions}
        loading={false}
        onJoin={(id: string) => joinSession(id)}
        getSessionJoinData={(dateStr: string) => getSessionJoinData(dateStr)}
        title="Sessions"
        allowUpload
        onUpload={async (sessionId, kind, file) =>
          await onUpload(sessionId, kind, file)
        }
        allowFeedback={false}
      />
    </div>
  );
}
