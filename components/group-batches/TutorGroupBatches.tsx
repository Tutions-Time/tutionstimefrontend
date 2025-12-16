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
import { getCreateOptions, getMyBatches } from "@/services/groupBatchService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, IndianRupee, Link as LinkIcon } from "lucide-react";

import GroupSessionsModal from "@/components/group-batches/GroupSessionsModal";
import TutorBatchDetailModal from "@/components/group-batches/TutorBatchDetailModal";
import EditBatchModal from "@/components/group-batches/EditBatchModal";

export default function TutorGroupBatches() {
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

  const [list, setList] = useState<any[]>([]);
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

  // Detail Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batch, setBatch] = useState<any | null>(null);
  const [roster, setRoster] = useState<any[]>([]);

  // Sessions Modal
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editOptions, setEditOptions] = useState<any>({ subjects: [], levels: [], availabilityDates: [], batchTypes: ["revision", "exam"], scheduleTypes: ["fixed"] });

  // ----------------------------
  // Fetch List
  // ----------------------------
  const load = async () => {
    try {
      const data = await getMyBatches();
      setList(data || []);
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
          scheduleTypes: data?.scheduleTypes || ["recurring"],
          monthlyRate: data?.monthlyRate || 0,
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

  const create = async () => {
    try {
      const res = await api.post("/group-batches/create", form);
      if (res.data?.success) {
        toast.success("Batch created");
        setForm({ subject: "", level: "", batchType: "revision", startDate: "", classStartTime: "18:00", seatCap: 10, description: "", published: true });
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

  const openEdit = async (id: string) => {
    try {
      setSelectedId(id);
      const b = await api.get(`/group-batches/${id}`);
      const opts = await getCreateOptions();
      setBatch(b.data?.data || null);
      setEditOptions({
        subjects: opts?.subjects || [],
        levels: opts?.levels || [],
        availabilityDates: opts?.availabilityDates || [],
        batchTypes: opts?.batchTypes || ["revision", "exam"],
        scheduleTypes: opts?.scheduleTypes || ["fixed"],
      });
      setEditOpen(true);
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
            <DialogTitle>Create Batchhh</DialogTitle>
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

            {/* Start Date */}
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
              <label className="text-sm font-medium text-gray-700">Price Per Month (₹)</label>
              <input 
                type="number" 
                className="border p-2 rounded w-full bg-gray-100" 
                value={options.monthlyRate} 
                readOnly 
              />
              <p className="text-xs text-gray-500">Based on your profile monthly rate.</p>
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
<h2 className="font-medium text-base">My Batches</h2>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
  {list.map((b: any) => (
    <Card
      key={b._id}
      className="p-3 bg-white shadow-sm hover:shadow-md transition w-full flex flex-col rounded-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold">{b.subject}</span>
            {b.level && <Badge variant="secondary" className="text-[10px] px-2 py-0">{b.level}</Badge>}
          </div>
          <div className="text-xs text-gray-500">Batch • {b.batchType}</div>
        </div>

        <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0">
          {b.status}
        </Badge>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {b.scheduleType === "recurring" ? "Recurring" : `${b.fixedDates?.length ?? 0} dates`}
        </div>

        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Seats {b.liveSeats}/{b.seatCap}
        </div>

        <div className="flex items-center gap-1">
          <IndianRupee className="w-3 h-3" />
          {b.pricePerStudent}/mo
        </div>
      </div>

      {/* Small Buttons */}
      <div className="mt-3 flex flex-wrap gap-1 w-full">
        <Button
          className="h-8 px-3 text-xs flex-1 sm:flex-none"
          onClick={() => openDetail(b._id)}
        >
          Details
        </Button>

        <Button
          variant="secondary"
          className="h-8 px-3 text-xs flex-1 sm:flex-none"
          onClick={() => openSessions(b._id)}
        >
          Sessions
        </Button>

        <Button
          variant="secondary"
          className="h-8 px-3 text-xs flex-1 sm:flex-none"
          onClick={() => openEdit(b._id)}
        >
          Edit
        </Button>

        <Button
          variant="destructive"
          className="h-8 px-3 text-xs flex-1 sm:flex-none"
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

      <EditBatchModal
        open={editOpen}
        onOpenChange={setEditOpen}
        batch={batch}
        options={editOptions}
        onSubmit={async (payload) => {
          if (!selectedId) return;
          try {
            await api.patch(`/group-batches/${selectedId}/edit`, payload);
            toast.success("Batch updated");
            setEditOpen(false);
            await load();
          } catch {
            toast.error("Failed to update");
          }
        }}
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
