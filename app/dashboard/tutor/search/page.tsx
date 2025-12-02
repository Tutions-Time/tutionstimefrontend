"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { toast } from "react-hot-toast";
import { fetchStudents } from "@/services/tutorService";

import StudentFilters from "@/components/tutors/StudentFilters";
import StudentList from "@/components/tutors/StudentList";

/* ---------- Types ---------- */
type SortOption = {
  value: string;
  label: string;
};

type QueryMap = Record<string, string>;

const SORT_OPTIONS: SortOption[] = [
  { value: "createdAt_desc", label: "Newest (Recently added)" },
  { value: "createdAt_asc", label: "Oldest first" },
];

/* ---------- URL Sync Hook ---------- */
function useUrlSync(
  state: QueryMap,
  setState: React.Dispatch<React.SetStateAction<QueryMap>>
)
 {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  // Hydrate from URL
  useEffect(() => {
    const next: QueryMap = {};
    for (const key of [
      "city",
      "pincode",
      "board",
      "classLevel",
      "subject",
      "gender",
      "availability",
      "sort",
      "page",
    ]) {
      const val = params.get(key);
      if (val) next[key] = val;
    }
    if (Object.keys(next).length) setState((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push to URL whenever state changes
  useEffect(() => {
    const controller = setTimeout(() => {
      const sp = new URLSearchParams();
      Object.entries(state).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) sp.set(k, v);
      });
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 120);
    return () => clearTimeout(controller);
  }, [JSON.stringify(state), pathname, router]);
}

/* ---------- Page Component ---------- */
export default function SearchStudents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const [filter, setFilter] = useState<QueryMap>({
    city: "",
    pincode: "",
    board: "",
    classLevel: "",
    subject: "",
    gender: "",
    availability: "",
    sort: "createdAt_desc",
    page: "1",
  });

  const limit = 12;

  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useUrlSync(filter, (next) => setFilter(next));

 function getImageUrl(photoUrl?: string) {
  if (!photoUrl) return "/default-avatar.png";

  // If photoUrl is already a full URL (S3), return as-is
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }

  // Otherwise: local uploads path
  const cleaned = photoUrl
    .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");

  return `${IMAGE_BASE.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`;
}


  /* ---------- Query Builder ---------- */
  const params = useMemo(() => {
    const p: Record<string, any> = {
      page: Number(filter.page || 1),
      limit,
      sort: filter.sort || "createdAt_desc",
    };

    if (filter.city) p.city = filter.city;
    if (filter.pincode) p.pincode = filter.pincode;
    if (filter.board) p.board = filter.board;
    if (filter.classLevel) p.classLevel = filter.classLevel;
    if (filter.subject) p.subject = filter.subject;
    if (filter.gender) p.gender = filter.gender;
    if (filter.availability) p.availability = filter.availability;

    return p;
  }, [filter, limit]);

  /* ---------- Load Students ---------- */
  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetchStudents(params);
      setStudents(res?.data || []);
      setTotal(res?.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const clearAllFilters = () => {
    setFilter({
      city: "",
      pincode: "",
      board: "",
      classLevel: "",
      subject: "",
      gender: "",
      availability: "",
      sort: "createdAt_desc",
      page: "1",
    });
  };

  const totalPages = total ? Math.ceil(total / limit) : 1;

  const handlePageChange = (n: number) =>
    setFilter((f) => ({ ...f, page: String(n) }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="tutor"
      />
      <Sidebar
        userRole="tutor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Find Students"
          subtitle="View students and book demo sessions"
        />

        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filter Sidebar */}
            <StudentFilters
              filter={filter}
              setFilter={setFilter}
              clearAllFilters={clearAllFilters}
            />

            {/* Students Grid */}
            <StudentList
              students={students}
              loading={loading}
              total={total}
              filter={filter}
              setFilter={setFilter}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              sortOptions={SORT_OPTIONS}
              getImageUrl={getImageUrl}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
