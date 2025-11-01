"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { fetchSlotsThunk, selectSlot } from "@/store/slices/availabilitySlice";
import type { Slot } from "@/services/availability";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = { tutorId: string; onSelected?: (slot: Slot | null) => void };

export default function SlotCalendar({ tutorId, onSelected }: Props) {
  const dispatch = useDispatch();
  const { slots, selectedSlot, loading, error } = useSelector(
    (s: RootState) => s.availability
  );

  useEffect(() => {
    dispatch(fetchSlotsThunk(tutorId) as any);
  }, [dispatch, tutorId]);

  useEffect(() => {
    onSelected?.(selectedSlot);
  }, [selectedSlot, onSelected]);

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = dayjs(s.startTime).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    // sort times in each day
    for (const [, arr] of map) {
      arr.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    }
    // to stable array
    return Array.from(map.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
  }, [slots]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading available slots…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed: {error}</p>;
  }

  if (!slots.length) {
    return <p className="text-sm text-muted-foreground">No free slots available.</p>;
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, arr]) => (
        <div key={date} className="border rounded-xl p-4">
          <h4 className="font-semibold mb-3">
            {dayjs(date).format("dddd, MMM D")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {arr.map((s) => {
              const label = `${dayjs(s.startTime).format("hh:mm A")} – ${dayjs(
                s.endTime
              ).format("hh:mm A")}`;
              const active = selectedSlot?._id === s._id;
              return (
                <Button
                  key={s._id}
                  variant={active ? "default" : "outline"}
                  onClick={() => dispatch(selectSlot(s))}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      {selectedSlot && (
        <div className="text-sm text-green-700">
          Selected:{" "}
          <strong>
            {dayjs(selectedSlot.startTime).format("ddd, MMM D · hh:mm A")}
          </strong>
        </div>
      )}
    </div>
  );
}
