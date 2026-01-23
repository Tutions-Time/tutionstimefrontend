"use client";
import Image from "next/image";

export default function HeaderSection() {
  return (
    <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        {/* Logo */}
        <div className="flex items-center h-16">
          <Image
            src="/images/logo.png"
            alt="Tuitions Time"
            width={160}
            height={22}
            className="object-contain"
            priority
          />
        </div>

      </div>
    </nav>
  );
}
