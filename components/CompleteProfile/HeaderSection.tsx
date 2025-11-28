"use client";
import { Sparkles } from "lucide-react";

export default function HeaderSection() {
  return (
    <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/90 text-white flex items-center justify-center font-bold shadow-sm">
            T
          </div>
          <span className="font-semibold text-lg text-gray-900">Tuitions time</span>
        </div>
      </div>
    </nav>
  );
}
