"use client";

import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/store/store";
import { createBookingThunk } from "@/store/slices/bookingSlice";
// import toast from "react-hot-toast";

type Props = {
  tutorId: string;
  subject: string;
  onClose: () => void;
};

export default function BookDemoModal({ tutorId, subject, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>(); 
  const { selectedSlot } = useSelector((s: RootState) => s.availability);
  const { loading } = useSelector((s: RootState) => s.booking);

  if (!selectedSlot) return null;

  // 🔒 Mandatory 15-min demo end time
  const start = dayjs(selectedSlot.startTime);
  const end = start.add(15, "minute"); // force 15 minutes
  const dateISO = start.startOf("day").toISOString();

  const handleConfirm = async () => {
    try {
      await dispatch(
        createBookingThunk({
          tutorId,
          subject,
          date: dateISO,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          type: "demo",
          amount: 0,
        })
      ).unwrap();

      //   toast.success("Demo booked successfully!");
      onClose();
    } catch (err: any) {
      //   toast.error(typeof err === "string" ? err : "Booking failed");
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Confirm 15-minute Demo</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You’re booking a free demo with this tutor.
        </p>

        <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm">
          <div>
            <span className="text-muted-foreground">Date:</span>{" "}
            <strong>{start.format("ddd, MMM D")}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Time:</span>{" "}
            <strong>
              {start.format("hh:mm A")} – {end.format("hh:mm A")}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">Subject:</span>{" "}
            <strong>{subject}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Amount:</span>{" "}
            <strong>₹0 (Demo)</strong>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Booking…" : "Confirm Demo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
