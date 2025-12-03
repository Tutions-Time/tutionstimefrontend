"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function TutorGroupBatchesPage() {
  const enabled = String(process.env.NEXT_PUBLIC_FEATURE_GROUP_BATCHES || "false").toLowerCase() === "true";
  const [form, setForm] = useState<any>({ subject: "", level: "", batchType: "revision", scheduleType: "fixed", fixedDates: [], seatCap: 10, pricePerStudent: 500, meetingLink: "", description: "", published: true });
  const [list, setList] = useState<any[]>([]);
  const [dateInput, setDateInput] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/group-batches/list");
      setList(res.data?.data || []);
    } catch (e: any) {}
  };

  useEffect(()=>{ if (enabled) load(); },[enabled]);

  const addDate = () => {
    if (!dateInput) return;
    setForm({ ...form, fixedDates: [ ...(form.fixedDates||[]), new Date(dateInput).toISOString() ] });
    setDateInput("");
  };

  const create = async () => {
    try {
      const res = await api.post("/group-batches/create", form);
      if (res.data?.success) {
        toast.success("Batch created");
        setForm({ subject: "", level: "", batchType: "revision", scheduleType: "fixed", fixedDates: [], seatCap: 10, pricePerStudent: 500, meetingLink: "", description: "", published: true });
        load();
      } else {
        toast.error("Failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const cancel = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/cancel`);
      if (res.data?.success) { toast.success("Cancelled"); load(); } else { toast.error("Failed"); }
    } catch (e:any) { toast.error(e.message || "Failed"); }
  };

  const reschedule = async (id: string) => {
    try {
      const res = await api.post(`/group-batches/${id}/reschedule`, { meetingLink: form.meetingLink });
      if (res.data?.success) { toast.success("Rescheduled"); load(); } else { toast.error("Failed"); }
    } catch (e:any) { toast.error(e.message || "Failed"); }
  };

  if (!enabled) return <div className="p-6">Feature disabled</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Manage Group Batches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 border rounded p-4">
          <input className="border p-2 rounded w-full" placeholder="Subject" value={form.subject} onChange={(e)=>setForm({ ...form, subject: e.target.value })} />
          <input className="border p-2 rounded w-full" placeholder="Level" value={form.level} onChange={(e)=>setForm({ ...form, level: e.target.value })} />
          <select className="border p-2 rounded w-full" value={form.batchType} onChange={(e)=>setForm({ ...form, batchType: e.target.value })}>
            <option value="revision">Revision</option>
            <option value="exam">Exam</option>
          </select>
          <select className="border p-2 rounded w-full" value={form.scheduleType} onChange={(e)=>setForm({ ...form, scheduleType: e.target.value })}>
            <option value="fixed">Fixed Dates</option>
            <option value="recurring">Recurring</option>
          </select>
          {form.scheduleType === "fixed" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input className="border p-2 rounded w-full" placeholder="YYYY-MM-DD" value={dateInput} onChange={(e)=>setDateInput(e.target.value)} />
                <button className="bg-gray-800 text-white px-3 py-2 rounded" onClick={addDate}>Add</button>
              </div>
              <div className="text-sm">{(form.fixedDates||[]).length} dates selected</div>
            </div>
          )}
          {form.scheduleType === "recurring" && (
            <div className="space-y-2">
              <input className="border p-2 rounded w-full" placeholder="Days CSV (Mon,Wed)" onChange={(e)=>setForm({ ...form, recurring: { ...(form.recurring||{}), days: e.target.value.split(',').map(s=>s.trim()) } })} />
              <input className="border p-2 rounded w-full" placeholder="Time (HH:MM)" onChange={(e)=>setForm({ ...form, recurring: { ...(form.recurring||{}), time: e.target.value } })} />
              <input className="border p-2 rounded w-full" placeholder="Start Date" onChange={(e)=>setForm({ ...form, recurring: { ...(form.recurring||{}), startDate: e.target.value } })} />
              <input className="border p-2 rounded w-full" placeholder="End Date" onChange={(e)=>setForm({ ...form, recurring: { ...(form.recurring||{}), endDate: e.target.value } })} />
            </div>
          )}
          <input className="border p-2 rounded w-full" placeholder="Seat Cap" type="number" value={form.seatCap} onChange={(e)=>setForm({ ...form, seatCap: Number(e.target.value) })} />
          <input className="border p-2 rounded w-full" placeholder="Price Per Student" type="number" value={form.pricePerStudent} onChange={(e)=>setForm({ ...form, pricePerStudent: Number(e.target.value) })} />
          <input className="border p-2 rounded w-full" placeholder="Meeting Link" value={form.meetingLink} onChange={(e)=>setForm({ ...form, meetingLink: e.target.value })} />
          <textarea className="border p-2 rounded w-full" placeholder="Description" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e)=>setForm({ ...form, published: e.target.checked })} />
            <span>Published</span>
          </div>
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={create}>Create Batch</button>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium">My Batches</h2>
          <div className="grid grid-cols-1 gap-3">
            {list.map((b:any)=> (
              <div key={b._id} className="border rounded p-3">
                <div className="font-medium">{b.subject} • {b.level}</div>
                <div className="text-sm">Seats: {b.liveSeats}/{b.seatCap}</div>
                <div className="flex gap-2 mt-2">
                  <button className="bg-gray-700 text-white px-3 py-2 rounded" onClick={()=>reschedule(b._id)}>Reschedule</button>
                  <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={()=>cancel(b._id)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

