"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, MapPin, Star, Filter } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTutors } from "@/services/studentService";

export default function SearchTutors() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState("");
  const [teachingMode, setTeachingMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const data = await fetchTutors(
        q || teachingMode ? { subject: q, teachingMode } : undefined
      );
      setTutors(data);
    } catch (err) {
      console.error("Tutor fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTutors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={1}
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
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              <div className="relative md:col-span-2">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input
                  className="pl-9"
                  placeholder="Subject, tutor, city…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Both</option>
              </select>

              <Button type="submit" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
          </Card>

          {loading && (
            <Card className="p-10 text-center text-muted">Loading tutors…</Card>
          )}

          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.length > 0 ? (
                tutors.map((tutor) => (
                  <Card
                    key={tutor._id}
                    className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-base"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={tutor.photoUrl || "/default-avatar.png"}
                        alt={tutor.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-semibold">{tutor.name}</div>
                        <div className="text-sm text-muted">
                          {tutor.subjects?.join(", ") || "Subjects not set"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning" />
                        {tutor.rating || "—"}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tutor.pincode || "N/A"}
                      </div>
                      <div>₹{tutor.hourlyRate || 0}/hr</div>
                    </div>

                    <Link
                      href={{
                        pathname: `search/tutor/${tutor._id}`,
                        query: { userId: tutor.userId },
                      }}
                      className="mt-3 block"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90 text-text">
                        View Profile
                      </Button>
                    </Link>
                  </Card>
                ))
              ) : (
                <Card className="p-10 text-center text-muted">
                  No tutors found.
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
