"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, useScrollAnimation } from "./animations";

export default function Footer() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <footer ref={ref} className="border-t py-12 bg-white">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-text">
                T
              </div>
              <span className="font-bold text-xl text-text">Tuitions time</span>
            </div>
            <p className="text-sm text-muted pb-2">
              Your Learning Journey Begins Here — With TuitionsTime
            </p>
            <Link href="/how-it-works" className="hover:text-text text-sm font-medium">
              How it works
            </Link>
          </div>

          {/* Students */}
          <div>
            <h4 className="font-semibold text-text mb-4">For Students</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="signup?role=student" className="hover:text-text">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-text">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Tutors */}
          <div>
            <h4 className="font-semibold text-text mb-4">For Tutors</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/signup?role=tutor" className="hover:text-text">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-text">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <h4 className="font-semibold text-text mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/contact" className="hover:text-text">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-text">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-text">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-text">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t text-center text-sm text-muted">
          <p>&copy; 2024 Tuitions time. All rights reserved.</p>
        </div>
      </motion.div>
    </footer>
  );
}
