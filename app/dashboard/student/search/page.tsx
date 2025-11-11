"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Star, Sparkles, Clock3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { fetchTutors } from "@/services/studentService";
import clsx from "clsx";

/* ---------- Filter Definitions ---------- */
const PRICE_BUCKETS = [
  { id: "p1", label: "Up to ₹200", minRate: 0, maxRate: 200 },
  { id: "p2", label: "₹201 – ₹500", minRate: 201, maxRate: 500 },
  { id: "p3", label: "₹501 – ₹1000", minRate: 501, maxRate: 1000 },
  { id: "p4", label: "Above ₹1000", minRate: 1001 },
];

const EXP_BUCKETS = [
  { id: "e1", label: "0 – 2 years", minExp: 0, maxExp: 2 },
  { id: "e2", label: "2 – 5 years", minExp: 2, maxExp: 5 },
  { id: "e3", label: "5 – 10 years", minExp: 5, maxExp: 10 },
  { id: "e4", label: "10+ years", minExp: 10 },
];

const SORT_OPTIONS = [
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
  // Hydrate from URL on mount, push state when filters change.
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

  // Push to URL whenever state changes (debounced a bit)
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
    sort: "lastLogin_desc", // bias toward recency like HTS
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

  const SkeletonCard = () => (
    <div className="animate-pulse p-4 rounded-xl bg-white shadow-sm space-y-3">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
    </div>
  );

  const setPage = (n: number) => setFilter((f) => ({ ...f, page: String(n) }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="Find Tutors" subtitle="Search and book your next class" />

        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ============ Filter Sidebar ============ */}
            <aside
              className={clsx(
                "lg:col-span-3 bg-white rounded-xl shadow-sm p-4 space-y-4 transition-all border border-gray-100",
                "lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] overflow-y-auto"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 text-sm">Refine Search</h3>
                <button onClick={clearAllFilters} className="text-[12px] text-primary hover:underline">
                  Clear All
                </button>
              </div>

              {/* Basic Inputs */}
              <div className="space-y-2">
                <Input placeholder="City" value={filter.city} onChange={(e) => setFilter((f) => ({ ...f, city: e.target.value, page: "1" }))} className="h-8 text-sm rounded-full" />
                <Input placeholder="Pincode" value={filter.pincode} onChange={(e) => setFilter((f) => ({ ...f, pincode: e.target.value, page: "1" }))} className="h-8 text-sm rounded-full" />
                <Input placeholder="Subject" value={filter.subject} onChange={(e) => setFilter((f) => ({ ...f, subject: e.target.value, page: "1" }))} className="h-8 text-sm rounded-full" />
                <Input placeholder="Class" value={filter.classLevel} onChange={(e) => setFilter((f) => ({ ...f, classLevel: e.target.value, page: "1" }))} className="h-8 text-sm rounded-full" />
                <Input placeholder="Board" value={filter.board} onChange={(e) => setFilter((f) => ({ ...f, board: e.target.value, page: "1" }))} className="h-8 text-sm rounded-full" />
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-medium text-gray-600">Gender</label>
                <div className="mt-2 flex gap-2 text-sm flex-wrap">
                  {["Male", "Female", "Any"].map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        setFilter((f) => ({ ...f, gender: g === "Any" ? "" : g, page: "1" }))
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
              <div>
                <label className="text-xs font-medium text-gray-600">Tuition Type</label>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {["At Student Home", "At Tutor Home", "At Institute", "Online", "Any"].map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setFilter((f) => ({ ...f, tuitionType: t === "Any" ? "" : t, page: "1" }))
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
              </div>

              {/* Experience */}
              <div>
                <label className="text-xs font-medium text-gray-600">Experience</label>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {EXP_BUCKETS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setFilter((f) => ({ ...f, expBucket: b.id, page: "1" }))}
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
                    onClick={() => setFilter((f) => ({ ...f, expBucket: "", page: "1" }))}
                    className={clsx(
                      "px-3 py-1 rounded-full border transition-all",
                      filter.expBucket === "" ? "bg-primary text-white border-primary" : "border-gray-200 hover:bg-gray-100"
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
                  {PRICE_BUCKETS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setFilter((f) => ({ ...f, priceBucket: b.id, page: "1" }))}
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
                    onClick={() => setFilter((f) => ({ ...f, priceBucket: "", page: "1" }))}
                    className={clsx(
                      "px-3 py-1 rounded-full border transition-all",
                      filter.priceBucket === "" ? "bg-primary text-white border-primary" : "border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    Any
                  </button>
                </div>
              </div>

              {/* Teaching Mode */}
              <div>
                <label className="text-xs font-medium text-gray-600">Teaching Mode</label>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {["Online", "Offline", "Both", "Any"].map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setFilter((f) => ({ ...f, teachingMode: t === "Any" ? "" : t, page: "1" }))
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

            {/* ============ Tutors Grid ============ */}
            <section className="lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>
                  {mode === "filter"
                    ? `Showing ${tutors.length} of ${total} tutors`
                    : "Recommended tutors for you"}
                </div>
                <div className="flex items-center gap-2">
                  <span>Sort</span>
                  <select
                    value={filter.sort}
                    onChange={(e) => setFilter((f) => ({ ...f, sort: e.target.value, page: "1" }))}
                    className="border rounded-full h-8 px-3 text-xs border-gray-200 focus:ring-2 focus:ring-primary"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : tutors.map((tutor) => (
                      <Card
                        key={tutor._id}
                        className="relative p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Featured ribbon */}
                        {tutor.isFeatured ? (
                          <div className="absolute -top-2 -left-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-1 shadow-sm border border-amber-200">
                              <Sparkles className="w-3 h-3" /> Featured
                            </span>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={`${IMAGE_BASE}${tutor.photoUrl}` || "/default-avatar.png"}
                            alt={tutor.name || "Tutor"}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div>
                            <div className="font-medium text-sm text-gray-800">{tutor.name}</div>
                            <div className="text-[11px] text-gray-500">
                              {tutor.qualification || tutor.specialization || "—"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            {tutor.rating || "—"}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {tutor.city || tutor.pincode || "N/A"}
                          </div>
                          <div className="font-semibold text-primary">₹{tutor.hourlyRate || 0}/hr</div>
                        </div>

                        <ul className="text-[11px] text-gray-600 mb-2 space-y-0.5">
                          {tutor.gender && <li>{tutor.gender}</li>}
                          {tutor.age && <li>Age: {tutor.age} yrs</li>}
                          {tutor.experience && (
                            <li>
                              <span className="inline-flex items-center rounded-full border px-2 py-[2px] text-[10px]">
                                {tutor.experience} yrs experience
                              </span>
                            </li>
                          )}
                          {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 && (
                            <li>Subjects: {tutor.subjects.slice(0, 3).join(", ")}</li>
                          )}
                          {tutor.lastLogin && (
                            <li className="flex items-center gap-1">
                              <Clock3 className="w-3 h-3" />
                              Last Login: {new Date(tutor.lastLogin).toLocaleDateString()}
                            </li>
                          )}
                          {tutor.addressLine1 && <li>{tutor.addressLine1}, {tutor.city}</li>}
                        </ul>

                        <div className="flex gap-2">
                          <Link
                           href={`search/tutor/${tutor._id}?userId=${tutor.userId?._id ?? ""}`}

                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full h-8 text-xs rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                            >
                              View Profile
                            </Button>
                          </Link>

                          <Link href={`/student/demo/${tutor._id}`} className="flex-1">
                            {/* iOS-like pill */}
                            <button
                              className={clsx(
                                "w-full h-8 text-[11px] font-semibold rounded-full",
                                "bg-gradient-to-b from-white to-primary/10 text-primary",
                                "border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.06)]",
                                "hover:from-white hover:to-primary/20 active:scale-[0.99] transition-all"
                              )}
                            >
                              Get Free Demo
                            </button>
                          </Link>
                        </div>
                      </Card>
                    ))}
              </div>

              {mode === "filter" && totalPages > 1 && (
                <div className="flex justify-between items-center pt-2 text-xs">
                  <p className="text-gray-500">
                    Page {filter.page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={Number(filter.page) <= 1}      
                      onClick={() => setPage(Math.max(1, Number(filter.page) - 1))}
                      className="rounded-full h-8 text-xs px-4"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={Number(filter.page) >= totalPages}
                      onClick={() => setPage(Math.min(totalPages, Number(filter.page) + 1))}
                      className="rounded-full h-8 text-xs px-4"
                    >
                      Next
                    </Button> 
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
