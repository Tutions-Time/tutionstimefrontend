"use client";
import { Dialog } from "@headlessui/react";

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
};

export default function GroupSessionsModal({ open, onClose, sessions, loading, onJoin, getSessionJoinData, title = "Sessions", allowUpload = false, onUpload }: Props) {
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
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
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
                        <div>{new Date(s.startDateTime).toLocaleDateString("en-IN")}</div>
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
                    {s.status === "completed" && (
                      <div className="space-y-4">
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
