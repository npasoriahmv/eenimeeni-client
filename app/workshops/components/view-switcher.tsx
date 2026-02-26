"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") ?? "list";

  function updateView(v: string) {
    const p = new URLSearchParams(params);
    p.set("view", v);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(v) => v && updateView(v)}
      className="rounded-full border"
    >
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
    </ToggleGroup>
  );
}
