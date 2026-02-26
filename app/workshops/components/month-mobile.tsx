"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
} from "date-fns";

type Props = {
  baseDate: Date;
  byDay: Record<string, any[]>;
};

export default function MobileMonth({ baseDate, byDay }: Props) {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calendarStart;
  while (d <= calendarEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const [selected, setSelected] = useState<string | null>(null);

  /* 🔥 FIX: RESET SELECTED WHEN MONTH / DATA CHANGES */
  useEffect(() => {
    // pick first workshop date of this month
    const firstDayWithWorkshop = Object.keys(byDay)
      .sort()
      .find((date) =>
        isSameMonth(new Date(date), baseDate)
      );

    setSelected(firstDayWithWorkshop ?? null);
  }, [baseDate, byDay]);

  const selectedItems = selected ? byDay[selected] : [];

  return (
    <div className="space-y-4">

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 text-xs text-muted-foreground text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* MONTH GRID */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const hasEvents = !!byDay[key]?.length;
          const isSelected = key === selected;

          return (
            <button
              key={key}
              onClick={() => hasEvents && setSelected(key)}
              className={`
                h-10 w-10 mx-auto rounded-full
                flex flex-col items-center justify-center
                text-sm
                ${isSelected ? "bg-primary text-white" : "hover:bg-muted"}
                ${!isSameMonth(day, baseDate) ? "text-muted-foreground" : ""}
              `}
            >
              <span>{format(day, "d")}</span>

              {hasEvents && (
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-primary"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* DETAILS PANEL */}
      {selectedItems?.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium">
            {format(new Date(selected!), "MMMM d")}
          </p>

          {selectedItems.map((w) => (
            <Link
              key={w.id}
              href={`/workshops/${w.slug}`}
              className="block rounded-lg border p-3 hover:bg-muted transition"
            >
              <p className="font-semibold text-sm leading-snug">
                {w.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(w.startAt, "hh:mm a")} –{" "}
                {format(w.endAt, "hh:mm a")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
