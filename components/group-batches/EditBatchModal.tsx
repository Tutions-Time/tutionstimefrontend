"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batch: any | null;
  options: any;
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

    setForm({
      recurringDays: batch?.recurring?.days || [],
      startDate: toInputDate(batch?.recurring?.startDate),
      endDate: toInputDate(batch?.recurring?.endDate),
      classStartTime: startTime,
      classEndTime: endTime,
      seatCap: String(batch?.seatCap ?? 10),
      pricePerStudent: String(batch?.pricePerStudent ?? 500),
      description: batch.description || "",
      published: !!batch.published,
      accessWindow: {
        joinBeforeMin: String(batch.accessWindow?.joinBeforeMin ?? 5),
        expireAfterMin: String(batch.accessWindow?.expireAfterMin ?? 5),
      },
    });
  }, [batch]);

  const onSave = async () => {
    const payload = {
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
                <input
                  type="time"
                  value={form.classStartTime}
                  onChange={(e) => setForm({ ...form, classStartTime: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Class End Time</label>
                <input
                  type="time"
                  value={form.classEndTime}
                  onChange={(e) => setForm({ ...form, classEndTime: e.target.value })}
                  className="border rounded p-2 w-full"
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
