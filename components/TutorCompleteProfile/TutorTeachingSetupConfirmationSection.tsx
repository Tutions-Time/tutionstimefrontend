"use client";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorTeachingSetupConfirmationSection() {
  const dispatch = useAppDispatch();
  const hasRequiredTeachingSetup = useAppSelector(
    (s) => s.tutorProfile.hasRequiredTeachingSetup
  );

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start gap-3">
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
          className="mt-1 h-4 w-4 accent-primary"
        />

        <label
          htmlFor="teachingSetupConfirm"
          className="text-sm text-gray-700 cursor-pointer"
        >
          I understand that a working{" "}
          <span className="font-semibold">laptop or tablet</span> and a{" "}
          <span className="font-semibold">high-speed internet connection</span>{" "}
          are required to teach online classes on tuitionstime.
        </label>
      </div>
    </section>
  );
}