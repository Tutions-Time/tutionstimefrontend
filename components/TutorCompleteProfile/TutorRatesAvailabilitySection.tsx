"use client";

import { Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";
import {
  HOURLY_RATE_OPTIONS,
  MONTHLY_RATE_OPTIONS,
} from "@/utils/rateOptions";

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
          <Label>Hourly Rate/per student</Label>
          <Select
            disabled={disabled}
            value={profile.hourlyRate}
            onValueChange={(value) =>
              dispatch(setField({ key: "hourlyRate", value }))
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select hourly rate" />
            </SelectTrigger>
            <SelectContent>
              {HOURLY_RATE_OPTIONS.map((rate) => (
                <SelectItem key={rate} value={String(rate)}>
                  Rs.{rate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Monthly Rate/per student</Label>
          <Select
            disabled={disabled}
            value={profile.monthlyRate}
            onValueChange={(value) =>
              dispatch(setField({ key: "monthlyRate", value }))
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select monthly rate" />
            </SelectTrigger>
            <SelectContent>
              {MONTHLY_RATE_OPTIONS.map((rate) => (
                <SelectItem key={rate} value={String(rate)}>
                  Rs.{rate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
