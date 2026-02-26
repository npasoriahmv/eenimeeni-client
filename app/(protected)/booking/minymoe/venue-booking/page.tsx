import { prisma } from "@/lib/prisma"
import VenueBookingForm from "./components/VenueBookingForm"

export const dynamic = "force-dynamic"

export default async function VenueBookingPage() {
  const venueConfig = await prisma.venueConfig.findFirst({
    orderBy: { createdAt: "desc" },
  })

  if (!venueConfig) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No venue configuration found.
      </div>
    )
  }

  // 🔑 Single source of truth for timing rules
  const rules = {
    openingTimeMinutes: 11 * 60 + 30, // 11:30 AM
    closingTimeMinutes: 20 * 60 + 30, // 8:30 PM
    minDurationMinutes: 60,           // 1 hour absolute minimum
    durationStepMinutes: 30,          // 30-minute increments
    slotIntervalMinutes: 15,          // slot granularity
  }

  return (
    <VenueBookingForm
      venueConfig={{
        minDurationHours: venueConfig.minDurationHours,
        maxDurationHours: venueConfig.maxDurationHours,
        maxHeadcount: venueConfig.maxHeadcount,
        price_per_hour: venueConfig.price_per_hour,
      }}
      rules={rules}
    />
  )
}
