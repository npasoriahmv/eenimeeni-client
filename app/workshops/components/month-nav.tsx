"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addMonths, format } from "date-fns";

export function MonthNav({ current }: { current: Date }) {
  const router = useRouter();
  const params = useSearchParams();

  function go(monthOffset: number) {
    const target = addMonths(new Date(), monthOffset);
    const p = new URLSearchParams(params.toString());
    p.set("month", format(target, "yyyy-MM"));
    p.set("view", "month");
    router.push(`/workshops?${p.toString()}`);
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        {format(current, "MMMM yyyy")}
      </h2>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition"
          >
            {format(addMonths(new Date(), i), "MMM")}
          </button>
        ))}
      </div>
    </div>
  );
}
