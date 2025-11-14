"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { closeRegularClassModal } from "@/store/slices/regularClassSlice";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegularClassDecisionModal() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { show, tutorName, hourlyRate, monthlyRate } = useSelector(
    (state: RootState) => state.regularClass
  );

  const [showPlans, setShowPlans] = React.useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl p-6 space-y-5 shadow-xl">

        {/* Close */}
        <button
          onClick={() => dispatch(closeRegularClassModal())}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {!showPlans ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900">
              Continue with {tutorName}?
            </h2>

            <p className="text-gray-600">
              Would you like to join regular classes with this tutor?
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => setShowPlans(true)}
                className="w-full bg-[#FFD54F] text-black font-semibold py-3 rounded-full"
              >
                View Regular Class Plans
              </button>

              <button
                onClick={() => {
                  dispatch(closeRegularClassModal());
                  router.push("/dashboard/student/search");
                }}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-full"
              >
                Find Another Tutor
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900">
              Choose Your Plan
            </h2>

            <div className="space-y-4">

              <button className="w-full border p-4 rounded-xl flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-semibold">Hourly Plan</p>
                  <p className="text-sm text-gray-600">₹{hourlyRate} / hour</p>
                </div>
                <span className="font-bold bg-black text-white px-4 py-2 rounded-lg">
                  Join
                </span>
              </button>

              <button className="w-full border p-4 rounded-xl flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-semibold">Monthly Plan</p>
                  <p className="text-sm text-gray-600">₹{monthlyRate} / month</p>
                </div>
                <span className="font-bold bg-black text-white px-4 py-2 rounded-lg">
                  Join
                </span>
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
