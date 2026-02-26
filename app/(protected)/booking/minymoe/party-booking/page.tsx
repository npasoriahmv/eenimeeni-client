export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import BookingFlow from "./components/BookingFlow"

const TOTAL_CAPACITY = 100
const TOTAL_MIN = 30
const SPLIT_MIN = 15

export default async function Page() {
  const [partyConfig, packages] = await Promise.all([
    prisma.partyBookingConfig.findFirst(),
    prisma.partyPackage.findMany({
      where: {
        id: {
          in: ["mm_bronze", "mm_silver", "mm_gold"],
        },
      },
      orderBy: {
        displayOrder: "asc", 
      },
    }),
  ])

  // if (!partyConfig) {
  //   throw new Error("Party booking config not found")
  // }

  if (packages.length !== 3) {
    throw new Error("Menu config not found")
  }

  return (
    <BookingFlow
      data={partyConfig}
      packages={packages}
    />
  )
}
