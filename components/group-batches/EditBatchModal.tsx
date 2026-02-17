"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TimePicker from "./TimePicker";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batch: any | null;
  options: {
    subjects?: string[];
    levels?: string[];
    boards?: string[];
    batchTypes?: string[];
    scheduleTypes?: string[];
  };
  onSubmit: (payload: any) => Promise<void>;
};

export default function EditBatchModal({ open, onOpenChange, batch, options, onSubmit }: Props) {
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const toInputDate = (val?: string | Date | null) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };
  const toNumber = (val: any, fallback: number) => {
    if (val === "" || val === null || val === undefined) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };
  const [form, setForm] = useState<any>({
    subject: "",
    board: "",
    boardOther: "",
    level: "",
    batchType: "",
    recurringDays: [],
    startDate: "",
    endDate: "",
    classStartTime: "18:00",
    classEndTime: "19:00",
    seatCap: "10",
    pricePerStudent: "500",
    description: "",
    published: false,
    accessWindow: { joinBeforeMin: "5", expireAfterMin: "5" },
  });

  useEffect(() => {
    if (!batch) return;
    const startTime = batch?.recurring?.time || "18:00";
    const endTime = batch?.recurring?.endTime || "19:00";
    const boards = options?.boards || [];
    const currentBoard = String(batch?.board || "");
    const isKnownBoard = boards.includes(currentBoard);
    const board = isKnownBoard ? currentBoard : (currentBoard ? "Other" : "");
    const boardOther = isKnownBoard ? "" : currentBoard;

    setForm({
      subject: String(batch.subject || ""),
      board,
      boardOther,
      level: String(batch.level || ""),
      batchType: String(batch.batchType || ""),
      recurringDays: batch?.recurring?.days || [],
      startDate: toInputDate(batch?.recurring?.startDate),
      endDate: toInputDate(batch?.recurring?.endDate),
      classStartTime: startTime,
      classEndTime: endTime,
      seatCap: String(batch?.seatCap ?? 10),
      pricePerStudent:
        batch?.pricePerStudent !== undefined && batch?.pricePerStudent !== null
          ? String(batch.pricePerStudent)
          : "500",
      description: batch.description || "",
      published: !!batch.published,
      accessWindow: {
        joinBeforeMin: String(batch.accessWindow?.joinBeforeMin ?? 5),
        expireAfterMin: String(batch.accessWindow?.expireAfterMin ?? 5),
      },
    });
  }, [batch, options?.boards]);

  const onSave = async () => {
    const resolvedBatchType =
      String(form.batchType || "") ||
      (options?.batchTypes && options.batchTypes.length ? String(options.batchTypes[0]) : "revision");
    const payload = {
      subject: String(form.subject || ""),
      board: form.board === "Other" ? String(form.boardOther || "") : String(form.board || ""),
      level: String(form.level || ""),
      batchType: resolvedBatchType,
      startDate: form.startDate,
      endDate: form.endDate,
      recurringDays: form.recurringDays,
      classStartTime: form.classStartTime,
      classEndTime: form.classEndTime,
      seatCap: toNumber(form.seatCap, 10),
      pricePerStudent: toNumber(form.pricePerStudent, 500),
      description: String(form.description || ""),
      published: !!form.published,
      accessWindow: {
        joinBeforeMin: toNumber(form.accessWindow?.joinBeforeMin, 5),
        expireAfterMin: toNumber(form.accessWindow?.expireAfterMin, 5),
      },
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-2xl w-full 
          rounded-2xl
          max-h-[90vh] 
          overflow-hidden
        "
      >
        <DialogHeader>
          <DialogTitle>Edit Batch</DialogTitle>
        </DialogHeader>

        {/* Scrollable wrapper */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">

          {/* Core fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm">Subject</label>
              <select
                className="border rounded p-2 w-full"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">Select subject</option>
                {(options.subjects || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                {form.subject && !(options.subjects || []).includes(form.subject) && (
                  <option value={form.subject}>{form.subject}</option>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Level</label>
              <select
                className="border rounded p-2 w-full"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                <option value="">Select level</option>
                {(options.levels || []).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
                {form.level && !(options.levels || []).includes(form.level) && (
                  <option value={form.level}>{form.level}</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm">Board</label>
              <select
                className="border rounded p-2 w-full"
                value={form.board}
                onChange={(e) =>
                  setForm({
                    ...form,
                    board: e.target.value,
                    boardOther: e.target.value === "Other" ? form.boardOther : "",
                  })
                }
              >
                <option value="">Select board</option>
                {(options.boards || []).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {form.board === "Other" && (
                <input
                  type="text"
                  className="border rounded p-2 w-full"
                  placeholder="Enter board name"
                  value={form.boardOther}
                  onChange={(e) => setForm({ ...form, boardOther: e.target.value })}
                />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm">Batch Type</label>
              <select
                className="border rounded p-2 w-full"
                value={form.batchType}
                onChange={(e) => setForm({ ...form, batchType: e.target.value })}
              >
                {(options.batchTypes || []).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                {form.batchType && !(options.batchTypes || []).includes(form.batchType) && (
                  <option value={form.batchType}>{form.batchType}</option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Weekdays</label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => {
                  const active = (form.recurringDays || []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? form.recurringDays.filter((d: string) => d !== day)
                          : [...(form.recurringDays || []), day];
                        setForm({ ...form, recurringDays: next });
                      }}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        active
                          ? "bg-[#FFD54F]/30 border-[#FFD54F] text-gray-900"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm">Class Start Time</label>
                <TimePicker
                  value={form.classStartTime}
                  onChange={(v) => setForm({ ...form, classStartTime: v })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Class End Time</label>
                <TimePicker
                  value={form.classEndTime}
                  onChange={(v) => setForm({ ...form, classEndTime: v })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm">Seat cap</label>
              <input
                type="number"
                value={form.seatCap}
                onChange={(e) =>
                  setForm({ ...form, seatCap: e.target.value === "" ? "" : e.target.value })
                }
                className="border rounded p-2 w-full"
                min={2}
                max={200}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Price per student</label>
              <input
                type="number"
                value={form.pricePerStudent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricePerStudent: e.target.value === "" ? "" : e.target.value,
                  })
                }
                className="border rounded p-2 w-full"
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Join before (min)</label>
            <input
              type="number"
              value={form.accessWindow.joinBeforeMin}
              onChange={(e) =>
                setForm({
                  ...form,
                  accessWindow: {
                    ...form.accessWindow,
                    joinBeforeMin: e.target.value === "" ? "" : e.target.value,
                  },
                })
              }
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Expire after (min)</label>
            <input
              type="number"
              value={form.accessWindow.expireAfterMin}
              onChange={(e) =>
                setForm({
                  ...form,
                  accessWindow: {
                    ...form.accessWindow,
                    expireAfterMin: e.target.value === "" ? "" : e.target.value,
                  },
                })
              }
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border rounded p-2 w-full"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <span className="text-sm">Published</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 pb-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={onSave}>Save</Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
