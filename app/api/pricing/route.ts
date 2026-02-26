import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BookingType } from "@/generated/prisma/enums"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const area = searchParams.get("area")

    if (!area) {
      return NextResponse.json(
        { success: false, error: "Area is required" },
        { status: 400 }
      )
    }

    // Validate area enum
    if (!Object.values(BookingType).includes(area as BookingType)) {
      return NextResponse.json(
        { success: false, error: "Invalid area" },
        { status: 400 }
      )
    }

    // Fetch pricing rows
    const pricingRows = await prisma.pricing.findMany({
      where: {
        area: area as BookingType,
      },
    })

    if (pricingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pricing not configured" },
        { status: 500 }
      )
    }

    // Extract prices
    const price30 = pricingRows.find(p => p.id === "em_30")?.price
    const price60 = pricingRows.find(p => p.id === "em_60")?.price
    const extendPrice = pricingRows.find(p => p.id === "em_extend")?.price

    if (!price30 || !price60 || !extendPrice) {
      return NextResponse.json(
        {
          success: false,
          error: "Incomplete pricing configuration",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prices: {
        price30: Number(price30),
        price60: Number(price60),
        extendPrice: Number(extendPrice),
      },
    })
  } catch (error) {
    console.error("Pricing API error:", error)
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}
