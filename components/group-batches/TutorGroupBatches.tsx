"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [dateInput, setDateInput] = useState("");
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
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);

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

  useEffect(() => { load(); }, []);

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

  const toggleFixedDate = (d: string) => {
    const cur = Array.isArray(form.fixedDates) ? form.fixedDates : [];
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
      if (res.data?.success) { toast.success("Cancelled"); load(); } else { toast.error("Failed"); }
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const reschedule = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/reschedule`, {});
      if (res.data?.success) { toast.success("Rescheduled"); load(); } else { toast.error("Failed"); }
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const openDetail = async (id: string) => {
    try {
      setSelectedId(id);
      setDetailOpen(true);
      const b = await api.get(`/group-batches/${id}`);
      setBatch(b.data?.data || null);
      const r = await api.get(`/group-batches/${id}/roster`);
      setRoster(r.data?.data || []);
    } catch (e: any) { toast.error(e.message || "Unable to load batch"); }
  };

  const openSessions = async (id: string) => {
    try {
      setSelectedId(id);
      setSessionsModalOpen(true);
      const s = await api.get(`/group-batches/${id}/sessions`);
      setSessions(s.data?.data || []);
      const b = await api.get(`/group-batches/${id}`);
      setBatch(b.data?.data || null);
    } catch (e: any) {
      toast.error(e.message || "Unable to load sessions");
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      const url = res.data?.url;
      if (url) window.open(url, "_blank");
    } catch (e: any) { toast.error(e.message || "Join failed"); }
  };

  const generateSessions = async () => {
    try {
      if (!selectedId) return;
      const res = await api.post(`/group-batches/${selectedId}/sessions/generate`);
      if (res.data?.success) {
        const s = await api.get(`/group-batches/${selectedId}/sessions`);
        setSessions(s.data?.data || []);
        toast.success("Sessions generated");
      } else { toast.error("Generation failed"); }
    } catch (e: any) { toast.error(e.message || "Generation failed"); }
  };

  const onUpload = async (
    sessionId: string,
    kind: "recording" | "notes" | "assignment",
    file: File
  ) => {
    try {
      const form = new FormData();
      form.append(kind, file);
      const endpoint =
        kind === "recording"
          ? "upload-recording"
          : kind === "notes"
          ? "upload-notes"
          : "upload-assignment";
      const res = await api.post(
        `/sessions/${sessionId}/${endpoint}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.success) {
        if (selectedId) {
          const s = await api.get(`/group-batches/${selectedId}/sessions`);
          setSessions(s.data?.data || []);
        }
        toast.success("Uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        {/* <DialogTrigger asChild>
          <Button>Create Batch</Button>
        </DialogTrigger> */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <select className="border p-2 rounded w-full" value={form.subject} onChange={(e)=> setForm({ ...form, subject: e.target.value })}>
              <option value="">Select Subject</option>
              {(options.subjects || []).map((s: string) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <select className="border p-2 rounded w-full" value={form.level} onChange={(e)=> setForm({ ...form, level: e.target.value })}>
              <option value="">Select Level</option>
              {(options.levels || []).map((l: string) => (<option key={l} value={l}>{l}</option>))}
            </select>
            <select className="border p-2 rounded w-full" value={form.batchType} onChange={(e)=> setForm({ ...form, batchType: e.target.value })}>
              {(options.batchTypes || ["revision","exam"]).map((t: string)=> (<option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>))}
            </select>
            <div className="space-y-2">
              <div className="text-sm">Select from your availability ({(options.availabilityDates || []).length} options)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border p-2 rounded">
                {(options.availabilityDates || []).map((d: string) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={(form.fixedDates || []).includes(d)} onChange={() => toggleFixedDate(d)} />
                    <span>{new Date(d).toLocaleString()}</span>
                  </label>
                ))}
              </div>
              <div className="text-sm">Selected: {(form.fixedDates || []).length}</div>
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
              <input type="checkbox" checked={form.published} onChange={(e)=> setForm({ ...form, published: e.target.checked })} />
              <span>Published</span>
            </div>
            <div className="flex justify-end">
              <Button onClick={create} disabled={loadingOptions}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <h2 className="font-medium">My Batches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((b:any)=> (
          <Card key={b._id} className="p-4 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{b.subject}</span>
                  {b.level && <Badge variant="secondary">{b.level}</Badge>}
                </div>
                <div className="text-xs text-gray-500">Batch • {b.batchType}</div>
              </div>
              <Badge className="bg-green-100 text-green-700">{b.status}</Badge>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {Array.isArray(b.fixedDates) ? `${b.fixedDates.length} dates` : "0 dates"}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Seats {b.liveSeats}/{b.seatCap}</div>
              <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4" /> {b.pricePerStudent}</div>
              {b.meetingLink && (
                <div className="flex items-center gap-2 truncate">
                  <LinkIcon className="w-4 h-4" /> <a className="text-blue-600 truncate" href={b.meetingLink} target="_blank" rel="noreferrer">{b.meetingLink}</a>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="bg-blue-600 text-white" onClick={() => openDetail(b._id)}>Details</Button>
              <Button variant="secondary" onClick={() => openSessions(b._id)}>Sessions</Button>
              <Button variant="secondary" onClick={() => reschedule(b._id)}>Reschedule</Button>
              <Button variant="destructive" onClick={() => cancel(b._id)}>Cancel</Button>
            </div>
          </Card>
        ))}
      </div>

      <TutorBatchDetailModal open={detailOpen} onOpenChange={setDetailOpen} batch={batch} roster={roster} />

      <GroupSessionsModal
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        sessions={sessions}
        loading={false}
        onJoin={(id) => joinSession(id)}
        getSessionJoinData={getSessionJoinData}
        title="Sessions"
        allowUpload
        onUpload={onUpload}
      />

      {/* Helper: generate sessions when none */}
      {sessionsModalOpen && sessions.length === 0 && selectedId && (
        <div className="flex justify-center">
          <Button size="sm" onClick={generateSessions}>Generate Sessions</Button>
        </div>
      )}
    </div>
  );
}
