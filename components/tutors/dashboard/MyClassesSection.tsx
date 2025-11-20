"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Video, CheckCircle, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { TutorClass } from "@/app/dashboard/tutor/page"; // ⭐ import the type properly

// ⭐ ACCEPT PROPS HERE
export default function MyClassesSection({ classes }: { classes: TutorClass[] }) {
  const [loading, setLoading] = useState(false);

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${ampm}`;
  };

  return (
    <section className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">My Classes</h2>
        <Link href="/dashboard/tutor/demo_sessions">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>

      {/* Empty state */}
      {classes.length === 0 && (
        <Card className="p-6 text-center text-muted rounded-2xl bg-white shadow-sm">
          No classes found.
        </Card>
      )}

      {/* Class list */}
      {classes.map((cls) => (
        <Card
          key={cls.id}
          className="p-4 sm:p-6 rounded-2xl bg-white shadow-soft hover:shadow-lg transition-base"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            {/* LEFT SIDE */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-semibold">
                {cls.studentName.split(" ").map((n) => n[0]).join("")}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className="font-semibold">{cls.studentName}</h3>
                    <p className="text-sm text-muted">
                      {cls.subject} • {cls.type === "demo" ? "Demo" : "Regular"}
                    </p>
                  </div>

                  <Badge
                    className={
                      cls.status === "completed"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }
                  >
                    {cls.status === "completed" ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" /> Completed
                      </>
                    ) : (
                      "Upcoming"
                    )}
                  </Badge>
                </div>

                {/* DATE & TIME */}
                <div className="flex items-center flex-wrap gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(cls.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {cls.time}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <BookOpen className="w-4 h-4 mr-2" />
                Materials
              </Button>

              <Button className="bg-primary text-white w-full sm:w-auto">
                <Video className="w-4 h-4 mr-2" />
                Start Class
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
