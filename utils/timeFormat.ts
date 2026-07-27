export const formatTime12 = (value?: string | Date | null, options?: { timeZone?: string }) => {
  if (!value) return "";

  if (value instanceof Date || /\d{4}-\d{2}-\d{2}/.test(String(value))) {
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
  }

  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return String(value);
  let hour = Number(match[1]);
  const minute = match[2];
  if (!Number.isFinite(hour)) return String(value);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
};

export const formatTimeRange12 = (start?: string | null, end?: string | null) => {
  const startText = formatTime12(start);
  const endText = formatTime12(end);
  return [startText, endText ? `to ${endText}` : ""].filter(Boolean).join(" ");
};

export const formatDateTime12 = (value?: string | Date | null, options?: { timeZone?: string }) => {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
  });
  return `${date}, ${formatTime12(d, options)}`;
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

