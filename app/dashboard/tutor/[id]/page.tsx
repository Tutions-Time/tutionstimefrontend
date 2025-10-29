"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import SlotCalendar from "../../../../components/SlotCalendar";
import type { Slot } from "@/services/availability";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import BookDemoModal from "../../../../components/BookDemoModal";

export default function TutorProfilePage() {
  const { id: tutorId } = useParams<{ id: string }>();
  const [slot, setSlot] = useState<Slot | null>(null);
  const selected = useSelector((s: RootState) => s.availability.selectedSlot);
  const [openDemo, setOpenDemo] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <section className="space-y-4">
        <h3 className="text-xl font-bold">Book a 15-min Demo</h3>
        <SlotCalendar tutorId={tutorId} onSelected={setSlot} />

        <div className="pt-2">
          <Button disabled={!slot} onClick={() => setOpenDemo(true)}>
            Continue to Demo Booking
          </Button>
        </div>
      </section>

      {openDemo && (
        <BookDemoModal
          tutorId={tutorId as string}
          subject={"Math"} 
          onClose={() => setOpenDemo(false)}
        />
      )}
    </div>
  );
}
