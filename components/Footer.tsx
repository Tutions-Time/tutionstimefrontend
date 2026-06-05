"use client";
import Link from "next/link";
import {
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, useScrollAnimation } from "./animations";
import Image from "next/image";

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
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
              
                  <Image
                    src="/images/logo.png"
                    alt="tuitionstime"
                    width={160}
                    height={22}
                    className="object-contain"
                    priority
                  />
              </div>
            </div>
            <p className="text-sm text-muted pb-2">
              Your Learning Journey Begins Here — With tuitionstime
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-text mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/about-us" className="hover:text-text">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-text">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-text">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-text">
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-text mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/signup?role=student" className="hover:text-text">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link href="/signup?role=tutor" className="hover:text-text">
                  Join as Tutor
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
          <div>
            <h4 className="font-semibold text-text mb-4">Address</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                House Number-530 Ahmedlda pura, Beside Om Dhara Nursery, Jhalu
                Road, Bijnor, Uttar Pradesh, Pincode-246701
              </li>
              {/* <li>Office 2: 45 Sample Road, City, State 100002</li> */}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t text-center text-sm text-muted">
          <p>
            &copy; 2026 tuitionstime (Choudhary Enterprise). All rights
            reserved.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Link
              href="https://wa.me/918755313291"
              target="_blank"
              className="inline-flex items-center gap-3 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Chat on WhatsApp</span>
            </Link>
            {/* <span className="text-xs text-muted">Follow us on</span> */}
            <div className="flex items-center gap-6">
              <Link
                href="https://www.instagram.com/tuitionstime"
                target="_blank"
                className="hover:text-text"
              >
                <Instagram className="h-4 w-4 text-pink-600" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/tuitionstime-tutor-s-service-00bba4386"
                target="_blank"
                className="hover:text-text"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
              </Link>
              <Link
                href="https://www.facebook.com/share/1FCDTPLhdd/"
                target="_blank"
                className="hover:text-text"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
              </Link>
              <Link
                href="https://x.com/tuitionstime"
                target="_blank"
                className="hover:text-text"
              >
                <Twitter className="h-4 w-4 text-slate-800" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
