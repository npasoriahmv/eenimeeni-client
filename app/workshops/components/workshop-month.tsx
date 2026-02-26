import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import MobileMonth from "./month-mobile";

/* ---------------- Month Navigation ---------------- */
function MonthNav({ current }: { current: Date }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">
        {format(current, "MMMM yyyy")}
      </h2>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => {
          const d = addMonths(new Date(), i);
          return (
            <Link
              key={i}
              href={`/workshops?view=month&month=${format(d, "yyyy-MM")}`}
              className="px-3 py-1 text-sm rounded-full border hover:bg-muted"
            >
              {format(d, "MMM")}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- MAIN MONTH VIEW ---------------- */
export async function WorkshopMonth({ month }: { month?: string }) {
  const baseDate = month ? new Date(`${month}-01`) : new Date();

  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);

  const workshops = await prisma.workShop.findMany({
    where: {
      startAt: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { startAt: "asc" },
  });

  /* GROUP BY DATE */
  const byDay: Record<string, typeof workshops> = {};
  workshops.forEach((w) => {
    const key = format(w.startAt, "yyyy-MM-dd");
    byDay[key] = byDay[key] || [];
    byDay[key].push(w);
  });

  return (
    <>
      <MonthNav current={baseDate} />

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        <MobileMonth baseDate={baseDate} byDay={byDay} />
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <DesktopMonth baseDate={baseDate} byDay={byDay} />
      </div>
    </>
  );
}

/* ---------------- DESKTOP MONTH GRID ---------------- */
function DesktopMonth({
  baseDate,
  byDay,
}: {
  baseDate: Date;
  byDay: Record<string, any[]>;
}) {
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

  return (
    <>
      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w, idx) => (
          <div key={idx} className="px-2 py-1">
            {w}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const items = byDay[key] || [];

          return (
            <div
              key={key}
              className={`
                rounded-xl border p-2 min-h-[140px]
                ${!isSameMonth(day, baseDate) ? "bg-muted/30" : "bg-white"}
                ${isToday(day) ? "ring-2 ring-primary/40" : ""}
              `}
            >
              <div className="text-xs font-semibold mb-1">
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {items.slice(0, 2).map((w) => (
                  <Link
                    key={w.id}
                    href={`/workshops/${w.slug}`}
                    className="block rounded-md bg-primary/10 px-2 py-1 text-xs"
                  >
                    <div className="font-medium line-clamp-2">
                      {w.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(w.startAt, "hh:mm a")} –{" "}
                      {format(w.endAt, "hh:mm a")}
                    </div>
                  </Link>
                ))}

                {items.length > 2 && (
                  <Link
                    href={`/workshops?view=day&date=${key}`}
                    className="text-[10px] text-primary hover:underline"
                  >
                    +{items.length - 2} more
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
