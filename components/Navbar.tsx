"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fadeInUp as fadeIn, floatHover as scaleHover } from "./animations";
import { useAppSelector } from "@/store/store";
import { getRoleDefaultPath } from "@/lib/roleRoutes";

const landingLinks = [
  { label: "Blogs", href: "/blogs" },
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
];

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Role-based dashboard path
  const dashboardPath = getRoleDefaultPath(user?.role);

  return (
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
              <Image
                src="/images/logo.png"
                alt="Tuitions Time"
                width={160}
                height={22}
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open page links"
                  className="h-10 w-10 rounded-xl"
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <Menu className="h-5 w-5" />
                    <ChevronDown className="absolute -bottom-1 -right-2 h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {landingLinks.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
