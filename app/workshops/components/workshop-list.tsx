import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export async function WorkshopList({ query }: { query?: string }) {
  const workshops = await prisma.workShop.findMany({
    where: {
      startAt: { gt: new Date() },
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { shortTagline: { contains: query, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { startAt: "asc" },
  });

  if (!workshops.length) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        No workshops found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {workshops.map((w) => (
        <Link
          key={w.id}
          href={`/workshops/${w.slug}`}
          className="
            group block rounded-2xl border bg-white
            hover:shadow-xl hover:border-primary/30
            transition-all
          "
        >
          <div className="flex flex-col md:flex-row gap-5 p-4 md:p-5">

            {/* IMAGE – ALWAYS VISIBLE */}
            <div className="relative w-full md:w-52 h-44 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={w.bannerImage}
                alt={w.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col justify-between flex-1 gap-3">

              {/* DATE */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="uppercase tracking-wide">
                  {format(w.startAt, "EEE")}
                </span>
                <span className="font-semibold text-foreground">
                  {format(w.startAt, "d MMM")} – {format(w.endAt, "d MMM yyyy")}
                </span>
              </div>

              {/* TITLE + PRICE */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg md:text-xl font-semibold leading-snug tracking-tight group-hover:text-primary transition">
                  {w.title}
                </h3>

                <span className="text-lg font-bold text-orange-600 whitespace-nowrap">
                  ₹{w.fee}
                </span>
              </div>

              {/* VENUE */}
              <p className="text-sm font-medium text-foreground">
                Inomi Creative Labs
                <span className="font-normal text-muted-foreground">
                  {" "}• Gurugram, Haryana
                </span>
              </p>

              {/* TAGLINE (VISIBLE ON MOBILE TOO) */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {w.shortTagline}
              </p>

              {/* META */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" className="rounded-full">
                  {w.ageGroup}
                </Badge>

                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Limited Seats
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
