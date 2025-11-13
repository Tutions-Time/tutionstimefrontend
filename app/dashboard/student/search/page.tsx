"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { toast } from "react-hot-toast";
import { fetchTutors } from "@/services/studentService";

import TutorFilters from "@/components/student/TutorFilters";
import TutorList from "@/components/student/TutorList";

/* ---------- Filter Definitions ---------- */
type PriceBucket = {
  id: string;
  label: string;
  minRate?: number;
  maxRate?: number;
};

type ExpBucket = {
  id: string;
  label: string;
  minExp?: number;
  maxExp?: number;
};

type SortOption = {
  value: string;
  label: string;
};

const PRICE_BUCKETS: PriceBucket[] = [
  { id: "p1", label: "Up to ₹200", minRate: 0, maxRate: 200 },
  { id: "p2", label: "₹201 – ₹500", minRate: 201, maxRate: 500 },
  { id: "p3", label: "₹501 – ₹1000", minRate: 501, maxRate: 1000 },
  { id: "p4", label: "Above ₹1000", minRate: 1001 },
];

const EXP_BUCKETS: ExpBucket[] = [
  { id: "e1", label: "0 – 2 years", minExp: 0, maxExp: 2 },
  { id: "e2", label: "2 – 5 years", minExp: 2, maxExp: 5 },
  { id: "e3", label: "5 – 10 years", minExp: 5, maxExp: 10 },
  { id: "e4", label: "10+ years", minExp: 10 },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "featured_desc", label: "Featured first" },
  { value: "lastLogin_desc", label: "Last Login: Recent → Old" },
  { value: "createdAt_desc", label: "Newest (Date added)" },
  { value: "experience_desc", label: "Experience: High → Low" },
  { value: "experience_asc", label: "Experience: Low → High" },
  { value: "hourlyRate_asc", label: "Rate: Low → High" },
  { value: "hourlyRate_desc", label: "Rate: High → Low" },
];

type QueryMap = Record<string, string>;

function useUrlSync(state: QueryMap, setState: (next: QueryMap) => void) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  // Hydrate
  useEffect(() => {
    const next: QueryMap = {};
    for (const key of [
      "city",
      "pincode",
      "subject",
      "classLevel",
      "board",
      "gender",
      "teachingMode",
      "tuitionType",
      "priceBucket",
      "expBucket",
      "sort",
      "page",
    ]) {
      const val = params.get(key);
      if (val) next[key] = val;
    }
    if (Object.keys(next).length) setState({ ...state, ...next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push to URL whenever state changes
  useEffect(() => {
    const controller = setTimeout(() => {
      const sp = new URLSearchParams();
      Object.entries(state).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) sp.set(k, v);
      });
      router.replace(`${pathname}?${sp.toString()}`);
    }, 120);
    return () => clearTimeout(controller);
  }, [JSON.stringify(state), pathname, router]);
}

export default function SearchTutors() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  function getImageUrl(photoUrl?: string) {
    if (!photoUrl) return "/default-avatar.png";

    const cleaned = photoUrl
      // remove any "D:/tutionstimebackend" or "D:\\tutionstimebackend" prefix
      .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
      // normalize backslashes to forward slashes
      .replace(/\\/g, "/")
      // make sure it starts at "uploads/"
      .replace(/^.*uploads\//, "uploads/");

    return `${IMAGE_BASE.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`;
  }

  // centralize filter state for URL sync
  const [filter, setFilter] = useState<QueryMap>({
    city: "",
    pincode: "",
    subject: "",
    classLevel: "",
    board: "",
    gender: "",
    teachingMode: "",
    tuitionType: "",
    priceBucket: "",
    expBucket: "",
    sort: "lastLogin_desc", // default sort
    page: "1",
  });

  const limit = 12;

  const [tutors, setTutors] = useState<any[]>([]);
  const [mode, setMode] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useUrlSync(filter, (next) => setFilter(next));

  /* ---------- Query Builder ---------- */
  const params = useMemo(() => {
    const p: Record<string, any> = {
      page: Number(filter.page || 1),
      limit,
      sort: filter.sort || "lastLogin_desc",
    };

    if (filter.city) p.city = filter.city;
    if (filter.pincode) p.pincode = filter.pincode;
    if (filter.subject) p.subject = filter.subject;
    if (filter.classLevel) p.classLevel = filter.classLevel;
    if (filter.board) p.board = filter.board;
    if (filter.gender) p.gender = filter.gender;
    if (filter.teachingMode) p.teachingMode = filter.teachingMode;
    if (filter.tuitionType) p.tuitionType = filter.tuitionType;

    if (filter.expBucket) {
      const b = EXP_BUCKETS.find((x) => x.id === filter.expBucket);
      if (b?.minExp !== undefined) p.minExp = b.minExp;
      if (b?.maxExp !== undefined) p.maxExp = b.maxExp;
    }
    if (filter.priceBucket) {
      const b = PRICE_BUCKETS.find((x) => x.id === filter.priceBucket);
      if (b?.minRate !== undefined) p.minRate = b.minRate;
      if (b?.maxRate !== undefined) p.maxRate = b.maxRate;
    }

    return p;
  }, [filter, limit]);

  /* ---------- Load Tutors ---------- */
  const loadTutors = async () => {
    try {
      setLoading(true);
      const res = await fetchTutors(params);
      setTutors(res?.data || []);
      setMode(res?.mode || "");
      setTotal(res?.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch tutors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const clearAllFilters = () => {
    setFilter({
      city: "",
      pincode: "",
      subject: "",
      classLevel: "",
      board: "",
      gender: "",
      teachingMode: "",
      tuitionType: "",
      priceBucket: "",
      expBucket: "",
      sort: "lastLogin_desc",
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
        userRole="student"
      />
      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Find Tutors"
          subtitle="Search and book your next class"
        />

        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filter Sidebar */}
            <TutorFilters
              filter={filter}
              setFilter={setFilter}
              clearAllFilters={clearAllFilters}
              priceBuckets={PRICE_BUCKETS}
              expBuckets={EXP_BUCKETS}
            />

            {/* Tutors Grid */}
            <TutorList
              tutors={tutors}
              loading={loading}
              mode={mode}
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