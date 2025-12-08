"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavigationLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // NEXT 13/14 App Router - Detects navigation start and finish
      const nav = (router as any).isNavigating;

      if (nav && !loading) setLoading(true);     // start loader
      if (!nav && loading) setLoading(false);    // stop loader
    }, 50);

    return () => clearInterval(interval);
  }, [router, loading]);

  return (
    <div
      className={`fixed top-0 left-0 h-[3px] w-full z-[9999] transition-opacity duration-300 ${
        loading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full bg-primary animate-[loader_1.2s_ease-in-out_infinite]" />

      <style jsx>{`
        @keyframes loader {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
