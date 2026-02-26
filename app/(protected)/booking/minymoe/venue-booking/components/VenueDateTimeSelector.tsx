"use client"

import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

/* ---------------- TYPES ---------------- */

type Rules = {
  openingTimeMinutes: number
  closingTimeMinutes: number
  minDurationMinutes: number
  durationStepMinutes: number
  slotIntervalMinutes: number
}

interface Props {
  date: Date | undefined
  startTime: string | null
  durationMinutes: number
  rules: Rules
  minDurationMinutesFromDB: number
  maxDurationMinutesFromDB: number
  onDateChange: (d: Date | undefined) => void
  onStartTimeChange: (t: string | null) => void
  onDurationChange: (m: number) => void
}

/* ---------------- HELPERS ---------------- */

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

const fromMinutes = (m: number) => {
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}`
}

/* ---------------- COMPONENT ---------------- */

export function VenueDateTimeSelector({
  date,
  startTime,
  durationMinutes,
  rules,
  minDurationMinutesFromDB,
  maxDurationMinutesFromDB,
  onDateChange,
  onStartTimeChange,
  onDurationChange,
}: Props) {
  const isToday =
    date && new Date().toDateString() === date.toDateString()

  /* ---------------- EFFECTIVE LIMITS ---------------- */

  const effectiveMinDuration = useMemo(() => {
    return Math.max(
      rules.minDurationMinutes,
      minDurationMinutesFromDB
    )
  }, [rules.minDurationMinutes, minDurationMinutesFromDB])

  const effectiveMaxDuration = useMemo(() => {
    if (!startTime) return maxDurationMinutesFromDB

    return Math.min(
      maxDurationMinutesFromDB,
      rules.closingTimeMinutes - toMinutes(startTime)
    )
  }, [
    startTime,
    rules.closingTimeMinutes,
    maxDurationMinutesFromDB,
  ])

  /* ---------------- AUTO-CLAMP DURATION ---------------- */

  useEffect(() => {
    if (!startTime) return

    if (durationMinutes < effectiveMinDuration) {
      onDurationChange(effectiveMinDuration)
      return
    }

    if (durationMinutes > effectiveMaxDuration) {
      onDurationChange(effectiveMaxDuration)
    }
  }, [
    startTime,
    durationMinutes,
    effectiveMinDuration,
    effectiveMaxDuration,
    onDurationChange,
  ])

  /* ---------------- TIME SLOTS ---------------- */

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    const lastStart =
      rules.closingTimeMinutes - effectiveMinDuration

    for (
      let t = rules.openingTimeMinutes;
      t <= lastStart;
      t += rules.slotIntervalMinutes
    ) {
      slots.push(fromMinutes(t))
    }

    return slots
  }, [rules, effectiveMinDuration])

  const filteredSlots = useMemo(() => {
    if (!date) return []

    let slots = [...timeSlots]

    if (isToday) {
      const now = new Date()
      const nowMins =
        now.getHours() * 60 + now.getMinutes()

      slots = slots.filter(
        (s) => toMinutes(s) >= nowMins
      )
    }

    return slots
  }, [timeSlots, isToday, date])

  /* ---------------- UI ---------------- */

  return (
    <Card className="p-6 space-y-6">
      <h3 className="font-medium">Date & Time</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DATE */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left",
                !date && "text-muted-foreground"
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {date ? date.toDateString() : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                onDateChange(d)
                onStartTimeChange(null)
              }}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>

        {/* TIME */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={!date}
              className={cn(
                "w-full justify-start text-left",
                !startTime && "text-muted-foreground"
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {startTime || "Select time"}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-48 p-2" align="start">
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredSlots.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={
                    startTime === t ? "default" : "ghost"
                  }
                  className="w-full justify-start font-mono"
                  onClick={() => onStartTimeChange(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* DURATION */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Duration
        </span>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onDurationChange(
                Math.max(
                  effectiveMinDuration,
                  durationMinutes -
                    rules.durationStepMinutes
                )
              )
            }
          >
            −
          </Button>

          <span className="min-w-[56px] text-center">
            {durationMinutes / 60}h
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const next =
                durationMinutes +
                rules.durationStepMinutes
              if (next <= effectiveMaxDuration) {
                onDurationChange(next)
              }
            }}
          >
            +
          </Button>
        </div>
      </div>
    </Card>
  )
}
