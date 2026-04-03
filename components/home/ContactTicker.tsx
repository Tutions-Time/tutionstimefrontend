"use client";

import { MessageCircle } from "lucide-react";

const contactItems = [
  { label: "Call us", value: "+91 87553 13291", href: "tel:+918755313291" },
  { label: "Email", value: "support@tuitionstime.com", href: "mailto:support@tuitionstime.com" },
];

const tickerEntries = [...contactItems, ...contactItems, ...contactItems];

export default function ContactTicker() {
  return (
    <>
      <div className="sticky top-16 z-40 border-b bg-primary/95 text-text shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center px-3 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap py-3">
            <div className="contact-ticker-track inline-flex min-w-max items-center">
              {tickerEntries.map((item, index) => (
                <a
                  key={`${item.label}-${index}`}
                  href={item.href}
                  className="contact-ticker-item inline-flex items-center gap-2 px-6 text-sm font-medium hover:underline"
                >
                  <span className="text-muted">{item.label}:</span>
                  <span>{item.value}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
        <a
          href="https://wa.me/918755313291"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-10 right-4 z-50 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        >
          <MessageCircle className="h-7 w-7 sm:h-6 sm:w-6" />
        </a>
    </>
  );
}
