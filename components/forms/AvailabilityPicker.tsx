'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// ───────────────── utils ─────────────────
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Cell = { iso?: string; day?: number; inMonth: boolean; date?: Date };

export default function AvailabilityPicker({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const today = new Date();
  const todayISO = toISO(today);
  const interactive = !disabled && !readOnly;

  const [cursor, setCursor] = useState<Date>(() => {
    if (value?.length) {
      const [y, m] = value[0].split('-').map(Number);
      return new Date(y, (m || 1) - 1, 1);
    }
    return startOfMonth(new Date());
  });

  const selected = useMemo(() => new Set(value || []), [value]);

  const monthMeta = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const total = last.getDate();
    const startWeekday = first.getDay();

    const cells: Cell[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ inMonth: false });

    for (let d = 1; d <= total; d++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      cells.push({ iso: toISO(date), day: d, inMonth: true, date });
    }

    while (cells.length % 7 !== 0) cells.push({ inMonth: false });
    while (cells.length < 42) cells.push({ inMonth: false });

    return {
      monthLabel: first.toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }),
      cells,
    };
  }, [cursor, value]);

  const toggle = (iso?: string) => {
    if (!interactive || !iso) return;
    const next = new Set(selected);
    next.has(iso) ? next.delete(iso) : next.add(iso);
    onChange(Array.from(next).sort());
  };

  const clearAll = () => interactive && onChange([]);

  // ⭐ NEW — full month but skip Sundays
  const pickFullMonth = () => {
    if (!interactive) return;
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const next = new Set<string>(selected);

    for (let day = 1; day <= last.getDate(); day++) {
      const dt = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      if (dt.getDay() !== 0) {
        // 🔥 Skip Sundays
        next.add(toISO(dt));
      }
    }

    onChange(Array.from(next).sort());
  };

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden relative',
        disabled && 'opacity-60 pointer-events-none'
      )}
    >
      {disabled && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 cursor-not-allowed" />
      )}

      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              className="h-9 w-9 rounded-xl border bg-white/70 backdrop-blur hover:bg-white transition-all flex items-center justify-center"
              disabled={disabled}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-white/80 border text-sm font-semibold">
              {monthMeta.monthLabel}
            </div>

            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, +1))}
              className="h-9 w-9 rounded-xl border bg-white/70 backdrop-blur hover:bg-white transition-all flex items-center justify-center"
              disabled={disabled}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ⭐ FILTERS — Removed 2 Weekends + Today */}
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={pickFullMonth}
              disabled={disabled}
              className="h-9 rounded-xl"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Full Month
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={clearAll}
              disabled={disabled}
              className="h-9 rounded-xl"
            >
              Clear
            </Button>
            </div>
          )}
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-[11px] md:text-xs border-b bg-white">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center font-semibold text-gray-600">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {monthMeta.cells.map((cell, idx) => {
          const isSelected = !!cell.iso && selected.has(cell.iso);
          const isToday = cell?.iso === todayISO;
          const base =
            'relative h-14 md:h-16 border-t flex items-center justify-center select-none transition-colors';

          return (
            <div
              key={idx}
              role={cell.inMonth ? 'button' : undefined}
              aria-pressed={isSelected}
              className={cn(
                base,
                cell.inMonth
                  ? 'cursor-pointer hover:bg-primary/5'
                  : 'bg-gray-50 opacity-60'
              )}
              onClick={() => cell.inMonth && toggle(cell.iso)}
            >
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm',
                  isSelected
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/60'
                    : isToday
                    ? 'ring-2 ring-primary/60 text-primary font-semibold bg-white'
                    : 'text-gray-800'
                )}
              >
                {cell.day ?? ''}
              </span>

              {cell.inMonth &&
                cell.date &&
                [0, 6].includes(cell.date.getDay()) && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary/40" />
                )}
            </div>
          );
        })}
      </div>

      {/* Footer chips */}
      {!readOnly && (
        <div className="px-4 md:px-6 py-4 border-t space-y-3">
          <div className="text-xs text-muted-foreground">
            Tap dates you??Tre available (no time). IST assumed for display only.
          </div>

          {value?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {value.map((iso) => (
                <button
                  key={iso}
                  onClick={() => toggle(iso)}
                  disabled={disabled}
                  className="group inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {iso}
                  <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] group-hover:bg-primary/30">
                    A-
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
