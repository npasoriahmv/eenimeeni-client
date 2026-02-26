export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import BookingFlow from "./components/BookingFlow"

export default async function Page() {
  const [partyConfig, packages] = await Promise.all([
    prisma.partyBookingConfig.findFirst(),
    prisma.partyPackage.findMany({
      where: {
        id: {
          in: ["emmm_bronze", "emmm_silver", "emmm_gold"],
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
