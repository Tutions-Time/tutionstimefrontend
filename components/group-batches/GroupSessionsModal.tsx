"use client";
import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { submitSessionFeedback } from "@/services/progressService";

type Props = {
  open: boolean;
  onClose: () => void;
  sessions: any[];
  loading: boolean;
  onJoin: (id: string) => void;
  getSessionJoinData: (dateStr: string) => { canJoin: boolean; isExpired: boolean };
  title?: string;
  allowUpload?: boolean;
  onUpload?: (sessionId: string, kind: "recording" | "notes" | "assignment", file: File) => Promise<void>;
  allowFeedback?: boolean;
  onAfterFeedback?: () => void | Promise<void>;
};

export default function GroupSessionsModal({ open, onClose, sessions, loading, onJoin, getSessionJoinData, title = "Sessions", allowUpload = false, onUpload, allowFeedback = false, onAfterFeedback, allowReschedule = false, onRequestReschedule, pendingRequests }: Props & { allowReschedule?: boolean; onRequestReschedule?: (sessionId: string, date: string, time: string, reason?: string) => Promise<void>; pendingRequests?: Record<string, string> }) {
  const safeUrl = (u?: string) => {
    const s = String(u || "").trim();
    if (!s) return "";
    try {
      if (s.startsWith("/uploads") || s.startsWith("uploads")) return s.startsWith("/") ? s : "/" + s;
      const url = new URL(s);
      return ["http:", "https:"].includes(url.protocol) ? s : "";
    } catch {
      return "";
    }
  };
  const [feedbackState, setFeedbackState] = useState<Record<string, { teaching: number; communication: number; understanding: number; comment: string }>>({});
  const updateFeedback = (id: string, key: "teaching" | "communication" | "understanding" | "comment", value: number | string) => {
    setFeedbackState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { teaching: 5, communication: 5, understanding: 5, comment: "" }), [key]: value as any },
    }));
  };
  const submitFeedback = async (id: string) => {
    const f = feedbackState[id] || { teaching: 5, communication: 5, understanding: 5, comment: "" };
    await submitSessionFeedback(id, f);
    if (onAfterFeedback) await onAfterFeedback();
  };
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md space-y-4 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <Dialog.Title className="text-lg font-semibold sticky top-0 bg-white/95 py-1">{title}</Dialog.Title>
          {loading && <div className="text-center text-gray-500">Loading...</div>}
          {!loading && sessions.length === 0 && (
            <div className="text-center text-gray-500">No sessions found.</div>
          )}
          {!loading && sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.map((s: any) => {
                const { canJoin, isExpired } = getSessionJoinData(s.startDateTime);
                return (
                  <div key={s._id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div>{new Date(s.startDateTime).toLocaleDateString()}</div>
                        <div>{new Date(s.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div className="text-xs text-gray-500">{s.status}</div>
                      </div>
                      {!isExpired && s.status !== "completed" && (
                        <button
                          onClick={() => onJoin(s._id)}
                          disabled={!canJoin}
                          className={`px-3 py-2 rounded-lg text-sm ${canJoin ? "bg-[#FFD54F] text-black" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
                        >
                          Join Now
                        </button>
                      )}
                    </div>
                    {pendingRequests && pendingRequests[s._id] && (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        Pending reschedule: {new Date(pendingRequests[s._id]).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </div>
                    )}
                    {allowReschedule && s.status === "scheduled" && !isExpired && (
                      <RescheduleInline sessionId={s._id} onSubmit={onRequestReschedule} />
                    )}
                    {s.status === "completed" && (
                      <div className="space-y-4">
                        {/* Feedback display / form */}
                        {s.sessionFeedback ? (
                          <div className="rounded-xl border p-4 bg-white shadow-sm">
                            <div className="text-sm font-semibold mb-2">Session Feedback</div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>Teaching: {s.sessionFeedback.teaching}/5</div>
                              <div>Communication: {s.sessionFeedback.communication}/5</div>
                              <div>Understanding: {s.sessionFeedback.understanding}/5</div>
                              <div>Overall: {s.sessionFeedback.overall}/5</div>
                            </div>
                            {s.sessionFeedback.comment && (
                              <div className="mt-2 text-sm text-gray-700">{s.sessionFeedback.comment}</div>
                            )}
                          </div>
                        ) : allowFeedback ? (
                          <div className="rounded-xl border p-4 bg-white shadow-sm">
                            <div className="text-sm font-semibold mb-2">Give Feedback</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <label className="flex items-center justify-between gap-2">
                                <span>Teaching</span>
                                <select className="border rounded px-2 py-1" value={(feedbackState[s._id]?.teaching ?? 5)} onChange={(e)=>updateFeedback(s._id, "teaching", Number(e.target.value))}>
                                  {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                                </select>
                              </label>
                              <label className="flex items-center justify-between gap-2">
                                <span>Communication</span>
                                <select className="border rounded px-2 py-1" value={(feedbackState[s._id]?.communication ?? 5)} onChange={(e)=>updateFeedback(s._id, "communication", Number(e.target.value))}>
                                  {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                                </select>
                              </label>
                              <label className="flex items-center justify-between gap-2">
                                <span>Understanding</span>
                                <select className="border rounded px-2 py-1" value={(feedbackState[s._id]?.understanding ?? 5)} onChange={(e)=>updateFeedback(s._id, "understanding", Number(e.target.value))}>
                                  {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                                </select>
                              </label>
                              <div className="sm:col-span-2">
                                <textarea className="w-full border rounded px-3 py-2" placeholder="Optional comment" value={(feedbackState[s._id]?.comment ?? "")} onChange={(e)=>updateFeedback(s._id, "comment", e.target.value)} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <button onClick={()=>submitFeedback(s._id)} className="w-full py-2 px-4 rounded-xl bg-[#FFD54F] text-black text-sm font-semibold shadow hover:opacity-90 transition">Submit Feedback</button>
                            </div>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="rounded-xl border p-4 bg-white shadow-sm">
                            <div className="text-sm font-semibold mb-2">Recording</div>
                            {safeUrl(s.recordingUrl) ? (
                              <a
                                href={safeUrl(s.recordingUrl)}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#FFD54F] underline text-sm font-medium"
                              >
                                Download Recording
                              </a>
                            ) : allowUpload && onUpload ? (
                              <>
                                <button
                                  onClick={() => document.getElementById(`upload-recording-${s._id}`)?.click()}
                                  className="w-full py-2 px-4 rounded-xl bg-[#FFD54F] text-black text-sm font-semibold shadow hover:opacity-90 transition"
                                >
                                  Upload
                                </button>
                                <input
                                  id={`upload-recording-${s._id}`}
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await onUpload(s._id, "recording", file);
                                  }}
                                />
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">Not uploaded</div>
                            )}
                          </div>
                          <div className="rounded-xl border p-4 bg-white shadow-sm">
                            <div className="text-sm font-semibold mb-2">Notes</div>
                            {safeUrl(s.notesUrl) ? (
                              <a
                                href={safeUrl(s.notesUrl)}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#FFD54F] underline text-sm font-medium"
                              >
                                Download Notes
                              </a>
                            ) : allowUpload && onUpload ? (
                              <>
                                <button
                                  onClick={() => document.getElementById(`upload-notes-${s._id}`)?.click()}
                                  className="w-full py-2 px-4 rounded-xl bg-[#FFD54F] text-black text-sm font-semibold shadow hover:opacity-90 transition"
                                >
                                  Upload
                                </button>
                                <input
                                  id={`upload-notes-${s._id}`}
                                  type="file"
                                  accept="application/pdf,.doc,.docx,.txt,image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await onUpload(s._id, "notes", file);
                                  }}
                                />
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">Not uploaded</div>
                            )}
                          </div>
                          <div className="rounded-xl border p-4 bg-white shadow-sm">
                            <div className="text-sm font-semibold mb-2">Assignment</div>
                            {safeUrl(s.assignmentUrl) ? (
                              <a
                                href={safeUrl(s.assignmentUrl)}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#FFD54F] underline text-sm font-medium"
                              >
                                Download Assignment
                              </a>
                            ) : allowUpload && onUpload ? (
                              <>
                                <button
                                  onClick={() => document.getElementById(`upload-assignment-${s._id}`)?.click()}
                                  className="w-full py-2 px-4 rounded-xl bg-[#FFD54F] text-black text-sm font-semibold shadow hover:opacity-90 transition"
                                >
                                  Upload
                                </button>
                                <input
                                  id={`upload-assignment-${s._id}`}
                                  type="file"
                                  accept="application/pdf,.doc,.docx,.txt,image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await onUpload(s._id, "assignment", file);
                                  }}
                                />
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">Not uploaded</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function RescheduleInline({ sessionId, onSubmit }: { sessionId: string; onSubmit?: (sessionId: string, date: string, time: string, reason?: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("03");
  const [minute, setMinute] = useState("00");
  const [meridiem, setMeridiem] = useState<"AM" | "PM">("PM");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timeValue = () => {
    let h = Number(hour) % 12;
    if (meridiem === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };
  const submit = async () => {
    if (!onSubmit) return;
    if (!date) return;
    try {
      setSubmitting(true);
      await onSubmit(sessionId, date, timeValue(), reason || undefined);
      setOpen(false);
      setDate("");
      setHour("03");
      setMinute("00");
      setMeridiem("PM");
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="space-y-2">
      {!open ? (
        <button onClick={() => setOpen(true)} className="px-3 py-2 rounded-lg text-sm bg-gray-100">Request Reschedule</button>
      ) : (
        <div className="space-y-2 border rounded-lg p-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input type="date" className="border rounded px-2 py-1" value={date} onChange={(e)=>setDate(e.target.value)} />
            <select className="border rounded px-2 py-1" value={hour} onChange={(e)=>setHour(e.target.value)}>
              {Array.from({length:12}).map((_,i)=> {
                const val = String(i===0?12:i).padStart(2,"0");
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <select className="border rounded px-2 py-1" value={minute} onChange={(e)=>setMinute(e.target.value)}>
              {["00","15","30","45"].map(m=> <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="border rounded px-2 py-1" value={meridiem} onChange={(e)=>setMeridiem(e.target.value as "AM"|"PM")}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            <input type="text" className="border rounded px-2 py-1" placeholder="Reason (optional)" value={reason} onChange={(e)=>setReason(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={submit} disabled={!date || submitting} className="px-3 py-2 rounded-lg text-sm bg-[#FFD54F] text-black">{submitting ? "Submitting..." : "Submit"}</button>
            <button onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg text-sm bg-gray-200">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
