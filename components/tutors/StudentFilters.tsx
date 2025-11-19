"use client";

import { Dispatch, SetStateAction } from "react";

type QueryMap = Record<string, string>;

interface StudentFiltersProps {
  filter: QueryMap;
  setFilter: Dispatch<SetStateAction<QueryMap>>;
  clearAllFilters: () => void;
}

export default function StudentFilters({
  filter,
  setFilter,
  clearAllFilters,
}: StudentFiltersProps) {
  const handleChange =
    (key: keyof QueryMap) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFilter((prev) => ({
        ...prev,
        [key]: value,
        page: "1", // reset page on filter change
      }));
    };

  return (
    <aside className="lg:col-span-3 space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-lg">
            Filters
          </h2>
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary-600 hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">City</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Mumbai"
            value={filter.city || ""}
            onChange={handleChange("city")}
          />
        </div>

        {/* Pincode */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Pincode</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. 400001"
            value={filter.pincode || ""}
            onChange={handleChange("pincode")}
          />
        </div>

        {/* Board */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Board</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="CBSE / ICSE / State Board"
            value={filter.board || ""}
            onChange={handleChange("board")}
          />
        </div>

        {/* Class Level */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Class / Grade
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. 8, 10, 12"
            value={filter.classLevel || ""}
            onChange={handleChange("classLevel")}
          />
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Subject
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Maths, Science"
            value={filter.subject || ""}
            onChange={handleChange("subject")}
          />
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Student Gender</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter.gender || ""}
            onChange={handleChange("gender")}
          >
            <option value="">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Availability */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Availability (YYYY-MM-DD)
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="2025-02-01,2025-02-05"
            value={filter.availability || ""}
            onChange={handleChange("availability")}
          />
          <p className="text-[11px] text-gray-400">
            Use comma for multiple dates.
          </p>
        </div>
      </div>
    </aside>
  );
}
