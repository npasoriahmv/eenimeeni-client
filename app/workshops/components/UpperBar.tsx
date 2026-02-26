"use client";

import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function UpperBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const view = params.get("view") ?? "list";

  function update(param: string, value: string) {
    const p = new URLSearchParams(params.toString());
    p.set(param, value);
    router.push(`/workshops?${p.toString()}`);
  }

  return (
    <section className="mt-10 md:mt-14">
      <div
        className="
          rounded-2xl border bg-white/80 backdrop-blur-xl
          shadow-sm
          px-4 py-4 md:px-6
        "
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center justify-between">

          {/* SEARCH */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") update("q", query);
              }}
              placeholder="Search workshops, camps, activities…"
              className="
                pl-9 h-11 rounded-full
                bg-white
                border-muted
                focus-visible:ring-2 focus-visible:ring-purple-400
              "
            />
          </div>

          {/* VIEW SWITCH */}
          <div className="flex justify-end">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && update("view", v)}
              className="
                rounded-full border bg-muted/40
                p-1
              "
            >
              <ToggleGroupItem
                value="list"
                className="rounded-full px-4 data-[state=on]:bg-white data-[state=on]:shadow"
              >
                List
              </ToggleGroupItem>

              <ToggleGroupItem
                value="month"
                className="rounded-full px-4 data-[state=on]:bg-white data-[state=on]:shadow"
              >
                Month
              </ToggleGroupItem>

              <ToggleGroupItem
                value="day"
                className="rounded-full px-4 data-[state=on]:bg-white data-[state=on]:shadow"
              >
                Day
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
