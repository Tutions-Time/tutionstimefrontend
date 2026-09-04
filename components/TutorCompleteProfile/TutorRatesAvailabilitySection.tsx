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

function normalizePositiveAmount(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return String(Math.max(1, Number(digitsOnly)));
}

function RateField({
  label,
  value,
  options,
  disabled,
  placeholder,
  onChange,
}: {
  label: string;
  value: string | number;
  options: number[];
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const inputValue = value == null ? "" : String(value);
  const selectValue = options.includes(Number(inputValue)) ? inputValue : "";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
        <Select disabled={disabled} value={selectValue} onValueChange={onChange}>
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            value={inputValue}
            onChange={(event) => onChange(normalizePositiveAmount(event.target.value))}
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
