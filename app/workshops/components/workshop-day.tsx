import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function WorkshopDay({ date }: { date?: string }) {
  const d = date ? new Date(date) : new Date();

  const workshops = await prisma.workShop.findMany({
    where: {
      startAt: {
        gte: new Date(d.setHours(0, 0, 0)),
        lt: new Date(d.setHours(23, 59, 59)),
      },
    },
  });

  if (!workshops.length) {
    return <p className="text-center py-20">No workshops today</p>;
  }

  return (
    <div className="space-y-4">
      {workshops.map((w) => (
        <div key={w.id} className="p-5 border rounded-xl">
          <h3 className="font-semibold">{w.title}</h3>
          <p className="text-sm text-muted-foreground">
            {format(w.startAt, "hh:mm a")} – {format(w.endAt, "hh:mm a")}
          </p>
        </div>
      ))}
    </div>
  );
}
