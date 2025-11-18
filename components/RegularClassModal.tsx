"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function RegularClassModal({
  open,
  onClose,
  hourlyRate,
  monthlyRate,
  onSelectPlan,
}: {
  open: boolean;
  onClose: () => void;
  hourlyRate: number;
  monthlyRate: number;
  onSelectPlan: (type: "hourly" | "monthly") => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Continue to Regular Classes
        </h2>

        <p className="text-gray-700 mb-4">
          Choose how you prefer to pay for your regular sessions with this tutor.
        </p>

        {/* RATES */}
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-gray-100 rounded-lg flex justify-between">
            <span className="font-medium text-gray-700">Hourly Rate</span>
            <span className="font-semibold text-gray-900">₹{hourlyRate}</span>
          </div>

          <div className="p-3 bg-gray-100 rounded-lg flex justify-between">
            <span className="font-medium text-gray-700">Monthly Rate</span>
            <span className="font-semibold text-gray-900">₹{monthlyRate}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelectPlan("hourly")}
            className="w-full bg-[#FFD54F] hover:bg-[#f3c942] text-black font-semibold py-2.5 rounded-xl"
          >
            Pay Hourly
          </button>

          <button
            onClick={() => onSelectPlan("monthly")}
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-2.5 rounded-xl"
          >
            Pay Monthly
          </button>
        </div>
      </div>
    </div>
  );
}
