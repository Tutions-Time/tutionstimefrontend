"use client";

import { Input } from "@/components/ui/input";
import clsx from "clsx";
import React from "react";

type FilterMap = Record<string, string>;

type BucketOption = {
  id: string;
  label: string;
};

type TutorFiltersProps = {
  filter: FilterMap;
  setFilter: React.Dispatch<React.SetStateAction<FilterMap>>;
  clearAllFilters: () => void;
  priceBuckets: BucketOption[];
  expBuckets: BucketOption[];
};

export default function TutorFilters({
  filter,
  setFilter,
  clearAllFilters,
  priceBuckets,
  expBuckets,
}: TutorFiltersProps) {
  return (
    <aside
      className={clsx(
        "lg:col-span-3 bg-white rounded-xl shadow-sm p-4 space-y-4 transition-all border border-gray-100",
        "lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] overflow-y-auto"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800 text-sm">Refine Search</h3>
        <button
          onClick={clearAllFilters}
          className="text-[12px] text-primary hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Basic Inputs */}
      <div className="space-y-2">
        <Input
          placeholder="City"
          value={filter.city || ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, city: e.target.value, page: "1" }))
          }
          className="h-8 text-sm rounded-full"
        />
        <Input
          placeholder="Pincode"
          value={filter.pincode || ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, pincode: e.target.value, page: "1" }))
          }
          className="h-8 text-sm rounded-full"
        />
        <Input
          placeholder="Subject"
          value={filter.subject || ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, subject: e.target.value, page: "1" }))
          }
          className="h-8 text-sm rounded-full"
        />
        <Input
          placeholder="Class"
          value={filter.classLevel || ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, classLevel: e.target.value, page: "1" }))
          }
          className="h-8 text-sm rounded-full"
        />
        <Input
          placeholder="Board"
          value={filter.board || ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, board: e.target.value, page: "1" }))
          }
          className="h-8 text-sm rounded-full"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-medium text-gray-600">Gender</label>
        <div className="mt-2 flex gap-2 text-sm flex-wrap">
          {["Male", "Female", "Any"].map((g) => (
            <button
              key={g}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  gender: g === "Any" ? "" : g,
                  page: "1",
                }))
              }
              className={clsx(
                "px-3 py-1 rounded-full border text-xs transition-all",
                (filter.gender || "") === (g === "Any" ? "" : g)
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 hover:bg-gray-100"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tuition Type */}
      {/* <div>
        <label className="text-xs font-medium text-gray-600">Tuition Type</label>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {[
            "At Student Home",
            "At Tutor Home",
            "At Institute",
            "Online",
            "Any",
          ].map((t) => (
            <button
              key={t}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  tuitionType: t === "Any" ? "" : t,
                  page: "1",
                }))
              }
              className={clsx(
                "px-3 py-1 rounded-full border transition-all",
                (filter.tuitionType || "") === (t === "Any" ? "" : t)
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 hover:bg-gray-100"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div> */}

      {/* Experience */}
      <div>
        <label className="text-xs font-medium text-gray-600">Experience</label>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {expBuckets.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                setFilter((f) => ({ ...f, expBucket: b.id, page: "1" }))
              }
              className={clsx(
                "px-3 py-1 rounded-full border transition-all",
                filter.expBucket === b.id
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 hover:bg-gray-100"
              )}
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={() =>
              setFilter((f) => ({ ...f, expBucket: "", page: "1" }))
            }
            className={clsx(
              "px-3 py-1 rounded-full border transition-all",
              filter.expBucket === ""
                ? "bg-primary text-white border-primary"
                : "border-gray-200 hover:bg-gray-100"
            )}
          >
            Any
          </button>
        </div>
      </div>

      {/* Hourly Price */}
      <div>
        <label className="text-xs font-medium text-gray-600">Hourly Price</label>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {priceBuckets.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                setFilter((f) => ({ ...f, priceBucket: b.id, page: "1" }))
            }
              className={clsx(
                "px-3 py-1 rounded-full border transition-all",
                filter.priceBucket === b.id
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 hover:bg-gray-100"
              )}
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={() =>
              setFilter((f) => ({ ...f, priceBucket: "", page: "1" }))
            }
            className={clsx(
              "px-3 py-1 rounded-full border transition-all",
              filter.priceBucket === ""
                ? "bg-primary text-white border-primary"
                : "border-gray-200 hover:bg-gray-100"
            )}
          >
            Any
          </button>
        </div>
      </div>

      {/* Teaching Mode */}
      <div>
        <label className="text-xs font-medium text-gray-600">
          Teaching Mode
        </label>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {["Online", "Offline", "Any"].map((t) => (
            <button
              key={t}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  teachingMode: t === "Any" ? "" : t,
                  page: "1",
                }))
              }
              className={clsx(
                "px-3 py-1 rounded-full border transition-all",
                (filter.teachingMode || "") === (t === "Any" ? "" : t)
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 hover:bg-gray-100"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
