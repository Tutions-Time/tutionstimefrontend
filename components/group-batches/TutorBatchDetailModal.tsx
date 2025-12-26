"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batch: any | null;
  roster: any[];
};

export default function TutorBatchDetailModal({ open, onOpenChange, batch, roster }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle>Batch Detail</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {batch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-3 space-y-1 text-sm">
                <div className="font-medium">Overview</div>
                <div>Subject: {batch.subject}</div>
                <div>Board: {batch.board || "General"}</div>
                <div>Level: {batch.level || "General"}</div>
                <div>
                  Type: {batch.batchType === "normal class" || batch.batchType === "normal" || batch.batchType === "exam" ? "Normal Class" : "Revision"}
                </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

