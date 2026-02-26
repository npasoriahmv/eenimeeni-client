"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface VenueDateTimeSelectorProps {
  date: Date | undefined
  startTime: string | null
  duration: number
  minDuration: number
  maxDuration: number
  onDateChange: (date: Date | undefined) => void
  onStartTimeChange: (time: string | null) => void
  onDurationChange: (duration: number) => void
}

// Working hours
const OPENING_TIME = 11 * 60 + 30 // 11:30
const CLOSING_TIME = 20 * 60 + 30 // 20:30

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`
}

export function MinyMoePartyDateAndTimeSelector({
  date,
  startTime,
  duration,
  minDuration,
  maxDuration,
  onDateChange,
  onStartTimeChange,
  onDurationChange,
}: VenueDateTimeSelectorProps) {

  const getMinSelectableDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 4)   // In future If I do this also with config then just I will replace this in db 
    d.setHours(0, 0, 0, 0)
    return d
  }

  const isToday =
    date && new Date().toDateString() === date.toDateString()

  const getNowMinutes = () => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }

  const getNextAvailableSlotMinutes = () => {
    const nowMins = getNowMinutes()
    const remainder = nowMins % 15
    return remainder === 0
      ? nowMins
      : nowMins + (15 - remainder)
  }

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let t = OPENING_TIME; t <= CLOSING_TIME; t += 15) {
      slots.push(fromMinutes(t))
    }
    return slots
  }, [])

  const filteredSlots = useMemo(() => {
    if (!date) return []

    let slots = [...timeSlots]

    // Prevent overflow past closing
    slots = slots.filter(
      (slot) => toMinutes(slot) + duration * 60 <= CLOSING_TIME
    )

    // Remove past slots if today
    if (isToday) {
      const nextSlot = getNextAvailableSlotMinutes()
      slots = slots.filter(
        (slot) => toMinutes(slot) >= nextSlot
      )
    }

    return slots
  }, [timeSlots, isToday, duration, date])

  const noSlotsAvailableToday =
    isToday && filteredSlots.length === 0

  const endTime = useMemo(() => {
    if (!startTime) return null
    return fromMinutes(toMinutes(startTime) + duration * 60)
  }, [startTime, duration])

  return (
    <Card className="p-6 rounded-2xl space-y-6">
      <h3 className="text-lg font-medium">Date & Time</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Date */}
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
              onSelect={(newDate) => {
                onDateChange(newDate)
                onStartTimeChange(null) // reset time when date changes
              }}
              disabled={{ before: getMinSelectableDate() }}
            />
          </PopoverContent>
        </Popover>

        {/* Time */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={!date || noSlotsAvailableToday}
              className={cn(
                "w-full justify-start text-left",
                !startTime && "text-muted-foreground"
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {!date
                ? "Select date first"
                : noSlotsAvailableToday
                  ? "No slots available"
                  : startTime || "Select time"}
            </Button>
          </PopoverTrigger>

          {date && !noSlotsAvailableToday && (
            <PopoverContent className="w-64 p-2" align="start">
              <div className="max-h-64 overflow-y-auto grid gap-1">
                {filteredSlots.map((time) => (
                  <Button
                    key={time}
                    size="sm"
                    variant={startTime === time ? "default" : "ghost"}
                    className="justify-start font-mono"
                    onClick={() => onStartTimeChange(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>

      {/* Duration */}
      {/* <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Duration (hours)
        </span>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onDurationChange(Math.max(minDuration, duration - 1))
            }
          >
            −
          </Button>
          <span className="w-6 text-center">{duration}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onDurationChange(Math.min(maxDuration, duration + 1))
            }
          >
            +
          </Button>
        </div>
      </div> */}

      {/* End time */}
      <div className="text-sm text-muted-foreground">
        End time:{" "}
        <span className="font-medium text-foreground">
          {endTime || "—"}
        </span>
      </div>

      {noSlotsAvailableToday && (
        <p className="text-sm text-destructive">
          No available slots left for today.
        </p>
      )}
    </Card>
  )
}
