type TimeFormatOptions = { timeZone?: string };

const formatDateTimeValue = (value: string | Date, options?: TimeFormatOptions) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
    })
    .toUpperCase();
};

export const formatTime12 = (value?: string | Date | null, options?: TimeFormatOptions) => {
  if (!value) return "";

  if (value instanceof Date) return formatDateTimeValue(value, options);

  const text = String(value).trim();
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(text) || text.includes("T")) {
    return formatDateTimeValue(text, options);
  }

  const match = text.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([AP]M)?$/i);
  if (!match) return text;

  let hour = Number(match[1]);
  const minute = match[2] || "00";
  const explicitPeriod = match[3]?.toUpperCase();

  if (!Number.isFinite(hour) || hour < 0 || hour > 24) return text;
  if (!/^\d{2}$/.test(minute) || Number(minute) > 59) return text;

  if (explicitPeriod) {
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${explicitPeriod}`;
  }

  const hour24 = hour === 24 ? 0 : hour;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};

export const formatTimeRange12 = (start?: string | null, end?: string | null) => {
  const startText = formatTime12(start);
  const endText = formatTime12(end);
  return [startText, endText ? `to ${endText}` : ""].filter(Boolean).join(" ");
};

export const formatDateTime12 = (value?: string | Date | null, options?: TimeFormatOptions) => {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
  });
  const time = formatTime12(d, options);
  return time ? `${date}, ${time}` : date;
};

export const formatTimeSlot12 = (slot?: string | null) => {
  const text = String(slot || "").trim();
  if (!text) return "";
  return text
    .split(/\s*-\s*|\s+to\s+/i)
    .map((part) => formatTime12(part.trim()))
    .filter(Boolean)
    .join(" - ");
};
