"use client";

const contactItems = [
  { label: "Call us", value: "+91 87553 13291", href: "tel:+918755313291" },
  { label: "Email", value: "support@tuitionstime.com", href: "mailto:support@tuitionstime.com" },
];

const tickerEntries = [...contactItems, ...contactItems];

export default function ContactTicker() {
  return (
    <div className="border-b bg-primary/10 text-text">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="contact-ticker-track inline-flex min-w-full items-center">
          {tickerEntries.map((item, index) => (
            <a
              key={`${item.label}-${index}`}
              href={item.href}
              className="contact-ticker-item inline-flex items-center gap-2 px-6 py-2 text-sm font-medium hover:underline"
            >
              <span className="text-muted">{item.label}:</span>
              <span>{item.value}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
