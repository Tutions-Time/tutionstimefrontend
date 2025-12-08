"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Whenever the pathname changes → show loader briefly
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 400); // smooth loading transition

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div
      className={`fixed top-0 left-0 h-[3px] w-full z-[9999] transition-all duration-300 ${
        loading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full w-full bg-primary animate-pulse"></div>
    </div>
  );
}
