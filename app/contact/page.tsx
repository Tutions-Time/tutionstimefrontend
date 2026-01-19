"use client";

import { ArrowLeft, Phone, Globe, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactPage() {
  const router = useRouter();

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Back Button */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Main Container */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              We’re here to help. Reach out to us through our official contact
              number or connect with us on our social platforms.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Official Contact Number</p>
                  <a
                    href="tel:+918755313291"
                    className="text-lg font-semibold text-slate-900 hover:text-primary"
                  >
                    +918755313291
                  </a>
                  
                  
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Website</p>
                  <a
                    href="https://www.tuitionstime.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-900 font-medium hover:text-primary"
                  >
                    www.tuitionstime.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Connect With Us
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="https://www.instagram.com/tuitionstime"
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Instagram
                  </span>
                </Link>

                <Link
                  href="https://www.linkedin.com/in/tuitionstime-tutor-s-service-00bba4386"
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <span className="text-sm font-medium text-slate-700">
                    LinkedIn
                  </span>
                </Link>

                <Link
                  href="https://www.facebook.com/share/1FCDTPLhdd/"
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Facebook
                  </span>
                </Link>

                <Link
                  href="https://x.com/TuitionsTime"
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <Twitter className="h-5 w-5 text-slate-800" />
                  <span className="text-sm font-medium text-slate-700">
                    X (Twitter)
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-sm text-slate-500">
            2026 Tuitions time (Choudhary Enterprise). All rights reserved.
          </div>
        </div>
      </section>
    </main>
  );
}
