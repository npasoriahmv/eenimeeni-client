"use client"

import { useMemo, useState } from "react"
import { VenueDateTimeSelector } from "./VenueDateTimeSelector"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/* ---------------- TYPES ---------------- */

type VenueConfig = {
  minDurationHours: number
  maxDurationHours: number
  maxHeadcount: number | null
  price_per_hour: number
}

type VenueRules = {
  openingTimeMinutes: number
  closingTimeMinutes: number
  minDurationMinutes: number
  durationStepMinutes: number
  slotIntervalMinutes: number
}

/* ---------------- HELPERS ---------------- */

const combineDateAndTime = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

/* ---------------- COMPONENT ---------------- */

export default function VenueBookingForm({
  venueConfig,
  rules,
}: {
  venueConfig: VenueConfig
  rules: VenueRules
}) {
  const router = useRouter()

  /* ---------------- STATE ---------------- */

  const [date, setDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState<string | null>(null)

  // 🔑 duration is stored ONLY in minutes
  const [durationMinutes, setDurationMinutes] = useState(
    Math.max(
      rules.minDurationMinutes,
      venueConfig.minDurationHours * 60
    )
  )

  const [headcount, setHeadcount] = useState(1)
  const [loading, setLoading] = useState(false)

  /* ---------------- DERIVED ---------------- */

  const totalPrice = useMemo(() => {
    return (durationMinutes / 60) * venueConfig.price_per_hour
  }, [durationMinutes, venueConfig.price_per_hour])

  const isFormValid = Boolean(date && startTime)

  /* ---------------- ACTION ---------------- */

  const handleContinue = async () => {
    if (!date || !startTime) {
      toast.error("Please select date and time")
      return
    }

    if (
      venueConfig.maxHeadcount !== null &&
      headcount > venueConfig.maxHeadcount
    ) {
      toast.error(
        `Maximum allowed headcount is ${venueConfig.maxHeadcount}`
      )
      return
    }

    setLoading(true)

    try {
      const startDateTime = combineDateAndTime(date, startTime)
      const endDateTime = new Date(
        startDateTime.getTime() + durationMinutes * 60 * 1000
      )

      const payload = {
        startTime: startDateTime,
        endTime: endDateTime,
        durationMinutes,
        headcount,
        totalAmount: totalPrice,
        pricingSnap: {
          pricePerHour: venueConfig.price_per_hour,
          minDurationMinutes: venueConfig.minDurationHours * 60,
          maxDurationMinutes: venueConfig.maxDurationHours * 60,
          maxHeadcount: venueConfig.maxHeadcount,
        },
      }

      const res = await fetch("/api/icici/venue-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      })

      const data = await res.json()

      if (data.status === 200) {
        router.push(data.url)
      } else {
        toast.error(data.message || "Payment failed")
        setLoading(false)
      }
    } catch {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 py-24">
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <Link
          href="/booking/minymoe"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Packages
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4">

        <div className="mb-16 text-center">
          <h1 className="text-4xl font-semibold">Venue Booking</h1>
          <p className="mt-4 text-muted-foreground">
            Book our premium space in a few simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* LEFT */}
          <div className="space-y-8">
            <VenueDateTimeSelector
              date={date}
              startTime={startTime}
              durationMinutes={durationMinutes}
              rules={rules}
              minDurationMinutesFromDB={
                venueConfig.minDurationHours * 60
              }
              maxDurationMinutesFromDB={
                venueConfig.maxDurationHours * 60
              }
              onDateChange={setDate}
              onStartTimeChange={setStartTime}
              onDurationChange={setDurationMinutes}
            />

            {/* Headcount */}
            <Card className="p-6 rounded-2xl">
              <h3 className="font-medium mb-4">Headcount</h3>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Number of people
                </span>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHeadcount((h) => Math.max(1, h - 1))
                    }
                  >
                    −
                  </Button>

                  <span className="w-6 text-center">
                    {headcount}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      venueConfig.maxHeadcount !== null &&
                      headcount >= venueConfig.maxHeadcount
                    }
                    onClick={() =>
                      setHeadcount((h) => {
                        if (
                          venueConfig.maxHeadcount !== null &&
                          h >= venueConfig.maxHeadcount
                        ) {
                          return h
                        }
                        return h + 1
                      })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              {venueConfig.maxHeadcount !== null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Maximum allowed: {venueConfig.maxHeadcount}
                </p>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div>
            <Card className="p-8 rounded-2xl shadow-xl sticky top-24">
              <h3 className="text-xl font-semibold mb-6">
                Booking Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span>{date?.toDateString() || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Start</span>
                  <span>{startTime || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{durationMinutes / 60} hour(s)</span>
                </div>

                <div className="flex justify-between">
                  <span>Headcount</span>
                  <span>{headcount}</span>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>

              <Button
                className="mt-8 w-full rounded-xl"
                disabled={!isFormValid || loading}
                onClick={handleContinue}
              >
                {loading ? "Wait ..." : "Continue"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
