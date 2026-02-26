import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BookingType } from "@/generated/prisma/enums"

const OPENING_TIME_MINUTES = 11 * 60 + 30 // 690
const CLOSING_TIME_MINUTES = 20 * 60 + 30 // 1230

const MAX_DURATION = 300
const MAX_CHILDREN = 5
const MAX_COMPANIONS = 2

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      userId,
      type,
      date,
      startDateTime,
      childrenIds = [],
      guestChilderns = 0,
      guardians = 0,
      redeemPoints = 0,
      duration,
    } = body

    /* ---------------- USER ---------------- */

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { children: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    /* ---------------- CHILD VALIDATION ---------------- */

    if (childrenIds.length > 0) {
      const ownedIds = user.children.map(c => c.id)
      const invalid = childrenIds.some((id: string) => !ownedIds.includes(id))
      if (invalid) {
        return NextResponse.json(
          { error: "Invalid children selection detected" },
          { status: 400 }
        )
      }
    }

    if (guestChilderns < 0 || guestChilderns > MAX_CHILDREN) {
      return NextResponse.json(
        { error: "Invalid guest children count" },
        { status: 400 }
      )
    }

    if (guardians < 0 || guardians > MAX_COMPANIONS) {
      return NextResponse.json(
        { error: "Invalid guardians count" },
        { status: 400 }
      )
    }

    const totalChildren = childrenIds.length + guestChilderns
    if (totalChildren < 1) {
      return NextResponse.json(
        { error: "At least one child is required" },
        { status: 400 }
      )
    }

    /* ---------------- TIME VALIDATION ---------------- */

    const [sh, sm] = startDateTime.split(":").map(Number)
    const startMinutes = sh * 60 + sm

    if (
      startMinutes < OPENING_TIME_MINUTES ||
      startMinutes >= CLOSING_TIME_MINUTES
    ) {
      return NextResponse.json(
        { error: "Start time outside business hours (11:30 AM – 8:30 PM)" },
        { status: 400 }
      )
    }

    const endMinutes = startMinutes + duration

    if (endMinutes > CLOSING_TIME_MINUTES) {
      return NextResponse.json(
        { error: "End time exceeds closing time (8:30 PM)" },
        { status: 400 }
      )
    }


    /* ---------------- PRICING FROM DB ---------------- */

    const pricingRows = await prisma.pricing.findMany({
      where: { area: type as BookingType },
    })

    const price30 = pricingRows.find(p => p.id === "em_30")?.price
    const price60 = pricingRows.find(p => p.id === "em_60")?.price
    const extendPrice = pricingRows.find(p => p.id === "em_extend")?.price

    if (!price30 || !price60 || !extendPrice) {
      return NextResponse.json(
        { error: "Pricing configuration missing" },
        { status: 500 }
      )
    }

    const calcPricePerChild = () => {
      if (duration <= 30) return Number(price30)
      if (duration <= 60) return Number(price60)
      const extraSlots = Math.ceil((duration - 60) / 30)
      return Number(price60) + extraSlots * Number(extendPrice)
    }

    const pricePerChild = calcPricePerChild()
    const serverSubTotal = totalChildren * pricePerChild

    /* ---------------- LOYALTY POINTS ---------------- */

    const maxRedeemable = Math.floor(serverSubTotal / 1000) * 1000

    if (
      redeemPoints < 0 ||
      redeemPoints > maxRedeemable ||
      redeemPoints > user.loyaltyPoints
    ) {
      return NextResponse.json(
        { error: "Invalid redeem points" },
        { status: 400 }
      )
    }

    const serverTotal = Math.max(0, serverSubTotal - redeemPoints)

    /* ---------------- SUCCESS ---------------- */

    return NextResponse.json({
      success: true,
      pricing: {
        pricePerChild,
        subtotal: serverSubTotal,
        total: serverTotal,
      },
      currentPoints: user.loyaltyPoints,
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
