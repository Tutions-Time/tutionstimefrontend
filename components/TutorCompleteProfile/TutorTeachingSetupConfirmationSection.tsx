"use client";

import { Laptop, Wifi } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorTeachingSetupConfirmationSection() {
  const dispatch = useAppDispatch();
  const hasRequiredTeachingSetup = useAppSelector(
    (s) => s.tutorProfile.hasRequiredTeachingSetup
  );

  return (
    <section className="rounded-2xl border-2 border-primary/70 bg-primary/10 p-5 shadow-sm ring-1 ring-primary/20 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-black shadow-sm">
          <Laptop className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="text-base font-bold text-gray-950 sm:text-lg">
              Online teaching setup requirement
            </div>
            <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
              Please read this carefully before submitting your tutor profile.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-white px-4 py-3">
              <Laptop className="h-5 w-5 shrink-0 text-gray-900" />
              <div className="text-sm font-semibold text-gray-900">
                Working laptop or tablet
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-white px-4 py-3">
              <Wifi className="h-5 w-5 shrink-0 text-gray-900" />
              <div className="text-sm font-semibold text-gray-900">
                High-speed internet connection
              </div>
            </div>
          </div>

          <label
            htmlFor="teachingSetupConfirm"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-300 bg-white p-4 text-sm font-semibold leading-6 text-gray-900 shadow-sm"
          >
            <input
              type="checkbox"
              id="teachingSetupConfirm"
              checked={hasRequiredTeachingSetup}
              onChange={(e) =>
                dispatch(
                  setField({
                    key: "hasRequiredTeachingSetup",
                    value: e.target.checked,
                  })
                )
              }
              className="mt-1 h-5 w-5 shrink-0 accent-primary"
            />
            <span>
              I confirm that I have a working laptop or tablet and a high-speed internet connection required to teach online classes on tuitionstime.
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
