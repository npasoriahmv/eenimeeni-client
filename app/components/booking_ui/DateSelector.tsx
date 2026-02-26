"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateTimeSelectorProps {
  date: Date | undefined
  selectedTime: string | null
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
}

export function DateTimeSelector({
  date,
  selectedTime,
  onDateChange,
  onTimeChange,
}: DateTimeSelectorProps) {

  // Generate time slots from 09:00 to 20:30
  // Business hours (in minutes)
  const OPENING_MINUTES = 11 * 60 + 30 // 11:30
  const CLOSING_MINUTES = 20 * 60 + 30 // 20:30
  const SLOT_INTERVAL = 15
  const MIN_DURATION = 30

  // Generate valid start slots (last = 20:00)
  const timeSlots = Array.from(
    {
      length:
        (CLOSING_MINUTES - OPENING_MINUTES - MIN_DURATION) /
        SLOT_INTERVAL +
        1,
    },
    (_, i) => {
      const totalMinutes = OPENING_MINUTES + i * SLOT_INTERVAL
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60

      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    }
  )


  const bookedDates = [new Date(2025, 11, 15)]

  const getMaxDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d
  }

  // Round current time UP to next 15-minute slot
 const getNextAvailableSlot = () => {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const rounded =
    Math.ceil(nowMinutes / SLOT_INTERVAL) * SLOT_INTERVAL

  const effective =
    Math.max(rounded, OPENING_MINUTES)

  if (effective > CLOSING_MINUTES - MIN_DURATION) return null

  const h = Math.floor(effective / 60)
  const m = effective % 60

  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`
}


  const isToday =
    date && new Date().toDateString() === date.toDateString()

  const nextSlot = isToday ? getNextAvailableSlot() : null
  const lastSlot = timeSlots[timeSlots.length - 1]

  const visibleTimeSlots = (() => {
    if (!isToday) return timeSlots
    if (!nextSlot || nextSlot > lastSlot) return []
    return timeSlots.filter((time) => time >= nextSlot)
  })()

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Select Date & Time</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                disabled={{ before: new Date(), after: getMaxDate() }}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{
                  booked: "[&>button]:line-through",
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Time Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedTime && "text-muted-foreground"
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                {selectedTime || <span>Pick a time</span>}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0" align="start">
              <div className="max-h-72 overflow-y-auto p-2">
                {visibleTimeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No slots available for today
                  </p>
                ) : (
                  <div className="grid gap-1">
                    {visibleTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={
                          selectedTime === time ? "default" : "ghost"
                        }
                        onClick={() => onTimeChange(time)}
                        className="w-full justify-start font-mono text-sm"
                        size="sm"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  )
}
