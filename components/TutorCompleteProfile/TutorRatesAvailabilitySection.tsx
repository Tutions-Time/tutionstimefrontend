"use client";

import { Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorRatesAvailabilitySection({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.tutorProfile);

  return (
    <section
      className={`bg-white rounded-2xl shadow p-8 transition ${
        disabled ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Rates</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Hourly Rate/per student </Label>
          <Input
            disabled={disabled}
            value={profile.hourlyRate}
            onChange={(e) =>
              dispatch(setField({ key: "hourlyRate", value: e.target.value }))
            }
            placeholder="e.g., 500"
            className="h-10"
          />
        </div>

        <div>
          <Label>Monthly Rate/per student </Label>
          <Input
            disabled={disabled}
            value={profile.monthlyRate}
            onChange={(e) =>
              dispatch(setField({ key: "monthlyRate", value: e.target.value }))
            }
            placeholder="e.g., 12000"
            className="h-10"
          />
        </div>
      </div>
    </section>
  );
}
