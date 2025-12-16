"use client";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setField } from "@/store/slices/tutorProfileSlice";

export default function TutorAgeConfirmationSection({
  error,
}: {
  error?: string;
}) {
  const dispatch = useAppDispatch();
  const isAgeConfirmed = useAppSelector(
    (s) => s.tutorProfile.isAgeConfirmed
  );

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="ageConfirm"
          checked={isAgeConfirmed}
          onChange={(e) =>
            dispatch(
              setField({
                key: "isAgeConfirmed",
                value: e.target.checked,
              })
            )
          }
          className="mt-1 h-4 w-4 accent-primary"
        />

        <label
          htmlFor="ageConfirm"
          className="text-sm text-gray-700 cursor-pointer"
        >
          I confirm that I am{" "}
          <span className="font-semibold">18 years or older</span>
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </section>
  );
}
