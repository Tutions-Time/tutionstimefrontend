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
};

export default function GroupSessionsModal({ open, onClose, sessions, loading, onJoin, getSessionJoinData, title = "Sessions" }: Props) {
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          {s.recordingUrl && (
                            <a className="text-[#207EA9] underline text-sm" href={s.recordingUrl} target="_blank">
                              Recording
                            </a>
                          )}
                        </div>
                        <div>
                          {s.notesUrl && (
                            <a className="text-[#207EA9] underline text-sm" href={s.notesUrl} target="_blank">
                              Notes
                            </a>
                          )}
                        </div>
                        <div>
                          {s.assignmentUrl && (
                            <a className="text-[#207EA9] underline text-sm" href={s.assignmentUrl} target="_blank">
                              Assignment
                            </a>
                          )}
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

