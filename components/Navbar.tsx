"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpenText,
  BriefcaseBusiness,
  HelpCircle,
  Home,
  Info,
  MoreVertical,
  Phone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp as fadeIn, floatHover as scaleHover } from "./animations";
import { useAppSelector } from "@/store/store";
import { getRoleDefaultPath } from "@/lib/roleRoutes";
import { cn } from "@/lib/utils";

const landingLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Blogs", href: "/blogs" },
  { label: "Services", href: "/services", icon: BriefcaseBusiness },
  { label: "How it works", href: "/how-it-works", icon: HelpCircle },
  { label: "About us", href: "/about-us", icon: Info },
  { label: "Contact", href: "/contact", icon: Phone },
];

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Role-based dashboard path
  const dashboardPath = getRoleDefaultPath(user?.role);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isLinkActive = (href: string) => {
    const cleanHref = href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;
    const cleanPath =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    if (cleanHref === "/") return cleanPath === "/";
    return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
  };

  return (
    <>
      <motion.nav
        className="border-b bg-white sticky top-0 z-50 backdrop-blur-lg bg-opacity-90"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <motion.div className="flex items-center" whileHover={scaleHover}>
                <Link href="/" aria-label="tuitionstime home">
                  <Image
                    src="/images/logo.png"
                    alt="tuitionstime"
                    width={160}
                    height={22}
                    className="object-contain"
                    priority
                  />
                </Link>
              </motion.div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {!isAuthenticated ? (
                <>
                  {/* LOGIN */}
                  <Link href="/login">
                    <motion.div
                      whileHover={scaleHover}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost">Login</Button>
                    </motion.div>
                  </Link>

                  {/* GET STARTED */}
                  <Link href="/signup">
                    <motion.div
                      whileHover={scaleHover}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
                        Get Started
                      </Button>
                    </motion.div>
                  </Link>
                </>
              ) : (
                <>
                  {/* DASHBOARD BUTTON */}
                  <Link href={dashboardPath}>
                    <motion.div
                      whileHover={scaleHover}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-primary hover:bg-primary/90 text-text font-semibold">
                        Dashboard
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}

              <motion.div whileHover={scaleHover} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open site menu"
                  aria-expanded={sidebarOpen}
                  onClick={() => setSidebarOpen((open) => !open)}
                  className="h-10 w-10 rounded-xl"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-16 z-[80] h-[calc(100vh-4rem)] w-72 border-l bg-white shadow-xl transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close site menu"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {landingLinks.map((link) => {
            const Icon = link.icon ?? BookOpenText;
            const active = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-text"
                    : "text-muted hover:bg-primaryWeak hover:text-text"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
