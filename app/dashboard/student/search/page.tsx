"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  MapPin,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTutors } from "@/services/studentService";
import clsx from "clsx";
import { useToast } from "@/hooks/use-toast"; 

// ---------- Filter Definitions ----------
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
  { value: "createdAt_desc", label: "Newest" },
  { value: "experience_desc", label: "Experience: High → Low" },
  { value: "experience_asc", label: "Experience: Low → High" },
  { value: "hourlyRate_asc", label: "Rate: Low → High" },
  { value: "hourlyRate_desc", label: "Rate: High → Low" },
];

export default function SearchTutors() {
  const { toast } = useToast(); // ✅ Initialize toast hook

  // ---------- State ----------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [board, setBoard] = useState("");
  const [gender, setGender] = useState("");
  const [teachingMode, setTeachingMode] = useState("");
  const [priceBucket, setPriceBucket] = useState("");
  const [expBucket, setExpBucket] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [tutors, setTutors] = useState<any[]>([]);
  const [mode, setMode] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ---------- Build Query ----------
  const params = useMemo(() => {
    const p: Record<string, any> = { page, limit, sort };
    if (city) p.city = city;
    if (pincode) p.pincode = pincode;
    if (subject) p.subject = subject;
    if (classLevel) p.classLevel = classLevel;
    if (board) p.board = board;
    if (gender) p.gender = gender;
    if (teachingMode) p.teachingMode = teachingMode;

    if (expBucket) {
      const b = EXP_BUCKETS.find((x) => x.id === expBucket);
      if (b?.minExp !== undefined) p.minExp = b.minExp;
      if (b?.maxExp !== undefined) p.maxExp = b.maxExp;
    }
    if (priceBucket) {
      const b = PRICE_BUCKETS.find((x) => x.id === priceBucket);
      if (b?.minRate !== undefined) p.minRate = b.minRate;
      if (b?.maxRate !== undefined) p.maxRate = b.maxRate;
    }
    return p;
  }, [
    city,
    pincode,
    subject,
    classLevel,
    board,
    gender,
    teachingMode,
    expBucket,
    priceBucket,
    sort,
    page,
  ]);

  // ---------- Load Tutors ----------
  const loadTutors = async () => {
    try {
      setLoading(true);
      const res = await fetchTutors(params);
      setTutors(res?.data || []);
      setMode(res?.mode || "");
      setTotal(res?.total || 0);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch tutors.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const clearAllFilters = () => {
    setCity("");
    setPincode("");
    setSubject("");
    setClassLevel("");
    setBoard("");
    setGender("");
    setTeachingMode("");
    setPriceBucket("");
    setExpBucket("");
    setSort("createdAt_desc");
    setPage(1);
    toast({ title: "Filters cleared" });
  };

  const totalPages = total ? Math.ceil(total / limit) : 1;

  // ---------- Skeleton Loader ----------
  const SkeletonCard = () => (
    <div className="animate-pulse p-4 rounded-2xl bg-white shadow-sm space-y-3">
      <div className="flex gap-3 items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded"></div>
      <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <Sidebar userRole="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar title="Find Tutors" subtitle="Search and book your next class" />

        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ================= Filter Sidebar ================= */}
            <aside
              className={clsx(
                "lg:col-span-3 rounded-2xl bg-white shadow-sm p-4 space-y-4 transition-all",
                "lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] overflow-y-auto"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Refine Search</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-primary hover:underline"
                  type="button"
                >
                  Clear All
                </button>
              </div>

              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Input
                placeholder="Class"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
              />
              <Input placeholder="Board" value={board} onChange={(e) => setBoard(e.target.value)} />

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <div className="mt-2 flex gap-3 text-sm">
                  {["male", "female"].map((g) => (
                    <label key={g} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => setGender(g)}
                      />
                      {g}
                    </label>
                  ))}
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === ""}
                      onChange={() => setGender("")}
                    />
                    Any
                  </label>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm font-medium text-gray-700">Experience</label>
                <div className="mt-2 space-y-2 text-sm">
                  {EXP_BUCKETS.map((b) => (
                    <label key={b.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="exp"
                        checked={expBucket === b.id}
                        onChange={() => setExpBucket(b.id)}
                      />
                      {b.label}
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exp"
                      checked={expBucket === ""}
                      onChange={() => setExpBucket("")}
                    />
                    Any
                  </label>
                </div>
              </div>

              {/* Hourly Price */}
              <div>
                <label className="text-sm font-medium text-gray-700">Hourly Price</label>
                <div className="mt-2 space-y-2 text-sm">
                  {PRICE_BUCKETS.map((b) => (
                    <label key={b.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="price"
                        checked={priceBucket === b.id}
                        onChange={() => setPriceBucket(b.id)}
                      />
                      {b.label}
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="price"
                      checked={priceBucket === ""}
                      onChange={() => setPriceBucket("")}
                    />
                    Any
                  </label>
                </div>
              </div>

              {/* Teaching Mode */}
              <div>
                <label className="text-sm font-medium text-gray-700">Teaching Mode</label>
                <div className="mt-2 space-y-2 text-sm">
                  {["Online", "Offline", "Both"].map((t) => (
                    <label key={t} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        checked={teachingMode === t}
                        onChange={() => setTeachingMode(t)}
                      />
                      {t}
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={teachingMode === ""}
                      onChange={() => setTeachingMode("")}
                    />
                    Any
                  </label>
                </div>
              </div>
            </aside>

            {/* ================= Tutors Grid ================= */}
            <section className="lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  {mode === "filter"
                    ? `Showing ${tutors.length} of ${total} tutors`
                    : "Recommended tutors for you"}
                </div>
                <div className="flex items-center gap-3">
                  <span>Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border rounded-md h-9 px-3 text-sm"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : tutors.map((tutor) => (
                      <Card
                        key={tutor._id}
                        className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={tutor.photoUrl || "/default-avatar.png"}
                            alt={tutor.name || "Tutor"}
                            className="w-12 h-12 rounded-full object-cover border"
                            onError={(e) =>
                              (e.currentTarget.src =
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png")
                            }
                          />
                          <div>
                            <div className="font-semibold">{tutor.name}</div>
                            <div className="text-xs text-gray-500">
                              {tutor.qualification || tutor.specialization || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {tutor.rating || "—"}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {tutor.city || tutor.pincode || "N/A"}
                          </div>
                          <div className="font-medium">
                            ₹{tutor.hourlyRate || 0}/<span className="text-xs">hr</span>
                          </div>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1 mb-3">
                          {tutor.gender && <li>• {tutor.gender}</li>}
                          {tutor.experience && <li>• {tutor.experience} yrs exp</li>}
                          {tutor.subjects?.length && (
                            <li>• {tutor.subjects.slice(0, 3).join(", ")}</li>
                          )}
                        </ul>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/search/tutor/${tutor._id}?userId=${tutor.userId ?? ""}`}
                          >
                            <Button variant="outline" className="w-full">
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/student/demo/${tutor._id}`}>
                            <Button className="w-full">Get Free Demo</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
              </div>

              {mode === "filter" && totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
