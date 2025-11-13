"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  BookOpen,
  Video,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ClassStatus = "scheduled" | "completed" | "cancelled";

export type TutorClass = {
  id: string;
  studentName: string;
  subject: string;
  date: string; // ISO
  time: string; // display
  status: ClassStatus;
  type: "demo" | "regular";
};

type Props = {
  classes: TutorClass[];
};

export default function MyClassesSection({ classes }: Props) {
  return (
    <section className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">My Classes</h2>
        <Link href="/dashboard/tutor#sessions">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              {/* Left: Student info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="font-semibold text-text text-sm sm:text-base">
                    {cls.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-text">
                        {cls.studentName}
                      </h3>
                      <p className="text-sm text-muted">
                        {cls.subject} •{" "}
                        {cls.type === "demo" ? "Demo" : "Regular"}
                      </p>
                    </div>

                    {cls.status === "scheduled" ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 self-start">
                        Upcoming
                      </Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success border-success/20 self-start">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(cls.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {cls.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              {cls.status === "scheduled" ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto sm:justify-end">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Materials
                  </Button>
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-text">
                    <Video className="w-4 h-4 mr-2" />
                    Start Class
                  </Button>
                </div>
              ) : (
                <Link href={`/assignments?class=${cls.id}`} className="w-full md:w-auto">
                  <Button variant="outline" className="w-full md:w-auto">
                    Review
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
