"use client";

import { Calendar, ClipboardList, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function KpiSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Classes this month */}
      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">18</p>
            <p className="text-xs sm:text-sm text-muted">
              Classes This Month
            </p>
          </div>
        </div>
      </Card>

      {/* Active students */}
      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">12</p>
            <p className="text-xs sm:text-sm text-muted">
              Active Students
            </p>
          </div>
        </div>
      </Card>

      {/* Pending assignments */}
      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">6</p>
            <p className="text-xs sm:text-sm text-muted">
              Pending Assignments
            </p>
          </div>
        </div>
      </Card>

      {/* Earnings */}
      <Card className="p-4 sm:p-6 rounded-2xl shadow-soft bg-white hover:shadow-lg transition-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-text">₹28,500</p>
            <p className="text-xs sm:text-sm text-muted">
              Earnings (Oct)
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
