export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { WorkshopList } from "./components/workshop-list";
import { WorkshopMonth } from "./components/workshop-month";
import { WorkshopDay } from "./components/workshop-day";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    date?: string;
    month?: string;
  }>;
}) {
  const { view = "list", q, date, month } = await searchParams;

  return (
    <Suspense fallback={<div className="py-20 text-center">Loading workshops…</div>}>
      {view === "month" && <WorkshopMonth month={month} />}
      {view === "day" && <WorkshopDay date={date} />}
      {view === "list" && <WorkshopList query={q} />}
    </Suspense>
  );
}
