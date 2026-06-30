export const CLASS_JOIN_NOTICE =
  "Tab/Laptop and high speed internet is required.";

export const CLASS_JOIN_BEFORE_MINUTES = 10;
export const CLASS_EXPIRE_AFTER_MINUTES = 5;
export const REGULAR_CLASS_DURATION_MINUTES = 60;
export const DEMO_CLASS_DURATION_MINUTES = 15;

type JoinWindowOptions = {
  durationMin?: number;
  joinBeforeMin?: number;
  expireAfterMin?: number;
  useUtcWallClock?: boolean;
};

export const getUtcWallClockMs = (value: string | Date | null | undefined) => {
  if (!value) return NaN;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return NaN;
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds()
  ).getTime();
};

export const getClassJoinWindowState = (
  startDateTime: string | Date | null | undefined,
  options: JoinWindowOptions = {}
) => {
  const {
    durationMin = REGULAR_CLASS_DURATION_MINUTES,
    joinBeforeMin = CLASS_JOIN_BEFORE_MINUTES,
    expireAfterMin = CLASS_EXPIRE_AFTER_MINUTES,
    useUtcWallClock = false,
  } = options;

  const startMs = useUtcWallClock
    ? getUtcWallClockMs(startDateTime)
    : new Date(startDateTime || "").getTime();

  if (!Number.isFinite(startMs)) {
    return { canJoin: false, inJoinWindow: false, isFuture: true, isExpired: false };
  }

  const nowMs = Date.now();
  const endMs = startMs + durationMin * 60 * 1000;
  const joinOpenAt = startMs - joinBeforeMin * 60 * 1000;
  const joinCloseAt = endMs + expireAfterMin * 60 * 1000;
  const inJoinWindow = nowMs >= joinOpenAt && nowMs <= joinCloseAt;

  return {
    canJoin: inJoinWindow,
    inJoinWindow,
    isFuture: nowMs < joinOpenAt,
    isExpired: nowMs > joinCloseAt,
  };
};

export const getTimeRangeDurationMinutes = (
  startTime?: string | null,
  endTime?: string | null,
  fallbackMin = REGULAR_CLASS_DURATION_MINUTES
) => {
  const startMatch = String(startTime || "").match(/^(\d{1,2}):(\d{2})$/);
  const endMatch = String(endTime || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!startMatch || !endMatch) return fallbackMin;

  const startHour = Math.max(0, Math.min(23, Number(startMatch[1])));
  const startMinute = Math.max(0, Math.min(59, Number(startMatch[2])));
  const endHour = Math.max(0, Math.min(23, Number(endMatch[1])));
  const endMinute = Math.max(0, Math.min(59, Number(endMatch[2])));
  let diff = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (diff <= 0) diff += 24 * 60;
  return diff || fallbackMin;
};

export const openClassLinkWithNotice = (url?: string | null) => {
  if (!url) return false;
  if (!window.confirm(CLASS_JOIN_NOTICE)) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
};
