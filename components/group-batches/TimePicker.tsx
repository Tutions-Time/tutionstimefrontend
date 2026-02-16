import { useEffect, useMemo, useState } from "react";

type Props = {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
};

const toParts = (val?: string) => {
  if (!val || !/^\d{1,2}:\d{2}$/.test(val)) return { hour12: 12, minute: "00", period: "AM" as const };
  const [hStr, mStr] = val.split(":");
  const h = Math.max(0, Math.min(23, Number(hStr)));
  const minute = mStr.padStart(2, "0");
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, minute, period };
};

const to24h = (hour12: number, minute: string, period: "AM" | "PM") => {
  const h = hour12 % 12;
  const h24 = period === "PM" ? h + 12 : h;
  return `${String(h24).padStart(2, "0")}:${minute.padStart(2, "0")}`;
};

export default function TimePicker({ value, onChange, disabled, className }: Props) {
  const initial = useMemo(() => toParts(value), [value]);
  const [hour, setHour] = useState<number>(initial.hour12);
  const [minute, setMinute] = useState<string>(initial.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initial.period);

  useEffect(() => {
    const next = toParts(value);
    setHour(next.hour12);
    setMinute(next.minute);
    setPeriod(next.period);
  }, [value]);

  useEffect(() => {
    onChange(to24h(hour, minute, period));
  }, [hour, minute, period]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <select
        className="border p-2 rounded w-20"
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
        disabled={disabled}
      >
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-sm">:</span>
      <select
        className="border p-2 rounded w-24"
        value={minute}
        onChange={(e) => setMinute(e.target.value)}
        disabled={disabled}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        className="border p-2 rounded w-24"
        value={period}
        onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
        disabled={disabled}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

