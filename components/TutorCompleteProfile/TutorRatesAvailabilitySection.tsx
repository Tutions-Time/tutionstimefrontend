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

function RateField({
  label,
  value,
  options,
  disabled,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: number[];
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <Select disabled={disabled} value={value} onValueChange={onChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((rate) => (
              <SelectItem key={rate} value={String(rate)}>
                Rs.{rate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            Rs.
          </span>
          <input
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Exact amount"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

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
        <RateField
          label="Hourly Rate/per student"
          value={profile.hourlyRate}
          options={HOURLY_RATE_OPTIONS}
          disabled={disabled}
          placeholder="Select hourly rate"
          onChange={(value) => dispatch(setField({ key: "hourlyRate", value }))}
        />

        <RateField
          label="Monthly Rate/per student"
          value={profile.monthlyRate}
          options={MONTHLY_RATE_OPTIONS}
          disabled={disabled}
          placeholder="Select monthly rate"
          onChange={(value) => dispatch(setField({ key: "monthlyRate", value }))}
        />
      </div>
    </section>
  );
}
