"use client";

import { useState } from "react"; // ✅ Add this import
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const PAYMENT_OPTIONS = ["Hourly", "Monthly"] as const;

export default function PaymentPreferenceSection({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  // ✅ Fixed line: using useState directly from React import above
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelected(option);
  };

  return (
    <section
      className={cn(
        "bg-white/90 rounded-2xl border shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur p-8 transition",
        disabled && "opacity-80 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Wallet className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Payment Preference
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          How would you like to pay your tutor?
        </Label>
        <div className="flex gap-3 mt-3">
          {PAYMENT_OPTIONS.map((option) => {
            const active = selected === option;9
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "px-5 py-2 rounded-xl border text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 text-primary"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700",
                  disabled && "cursor-not-allowed opacity-70"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
