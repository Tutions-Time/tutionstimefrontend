"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { Calendar, Users, IndianRupee } from "lucide-react";

import GroupSessionsModal from "@/components/group-batches/GroupSessionsModal";
import TutorBatchDetailModal from "@/components/group-batches/TutorBatchDetailModal";
import EditBatchModal from "@/components/group-batches/EditBatchModal";

type TutorGroupBatchesProps = {
  refreshToken?: number;
};

export default function TutorGroupBatches({ refreshToken }: TutorGroupBatchesProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<any>({
    subject: "",
    board: "",
    boardOther: "",
    level: "",
    batchType: "revision",
    startDate: "",
    classStartTime: "18:00",
    seatCap: 10,
    pricePerMonth: "",
    description: "",
    published: true,
  });

  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any>({
    subjects: [],
    levels: [],
    boards: [],
    availabilityDates: [],
    batchTypes: ["revision", "normal class"],
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
  const [editOptions, setEditOptions] = useState<any>({
    subjects: [],
    levels: [],
    availabilityDates: [],
    batchTypes: ["revision", "normal class"],
    scheduleTypes: ["fixed"],
  });

  // ----------------------------
  // Fetch List
  // ----------------------------
  const load = async () => {
    try {
      const data = await getMyBatches();
      setList(data || []);
    } catch {
      // handled silently
    }
  };

  useEffect(() => {
    load();
  }, [refreshToken]);

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
          boards: data?.boards || [],
          availabilityDates: data?.availabilityDates || [],
          batchTypes: data?.batchTypes || ["revision", "normal class"],
          scheduleTypes: data?.scheduleTypes || ["recurring"],
          monthlyRate: data?.monthlyRate || 0,
        });
      } catch {
        toast({
          title: "Unable to load options",
          description: "Unable to load options",
          variant: "destructive",
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [open, options.subjects?.length]);

  // ----------------------------
  // Helpers
  // ----------------------------
  const getBatchTypeLabel = (t: string) => {
    if (t === "normal class" || t === "normal" || t === "exam") return "Normal Class";
    if (t === "revision") return "Revision";
    return t;
  };

  const create = async () => {
    const errors: string[] = [];
    if (!form.subject) errors.push("Subject is required");
    if (!form.level) errors.push("Level is required");
    if (!form.board) errors.push("Board is required");
    if (form.board === "Other" && !form.boardOther) errors.push("Board name is required");
    if (!form.startDate) errors.push("Start date is required");
    if (!form.classStartTime) errors.push("Class start time is required");
    if (form.seatCap === "" || Number(form.seatCap) < 2) errors.push("Seat capacity must be at least 2");
    if (form.pricePerMonth === "" || Number(form.pricePerMonth) <= 0) errors.push("Price per month must be greater than 0");
    if (errors.length) {
      toast({
        title: "Please fix the errors",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...form,
        board: form.board === "Other" ? form.boardOther : form.board,
      };
      const res = await api.post("/group-batches/create", payload);
      if (res.data?.success) {
        toast({
          title: "Batch created",
        });
        setForm({
          subject: "",
          board: "",
          boardOther: "",
          level: "",
          batchType: "revision",
          startDate: "",
          classStartTime: "18:00",
          seatCap: 10,
    pricePerMonth: "",
          description: "",
          published: true,
        });
        setOpen(false);
        load();
      } else {
        toast({
          title: "Failed",
          description: "Failed",
          variant: "destructive",
        });
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

  const cancel = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/cancel`);
      if (res.data?.success) {
        toast({
          title: "Cancelled",
        });
        load();
      } else {
        toast({
          title: "Failed",
          description: "Failed",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Failed",
        description: "Failed",
        variant: "destructive",
      });
    }
  };

  const reschedule = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/reschedule`);
      if (res.data?.success) {
        toast({
          title: "Rescheduled",
        });
        load();
      } else {
        toast({
          title: "Failed",
          description: "Failed",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Failed",
        description: "Failed",
        variant: "destructive",
      });
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
      toast({
        title: "Unable to load batch",
        description: "Unable to load batch",
        variant: "destructive",
      });
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
        batchTypes: opts?.batchTypes || ["revision", "normal class"],
        scheduleTypes: opts?.scheduleTypes || ["fixed"],
      });
      setEditOpen(true);
    } catch {
      toast({
        title: "Unable to load batch",
        description: "Unable to load batch",
        variant: "destructive",
      });
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
      toast({
        title: "Unable to load sessions",
        description: "Unable to load sessions",
        variant: "destructive",
      });
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      if (res.data?.url) window.open(res.data.url, "_blank");
    } catch {
      toast({
        title: "Join failed",
        description: "Join failed",
        variant: "destructive",
      });
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

      toast({
        title: "Uploaded successfully",
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Upload failed",
        variant: "destructive",
      });
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

            {/* Board */}
            <select
              className="border p-2 rounded w-full"
              value={form.board}
              onChange={(e) =>
                setForm({
                  ...form,
                  board: e.target.value,
                  boardOther: e.target.value === "Other" ? form.boardOther : "",
                })
              }
            >
              <option value="">Select Board</option>
              {(options.boards || []).map((b: string) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {form.board === "Other" && (
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="Enter board name"
                value={form.boardOther}
                onChange={(e) =>
                  setForm({ ...form, boardOther: e.target.value })
                }
              />
            )}

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
                <option key={t} value={t}>{getBatchTypeLabel(t)}</option>
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
              <input type="time" className="border p-2 rounded w-full" value={form.classStartTime} onChange={(e) => setForm({ ...form, classStartTime: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Seat Capacity</label>
              <input type="number" className="border p-2 rounded w-full" placeholder="Enter total seats " value={form.seatCap} onChange={(e) => setForm({ ...form, seatCap: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Price Per Month</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                placeholder="Enter monthly price for this batch"
                value={form.pricePerMonth}
                onChange={(e) => setForm({ ...form, pricePerMonth: e.target.value })}
              />
            </div>
            <textarea className="border p-2 rounded w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
                <div className="text-xs text-gray-500">Batch :  {getBatchTypeLabel(b.batchType)}</div>
                <div className="text-[11px] text-gray-500">
                  Board: {b.board || "General"}
                </div>
              </div>

              <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0">
                {b.status}
              </Badge>
            </div>

            {/* Info */}
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />

                {b.scheduleType === "recurring" && b.batchStartDate ? (
                  <span>
                    Starts{" "}
                    {new Date(b.batchStartDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ) : (
                  <span>{b.fixedDates?.length ?? 0} dates</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Seats {b.liveSeats}/{b.seatCap}
              </div>

              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {b.pricePerStudent}
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
            toast({
              title: "Batch updated",
            });
            setEditOpen(false);
            await load();
          } catch {
            toast({
              title: "Failed to update",
              description: "Failed to update",
              variant: "destructive",
            });
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
