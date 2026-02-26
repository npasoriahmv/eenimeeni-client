import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { formatISTDate, formatISTTime } from "@/lib/IST"

export default async function PlayzoneHistory() {
  const session = await auth()
  if (!session?.user.id) return null

  const payments = await prisma.payment.findMany({
    where: {
      userId: session.user.id,
      bookingId: { not: null },
    },
    include: {
      booking: {
        include: { children: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (payments.length === 0) {
    return <Empty label="No playzone bookings found" />
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-260px)] overflow-y-auto pr-2">
      {payments.map((p) => {
        const booking = p.booking!

        return (
          <Card
            key={p.id}
            className="relative overflow-hidden rounded-2xl border bg-background shadow-sm"
          >
            {/* STATUS STRIP */}
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                p.status === "SUCCESS"
                  ? "bg-green-500"
                  : p.status === "FAILED"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />

            <div className="p-6 space-y-4">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Playzone Booking #{booking.bookingId}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatISTDate(booking.date)} •{" "}
                    {formatISTTime(booking.startTime)} –{" "}
                    {formatISTTime(booking.endTime)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">
                    ₹ {p.amount.toString()}
                  </span>

                  <Badge
                    className={`px-3 py-1 text-xs ${
                      p.status === "SUCCESS"
                        ? "bg-green-600 text-white"
                        : p.status === "FAILED"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-500 text-black"
                    }`}
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <Detail
                  label="Children"
                  value={
                    booking.children.length > 0
                      ? booking.children.map((c) => c.name).join(", ")
                      : "—"
                  }
                />

                <Detail
                  label="Guest Children"
                  value={booking.guestChildren}
                />

                <Detail
                  label="Guardians"
                  value={booking.guardians}
                />

                <Detail
                  label="Booking Status"
                  value={booking.status}
                />

                <Detail
                  label="Payment Date"
                  value={formatISTDate(p.createdAt)}
                />

                <Detail
                  label="Transaction Ref"
                  value={p.merchantTxnNo}
                  mono
                />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function Detail({
  label,
  value,
  mono,
}: {
  label: string
  value: string | number
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-medium ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      {label}
    </div>
  )
}
