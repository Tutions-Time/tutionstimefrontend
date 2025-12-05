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
  const [form, setForm] = useState<any>({
    fixedDates: [],
    classStartTime: "18:00",
    seatCap: 10,
    pricePerStudent: 500,
    description: "",
    published: false,
    accessWindow: { joinBeforeMin: 5, expireAfterMin: 5 },
  });

  useEffect(() => {
    if (!batch) return;
    const startTime = "18:00";
    setForm({
      fixedDates: batch.fixedDates || [],
      classStartTime: startTime,
      seatCap: batch.seatCap || 10,
      pricePerStudent: batch.pricePerStudent || 500,
      description: batch.description || "",
      published: !!batch.published,
      accessWindow: {
        joinBeforeMin: batch.accessWindow?.joinBeforeMin ?? 5,
        expireAfterMin: batch.accessWindow?.expireAfterMin ?? 5,
      },
    });
  }, [batch]);

  const toggleDate = (iso: string) => {
    const exists = form.fixedDates.some((d: string | Date) => new Date(d).toISOString() === new Date(iso).toISOString());
    const next = exists
      ? form.fixedDates.filter((d: string | Date) => new Date(d).toISOString() !== new Date(iso).toISOString())
      : [...form.fixedDates, new Date(iso).toISOString()];
    setForm({ ...form, fixedDates: next });
  };

  const onSave = async () => {
    const payload = {
      fixedDates: form.fixedDates,
      seatCap: Number(form.seatCap),
      pricePerStudent: Number(form.pricePerStudent),
      description: String(form.description || ""),
      published: !!form.published,
      accessWindow: {
        joinBeforeMin: Number(form.accessWindow?.joinBeforeMin ?? 5),
        expireAfterMin: Number(form.accessWindow?.expireAfterMin ?? 5),
      },
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Batch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Class start time</label>
            <input
              type="time"
              value={form.classStartTime}
              onChange={(e) => setForm({ ...form, classStartTime: e.target.value })}
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm">Select dates from availability</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border p-2 rounded">
              {(options.availabilityDates || []).map((d: string) => {
                const checked = form.fixedDates.some((x: string | Date) => new Date(x).toDateString() === new Date(d).toDateString());
                return (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={checked} onChange={() => toggleDate(d)} />
                    <span>{new Date(d).toLocaleDateString()}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm">Seat cap</label>
              <input
                type="number"
                value={form.seatCap}
                onChange={(e) => setForm({ ...form, seatCap: Number(e.target.value) })}
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
                onChange={(e) => setForm({ ...form, pricePerStudent: Number(e.target.value) })}
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
                  accessWindow: { ...form.accessWindow, joinBeforeMin: Number(e.target.value) },
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
                  accessWindow: { ...form.accessWindow, expireAfterMin: Number(e.target.value) },
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
