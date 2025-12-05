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
    fixedDates: [],
    classStartTime: "18:00",
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batch, setBatch] = useState<any | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploading, setUploading] = useState<string | null>(null);

  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const classDurationMin = 60;
    const joinBeforeMin = batch?.accessWindow?.joinBeforeMin ?? 5;
    const expireAfterMin = batch?.accessWindow?.expireAfterMin ?? 5;
    const end = start + classDurationMin * 60 * 1000;
    const openAt = start - joinBeforeMin * 60 * 1000;
    
    const closeAt = end + expireAfterMin * 60 * 1000;
    const now = Date.now();
    const canJoin = now >= openAt && now <= closeAt;
    const isExpired = now > closeAt;
    return { canJoin, isExpired };
  };

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
          classStartTime: "18:00",
          seatCap: 10,
          pricePerStudent: 500,
          description: "",
          published: true,
        });
        setOpen(false);
        load();
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

  const openDetail = async (id: string) => {
    try {
      setSelectedId(id);
      setDetailOpen(true);
      const b = await api.get(`/group-batches/${id}`);
      setBatch(b.data?.data || null);
      const r = await api.get(`/group-batches/${id}/roster`);
      setRoster(r.data?.data || []);
      const s = await api.get(`/group-batches/${id}/sessions`);
      setSessions(s.data?.data || []);
    } catch (e: any) {
      toast.error(e.message || "Unable to load batch");
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      const url = res.data?.url;
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    }
  };

  const generateSessions = async () => {
    try {
      if (!selectedId) return;
      const res = await api.post(`/group-batches/${selectedId}/sessions/generate`);
      if (res.data?.success) {
        const s = await api.get(`/group-batches/${selectedId}/sessions`);
        setSessions(s.data?.data || []);
        toast.success("Sessions generated");
      } else {
        toast.error("Generation failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    }
  };

  const uploadFile = async (
    sessionId: string,
    kind: "recording" | "notes" | "assignment",
    file: File | null
  ) => {
    if (!file) {
      toast.error("Select file");
      return;
    }
    try {
      setUploading(`${sessionId}:${kind}`);
      const form = new FormData();
      form.append(kind, file);
      const endpoint =
        kind === "recording"
          ? "upload-recording"
          : kind === "notes"
          ? "upload-notes"
          : "upload-assignment";

      const res = await api.post(`/sessions/${sessionId}/${endpoint}`, form);
      if (res.data?.success) {
        const s = await api.get(`/group-batches/${selectedId}/sessions`);
        setSessions(s.data?.data || []);
        toast.success("Uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
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

        <main className="p-4 lg:p-6">
          <TutorGroupBatches key={refreshKey} />
        </main>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-xl rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Batch Detail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {batch && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded p-3 space-y-1 text-sm">
                    <div className="font-medium">Overview</div>
                    <div>Subject: {batch.subject}</div>
                    <div>Level: {batch.level || "General"}</div>
                    <div>Type: {batch.batchType}</div>
                    <div>Seats: {batch.liveSeats}/{batch.seatCap}</div>
                    <div>Price: ₹{batch.pricePerStudent}</div>
                    {batch.meetingLink && (
                      <a className="text-blue-600" href={batch.meetingLink} target="_blank">
                        Meeting
                      </a>
                    )}
                  </div>

                  <div className="border rounded p-3 space-y-1 text-sm">
                    <div className="font-medium">Window</div>
                    <div>Join before: {batch.accessWindow?.joinBeforeMin ?? 5} min</div>
                    <div>Expire after: {batch.accessWindow?.expireAfterMin ?? 5} min</div>
                    <div>Status: {batch.status}</div>
                    <div>Published: {batch.published ? "Yes" : "No"}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">Roster</div>
                  <ul className="space-y-1 text-sm">
                    {roster.map((s: any) => (
                      <li key={s._id}>{s.name || s._id}</li>
                    ))}
                    {roster.length === 0 && (
                      <li className="text-gray-500 text-sm">No students</li>
                    )}
                  </ul>
                </div>

                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">Dates</div>
                  <ul className="space-y-1 text-sm">
                    {(batch?.fixedDates || []).map((d: string) => (
                      <li key={d}>{new Date(d).toLocaleString()}</li>
                    ))}
                    {!(batch?.fixedDates || []).length && (
                      <li className="text-gray-500 text-sm">No dates</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="border rounded p-3 space-y-3">
                <div className="font-medium">Sessions</div>
                <ul className="space-y-3">
                  {sessions.map((s: any) => (
                    <li key={s._id} className="text-sm border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>{new Date(s.startDateTime).toLocaleString()}</div>
                        <div className="flex gap-2">
                          {(() => {
                            const { canJoin, isExpired } = getSessionJoinData(
                              s.startDateTime
                            );
                            return !isExpired && s.status !== "completed" ? (
                              <button
                                onClick={() => joinSession(s._id)}
                                disabled={!canJoin}
                                className={`px-3 py-2 rounded-lg text-sm ${
                                  canJoin
                                    ? "bg-[#FFD54F] text-black"
                                    : "bg-gray-200 text-gray-600 cursor-not-allowed"
                                }`}
                              >
                                Join Now
                              </button>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {s.status === "completed" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                          <div className="space-y-2">
                            <input
                              type="file"
                              onChange={(e) =>
                                uploadFile(
                                  s._id,
                                  "recording",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            {s.recordingUrl && (
                              <a
                                className="text-blue-600"
                                href={s.recordingUrl}
                                target="_blank"
                              >
                                Recording
                              </a>
                            )}
                          </div>

                          <div className="space-y-2">
                            <input
                              type="file"
                              onChange={(e) =>
                                uploadFile(
                                  s._id,
                                  "notes",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            {s.notesUrl && (
                              <a
                                className="text-blue-600"
                                href={s.notesUrl}
                                target="_blank"
                              >
                                Notes
                              </a>
                            )}
                          </div>

                          <div className="space-y-2">
                            <input
                              type="file"
                              onChange={(e) =>
                                uploadFile(
                                  s._id,
                                  "assignment",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            {s.assignmentUrl && (
                              <a
                                className="text-blue-600"
                                href={s.assignmentUrl}
                                target="_blank"
                              >
                                Assignment
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {uploading === `${s._id}:recording` ||
                      uploading === `${s._id}:notes` ||
                      uploading === `${s._id}:assignment` ? (
                        <div className="text-xs text-gray-500 mt-2">
                          Uploading…
                        </div>
                      ) : null}
                    </li>
                  ))}

                  {sessions.length === 0 && (
                    <li className="text-gray-500 text-sm">
                      No sessions
                      <div className="mt-2">
                        <Button size="sm" onClick={generateSessions}>
                          Generate Sessions
                        </Button>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
