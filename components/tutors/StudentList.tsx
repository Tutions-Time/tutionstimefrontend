"use client";

import { Dispatch, SetStateAction } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StudentCard from "./StudentCard";

type QueryMap = Record<string, string>;

type SortOption = {
  value: string;
  label: string;
};

interface StudentListProps {
  students: any[];
  loading: boolean;
  total: number;
  filter: QueryMap;
  setFilter: Dispatch<SetStateAction<QueryMap>>;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortOptions: SortOption[];
  getImageUrl: (photoUrl?: string) => string;
}

export default function StudentList({
  students,
  loading,
  total,
  filter,
  setFilter,
  totalPages,
  onPageChange,
  sortOptions,
  getImageUrl,
}: StudentListProps) {
  const currentPage = Number(filter.page || 1);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev) => ({
      ...prev,
      sort: e.target.value,
      page: "1",
    }));
  };

  return (
    <section className="lg:col-span-9 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? "Loading students..." : `Students (${total || 0})`}
          </h2>
          <p className="text-xs text-gray-500">
            View detailed student needs and book demo sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter.sort || "createdAt_desc"}
            onChange={handleSortChange}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-700">
              No students found with current filters.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try changing city, board, class or subject filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map((student) => (
              <StudentCard
                key={student._id}
                student={student}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-3 h-3" />
              Prev
            </button>

            <p className="text-xs text-gray-500">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </p>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
