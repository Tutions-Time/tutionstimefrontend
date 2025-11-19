"use client";
import { Wallet, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AvailabilityPicker from "@/components/forms/AvailabilityPicker";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorRatesAvailabilitySection({
  errors,
  disabled = false, // ✅ new prop
}: {
  errors: Record<string, string>;
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
        <h2 className="text-xl font-semibold">Rates & Availability</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label>Hourly Rate (₹)</Label>
          <Input
            disabled={disabled}
            value={profile.hourlyRate}
            onChange={(e) =>
              dispatch(setField({ key: "hourlyRate", value: e.target.value }))
            }
            placeholder="e.g., 500"
            className="h-10"
          />
          {errors.hourlyRate && (
            <p className="text-rose-600 text-xs mt-1">{errors.hourlyRate}</p>
          )}
        </div>

        <div>
          <Label>Monthly Rate (₹)</Label>
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

      <Label className="flex items-center gap-2 mb-2">
        <CalendarIcon className="w-4 h-4 text-primary" /> Availability (Select
        Dates)
      </Label>

      {/* ✅ Disable the picker when editMode is off */}
      <div className={`${disabled ? "opacity-70 pointer-events-none" : ""}`}>
        <AvailabilityPicker
          value={(profile.availability as string[]) || []}
          onChange={(next) =>
            dispatch(setField({ key: "availability", value: next }))
          }
        />
      </div>
    </section>
  );
}
